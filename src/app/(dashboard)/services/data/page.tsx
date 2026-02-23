'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Network = 'mtn' | 'glo' | 'airtel' | '9mobile'

interface DataPlan {
  id: string
  name: string
  amount: number
  validity: string
  data: string
}

interface Wallet {
  balance: number
}

const NETWORK_VARIANTS = {
  mtn: { label: 'MTN', color: 'bg-yellow-500' },
  glo: { label: 'GLO', color: 'bg-green-500' },
  airtel: { label: 'AIRTEL', color: 'bg-red-500' },
  '9mobile': { label: '9MOBILE', color: 'bg-blue-500' },
}

const MOCK_PLANS: Record<Network, DataPlan[]> = {
  mtn: [
    { id: 'mtn_500mb', name: 'MTN 500MB', amount: 500, validity: '30 days', data: '500MB' },
    { id: 'mtn_1gb', name: 'MTN 1GB', amount: 1000, validity: '30 days', data: '1GB' },
    { id: 'mtn_2gb', name: 'MTN 2GB', amount: 2000, validity: '30 days', data: '2GB' },
    { id: 'mtn_5gb', name: 'MTN 5GB', amount: 5000, validity: '30 days', data: '5GB' },
    { id: 'mtn_10gb', name: 'MTN 10GB', amount: 10000, validity: '30 days', data: '10GB' },
  ],
  glo: [
    { id: 'glo_500mb', name: 'GLO 500MB', amount: 480, validity: '30 days', data: '500MB' },
    { id: 'glo_1gb', name: 'GLO 1GB', amount: 960, validity: '30 days', data: '1GB' },
    { id: 'glo_2gb', name: 'GLO 2GB', amount: 1920, validity: '30 days', data: '2GB' },
    { id: 'glo_5gb', name: 'GLO 5GB', amount: 4800, validity: '30 days', data: '5GB' },
  ],
  airtel: [
    { id: 'airtel_500mb', name: 'Airtel 500MB', amount: 500, validity: '30 days', data: '500MB' },
    { id: 'airtel_1gb', name: 'Airtel 1GB', amount: 1000, validity: '30 days', data: '1GB' },
    { id: 'airtel_2gb', name: 'Airtel 2GB', amount: 2000, validity: '30 days', data: '2GB' },
    { id: 'airtel_5gb', name: 'Airtel 5GB', amount: 5000, validity: '30 days', data: '5GB' },
  ],
  '9mobile': [
    { id: '9mobile_500mb', name: '9Mobile 500MB', amount: 450, validity: '30 days', data: '500MB' },
    { id: '9mobile_1gb', name: '9Mobile 1GB', amount: 900, validity: '30 days', data: '1GB' },
    { id: '9mobile_2gb', name: '9Mobile 2GB', amount: 1800, validity: '30 days', data: '2GB' },
    { id: '9mobile_5gb', name: '9Mobile 5GB', amount: 4500, validity: '30 days', data: '5GB' },
  ],
}

export default function DataPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [network, setNetwork] = useState<Network | ''>('')
  const [phone, setPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
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

    if (!network || !phone || !selectedPlan) {
      setError('Please fill in all fields')
      return
    }

    if (!wallet || wallet.balance < selectedPlan.amount) {
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

      const response = await fetch('/api/services/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          network,
          phone,
          plan_id: selectedPlan.id,
          amount: selectedPlan.amount,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Data purchased successfully! Ref: ${data.reference}`)
        setPhone('')
        setSelectedPlan(null)
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

  const plans = network ? MOCK_PLANS[network] : []

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Buy Data</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardDescription>Wallet Balance</CardDescription>
          <CardTitle>{formatCurrency(wallet?.balance || 0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Data Bundle</CardTitle>
          <CardDescription>Select network and choose a plan</CardDescription>
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
                    onClick={() => { setNetwork(net); setSelectedPlan(null); }}
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

            {network && (
              <div className="space-y-3">
                <Label>Select Data Plan</Label>
                <div className="grid gap-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlan?.id === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.data} - {plan.validity}
                          </div>
                        </div>
                        <div className="font-bold">{formatCurrency(plan.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPlan && wallet && (
              <div className="text-sm text-muted-foreground">
                Cost: {formatCurrency(selectedPlan.amount)}
                {selectedPlan.amount > wallet.balance && (
                  <span className="text-destructive ml-2">(Insufficient balance)</span>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !network || !phone || !selectedPlan || !wallet || (selectedPlan && selectedPlan.amount > wallet.balance)}
            >
              {loading ? 'Processing...' : 'Purchase Data'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
