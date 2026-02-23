import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executeWithFallback, getProvidersByCategory, selectProviderByWeight, VTUProvider, VTUResponse } from '@/lib/providers/routing'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateReference() {
  return 'BB_AIRTIME_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

// Mock provider implementations - replace with actual provider APIs
const mockProviders: VTUProvider[] = [
  {
    id: 'provider_1',
    name: 'Provider One',
    category: 'airtime',
    isActive: true,
    weight: 50,
    async purchaseAirtime(network: string, phone: string, amount: number): Promise<VTUResponse> {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // 80% success rate for demo
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'P1_' + generateReference(),
          message: 'Airtime purchased successfully',
        }
      }
      return { success: false, error: 'Provider One failed' }
    },
  },
  {
    id: 'provider_2',
    name: 'Provider Two',
    category: 'airtime',
    isActive: true,
    weight: 30,
    async purchaseAirtime(network: string, phone: string, amount: number): Promise<VTUResponse> {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'P2_' + generateReference(),
          message: 'Airtime purchased successfully',
        }
      }
      return { success: false, error: 'Provider Two failed' }
    },
  },
  {
    id: 'provider_3',
    name: 'Provider Three',
    category: 'airtime',
    isActive: true,
    weight: 20,
    async purchaseAirtime(network: string, phone: string, amount: number): Promise<VTUResponse> {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (Math.random() > 0.2) {
        return {
          success: true,
          reference: 'P3_' + generateReference(),
          message: 'Airtime purchased successfully',
        }
      }
      return { success: false, error: 'Provider Three failed' }
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, network, phone, amount } = body

    if (!user_id || !network || !phone || !amount) {
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
      type: 'airtime_purchase',
      amount,
      status: 'processing',
      provider: 'airtime',
      reference,
      phone,
      network,
      metadata: { network, phone, amount },
    })

    try {
      // Get active airtime providers
      const providers = getProvidersByCategory(mockProviders, 'airtime')

      // Execute with fallback
      const result = await executeWithFallback<VTUResponse>(
        providers,
        async (provider) => {
          return provider.purchaseAirtime!(network, phone, amount)
        },
        async (failedProvider, error) => {
          console.log(`Provider ${failedProvider.name} failed:`, error.message)
          // Log to audit
          await supabase.from('audit_logs').insert({
            user_id,
            action: 'airtime_provider_failed',
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
        description: `Airtime purchase - ${network.toUpperCase()}`,
      })

      // Update transaction as completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('reference', reference)

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id,
        action: 'airtime_purchased',
        entity_type: 'transaction',
        entity_id: reference,
        metadata: { network, phone, amount, provider_response: result },
      })

      return NextResponse.json({
        success: true,
        reference,
        amount,
        message: 'Airtime purchased successfully',
      })
    } catch (providerError) {
      // All providers failed
      console.error('All providers failed:', providerError)

      // Update transaction as failed
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
    console.error('Airtime purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
