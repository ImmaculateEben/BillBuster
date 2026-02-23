import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executeWithFallback, getProvidersByCategory, VTUProvider, VTUResponse } from '@/lib/providers/routing'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateReference() {
  return 'BB_DATA_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

// Mock data providers
const mockDataProviders: VTUProvider[] = [
  {
    id: 'data_provider_1',
    name: 'Data Provider One',
    category: 'data',
    isActive: true,
    weight: 50,
    async purchaseData(network: string, phone: string, planId: string): Promise<VTUResponse> {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'DP1_' + generateReference(),
          message: 'Data purchased successfully',
        }
      }
      return { success: false, error: 'Data Provider One failed' }
    },
  },
  {
    id: 'data_provider_2',
    name: 'Data Provider Two',
    category: 'data',
    isActive: true,
    weight: 30,
    async purchaseData(network: string, phone: string, planId: string): Promise<VTUResponse> {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'DP2_' + generateReference(),
          message: 'Data purchased successfully',
        }
      }
      return { success: false, error: 'Data Provider Two failed' }
    },
  },
  {
    id: 'data_provider_3',
    name: 'Data Provider Three',
    category: 'data',
    isActive: true,
    weight: 20,
    async purchaseData(network: string, phone: string, planId: string): Promise<VTUResponse> {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'DP3_' + generateReference(),
          message: 'Data purchased successfully',
        }
      }
      return { success: false, error: 'Data Provider Three failed' }
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, network, phone, plan_id, amount } = body

    if (!user_id || !network || !phone || !plan_id || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum amount is NGN 100' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user_id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const reference = generateReference()

    // Create pending transaction
    await supabase.from('transactions').insert({
      user_id,
      type: 'data_purchase',
      amount,
      status: 'processing',
      provider: 'data',
      reference,
      phone,
      network,
      metadata: { network, phone, plan_id, amount },
    })

    try {
      const providers = getProvidersByCategory(mockDataProviders, 'data')

      const result = await executeWithFallback<VTUResponse>(
        providers,
        async (provider) => {
          return provider.purchaseData!(network, phone, plan_id)
        },
        async (failedProvider, error) => {
          console.log(`Data provider ${failedProvider.name} failed:`, error.message)
          await supabase.from('audit_logs').insert({
            user_id,
            action: 'data_provider_failed',
            entity_type: 'transaction',
            entity_id: reference,
            metadata: { provider: failedProvider.name, error: error.message },
          })
        }
      )

      // Deduct from wallet
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('user_id', user_id)

      // Create wallet ledger
      await supabase.from('wallets_ledger').insert({
        wallet_id: wallet.id,
        amount,
        type: 'debit',
        balance_before: wallet.balance,
        balance_after: wallet.balance - amount,
        description: `Data purchase - ${network.toUpperCase()} ${plan_id}`,
      })

      // Update transaction as completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('reference', reference)

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id,
        action: 'data_purchased',
        entity_type: 'transaction',
        entity_id: reference,
        metadata: { network, phone, plan_id, amount, provider_response: result },
      })

      return NextResponse.json({
        success: true,
        reference,
        amount,
        message: 'Data purchased successfully',
      })
    } catch (providerError) {
      console.error('All data providers failed:', providerError)

      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('reference', reference)

      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Data purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
