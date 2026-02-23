import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateReference() {
  return 'BB_TRF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_id, recipient_id, amount, note } = body

    if (!sender_id || !recipient_id || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const reference = generateReference()

    // Get sender wallet
    const { data: senderWallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', sender_id)
      .single()

    if (walletError || !senderWallet) {
      return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 })
    }

    // Check sufficient balance
    if (senderWallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Get recipient wallet
    const { data: recipientWallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', recipient_id)
      .single()

    if (!recipientWallet) {
      return NextResponse.json({ error: 'Recipient wallet not found' }, { status: 404 })
    }

    // Create debit transaction for sender
    await supabase.from('transactions').insert({
      user_id: sender_id,
      type: 'wallet_transfer',
      amount,
      status: 'completed',
      reference,
      metadata: { recipient_id, note, direction: 'out' },
    })

    // Create credit transaction for recipient
    await supabase.from('transactions').insert({
      user_id: recipient_id,
      type: 'wallet_transfer',
      amount,
      status: 'completed',
      reference: reference + '_RCP',
      metadata: { sender_id, note, direction: 'in' },
    })

    // Update sender wallet (debit)
    await supabase
      .from('wallets')
      .update({ balance: senderWallet.balance - amount })
      .eq('user_id', sender_id)

    // Update recipient wallet (credit)
    await supabase
      .from('wallets')
      .update({ balance: (recipientWallet.balance || 0) + amount })
      .eq('user_id', recipient_id)

    // Create ledger entries
    await supabase.from('wallets_ledger').insert([
      {
        wallet_id: senderWallet.id,
        amount,
        type: 'debit',
        balance_before: senderWallet.balance,
        balance_after: senderWallet.balance - amount,
        description: `Transfer to user ${recipient_id}` + (note ? `: ${note}` : ''),
      },
      {
        wallet_id: recipientWallet.id,
        amount,
        type: 'credit',
        balance_before: recipientWallet.balance,
        balance_after: (recipientWallet.balance || 0) + amount,
        description: `Transfer from user ${sender_id}` + (note ? `: ${note}` : ''),
      },
    ])

    // Create audit logs
    await supabase.from('audit_logs').insert([
      {
        user_id: sender_id,
        action: 'wallet_transfer_sent',
        entity_type: 'transaction',
        metadata: { amount, recipient_id, reference },
      },
      {
        user_id: recipient_id,
        action: 'wallet_transfer_received',
        entity_type: 'transaction',
        metadata: { amount, sender_id, reference: reference + '_RCP' },
      },
    ])

    return NextResponse.json({
      success: true,
      reference,
      amount,
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
