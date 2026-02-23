import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Demo accounts for testing
const DEMO_ACCOUNTS = [
  {
    email: 'demo@billbuster.com',
    password: 'Demo@123',
    full_name: 'Demo User',
    phone: '+2348000000001',
    role: 'user',
    kyc_level: 'basic',
    initial_balance: 50000,
  },
  {
    email: 'admin@billbuster.com',
    password: 'Admin@123',
    full_name: 'Super Admin',
    phone: '+2348000000002',
    role: 'super_admin',
    kyc_level: 'full',
    initial_balance: 100000,
  },
  {
    email: 'agent@billbuster.com',
    password: 'Agent@123',
    full_name: 'Demo Agent',
    phone: '+2348000000003',
    role: 'agent',
    kyc_level: 'intermediate',
    initial_balance: 75000,
  },
]

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const results: { email: string; status: string; error?: string }[] = []

    for (const account of DEMO_ACCOUNTS) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', account.email)
          .single()

        if (existingUser) {
          results.push({
            email: account.email,
            status: 'already_exists',
          })
          continue
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name,
            phone: account.phone,
          },
        })

        if (authError) {
          results.push({
            email: account.email,
            status: 'error',
            error: authError.message,
          })
          continue
        }

        const userId = authData.user.id

        // Create profile
        await supabase.from('profiles').insert({
          id: userId,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          role: account.role,
          kyc_level: account.kyc_level,
        })

        // Create wallet with initial balance
        await supabase.from('wallets').insert({
          user_id: userId,
          balance: account.initial_balance,
        })

        // If agent, create agent record
        if (account.role === 'agent') {
          await supabase.from('agents').insert({
            id: userId,
            user_id: userId,
            agent_code: `AGENT${Math.floor(Math.random() * 10000)}`,
            commission_rate: 2.5,
            status: 'active',
          })
        }

        results.push({
          email: account.email,
          status: 'created',
        })
      } catch (err: any) {
        results.push({
          email: account.email,
          status: 'error',
          error: err.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts processed',
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
