'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Wallet {
  id: string
  user_id: string
  balance: number
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      const { data: { user } } = await import('@supabase/supabase-js').then(m => 
        import('@/lib/supabase/client').then(s => s.supabase.auth.getUser())
      ).catch(() => ({ data: { user: null } }))

      if (user) {
        const { supabase } = await import('@/lib/supabase/client')
        const { data } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (data) setWallet(data)
      }
      setLoading(false)
    }

    fetchWallet()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-4xl">{formatCurrency(wallet?.balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link href="/wallet/fund">
                <Button>Fund Wallet</Button>
              </Link>
              <Link href="/wallet/transfer">
                <Button variant="outline">Transfer</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/wallet/history" className="block">
              <Button variant="outline" className="w-full justify-start">
                View Transaction History
              </Button>
            </Link>
            <Link href="/wallet/fund" className="block">
              <Button variant="outline" className="w-full justify-start">
                Fund with Card
              </Button>
            </Link>
            <Link href="/wallet/fund" className="block">
              <Button variant="outline" className="w-full justify-start">
                Bank Transfer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Fund Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="font-medium">Fund with Debit Card</h3>
              <p className="text-sm text-muted-foreground">Use your Visa or Mastercard to fund instantly via Paystack or Flutterwave.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-medium">Bank Transfer</h3>
              <p className="text-sm text-muted-foreground">Transfer to our virtual account and your wallet will be credited automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
