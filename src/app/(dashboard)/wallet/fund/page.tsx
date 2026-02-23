'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

export default function FundWalletPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFundWithPaystack = async () => {
    if (!amount || parseFloat(amount) < 100) {
      setError('Minimum amount is NGN 100')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: user.email,
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const paystack = new (window as any).PaystackPop()
        paystack.newTransaction({
          key: PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: parseFloat(amount) * 100,
          reference: data.reference,
          onSuccess: async (transaction: any) => {
            await fetch('/api/wallet/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: transaction.reference }),
            })
            router.push('/wallet?funded=true')
          },
          onCancel: () => {
            setLoading(false)
          },
        })
      }
    } catch {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  const handleFundWithFlutterwave = async () => {
    if (!amount || parseFloat(amount) < 100) {
      setError('Minimum amount is NGN 100')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/wallet/fund-flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: user.email,
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (data.link) {
        window.location.href = data.link
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  const presetAmounts = [500, 1000, 2000, 5000, 10000]

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Fund Wallet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Amount</CardTitle>
          <CardDescription>Minimum amount is NGN 100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(preset.toString())}
              >
                NGN {preset.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Payment Method</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={handleFundWithPaystack}
                disabled={loading || !amount}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Pay with Paystack'}
              </Button>
              <Button
                onClick={handleFundWithFlutterwave}
                disabled={loading || !amount}
                variant="outline"
                className="w-full"
              >
                Pay with Flutterwave
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Bank Transfer</p>
            <p>Transfer to: Zenith Bank - 1234567890 (BillBuster)</p>
            <p className="text-xs mt-1">Your wallet will be credited automatically within 5 minutes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
