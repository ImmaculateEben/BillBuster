'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Network = 'mtn' | 'glo' | 'airtel' | '9mobile'

interface Wallet {
  balance: number
}

const NETWORK_VARIANTS = {
  mtn: { label: 'MTN', color: 'bg-yellow-500' },
  glo: { label: 'GLO', color: 'bg-green-500' },
  airtel: { label: 'AIRTEL', color: 'bg-red-500' },
  '9mobile': { label: '9MOBILE', color: 'bg-blue-500' },
}

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

export default function AirtimePage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [network, setNetwork] = useState<Network | ''>('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchWallet = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        if (data) setWallet(data)
      }
    }

    fetchWallet()
  }, [])

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!network || !phone || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (!wallet || wallet.balance < parseFloat(amount)) {
      setError('Insufficient wallet balance')
      return
    }

    setLoading(true)

    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/services/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          network,
          phone,
          amount: parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Airtime purchased successfully! Ref: ${data.reference}`)
        setPhone('')
        setAmount('')
        // Refresh wallet
        const { data: newWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        if (newWallet) setWallet(newWallet)
      }
    } catch {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt)
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Buy Airtime</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardDescription>Wallet Balance</CardDescription>
          <CardTitle>{formatCurrency(wallet?.balance || 0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Airtime</CardTitle>
          <CardDescription>Select network and enter amount</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePurchase} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-600 text-sm p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <Label>Select Network</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(NETWORK_VARIANTS) as Network[]).map((net) => (
                  <Button
                    key={net}
                    type="button"
                    variant={network === net ? 'default' : 'outline'}
                    className={`${network === net ? '' : 'border-2'}`}
                    onClick={() => setNetwork(net)}
                  >
                    {NETWORK_VARIANTS[net].label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  {formatCurrency(preset)}
                </Button>
              ))}
            </div>

            {amount && parseFloat(amount) > 0 && wallet && (
              <div className="text-sm text-muted-foreground">
                Cost: {formatCurrency(parseFloat(amount))}
                {parseFloat(amount) > wallet.balance && (
                  <span className="text-destructive ml-2">(Insufficient balance)</span>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !network || !phone || !amount || !wallet || parseFloat(amount) > wallet.balance}
            >
              {loading ? 'Processing...' : 'Purchase Airtime'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
