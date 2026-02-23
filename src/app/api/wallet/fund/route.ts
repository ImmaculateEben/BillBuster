import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateReference() {
  return 'BB_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, user_id } = body

    if (!amount || !email || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const reference = generateReference()

    // Create payment record in database
    const supabase = getSupabaseAdmin()
    const { error: insertError } = await supabase.from('transactions').insert({
      user_id,
      type: 'wallet_funding',
      amount,
      status: 'pending',
      provider: 'paystack',
      reference,
      metadata: { email, payment_initiated: true },
    })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack uses kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?funded=true`,
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
    }

    return NextResponse.json({
      reference,
      authorization_url: paystackData.data.authorization_url,
    })
  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
