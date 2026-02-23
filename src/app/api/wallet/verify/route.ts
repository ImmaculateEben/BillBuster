import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get transaction record
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      // Update transaction as failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Get current wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', transaction.user_id)
      .single()

    const newBalance = (wallet?.balance || 0) + transaction.amount

    // Update wallet balance
    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', transaction.user_id)

    // Create wallet ledger entry
    await supabase.from('wallets_ledger').insert({
      wallet_id: wallet?.id,
      transaction_id: transaction.id,
      amount: transaction.amount,
      type: 'credit',
      balance_before: wallet?.balance || 0,
      balance_after: newBalance,
      description: 'Wallet funding via Paystack',
    })

    // Update transaction as completed
    await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transaction.id)

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: transaction.user_id,
      action: 'wallet_funded',
      entity_type: 'transaction',
      entity_id: transaction.id,
      metadata: { amount: transaction.amount, provider: 'paystack' },
    })

    return NextResponse.json({
      success: true,
      amount: transaction.amount,
      new_balance: newBalance,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
