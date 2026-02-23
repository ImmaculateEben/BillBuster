'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type TVProvider = 'dstv' | 'gotv' | 'startimes'

interface Wallet {
  balance: number
}

interface TVPlan {
  id: string
  name: string
  amount: number
  validity: string
}

const TV_PROVIDERS: { value: TVProvider; label: string }[] = [
  { value: 'dstv', label: 'DSTV' },
  { value: 'gotv', label: 'GOtv' },
  { value: 'startimes', label: 'Startimes' },
]

const TV_PLANS: Record<TVProvider, TVPlan[]> = {
  dstv: [
    { id: 'dstv_access', name: 'DStv Access', amount: 2700, validity: '30 days' },
    { id: 'dstv_family', name: 'DStv Family', amount: 5000, validity: '30 days' },
    { id: 'dstv_complimentary', name: 'DStv Complimentary', amount: 2500, validity: '30 days' },
    { id: 'dstv_premium', name: 'DStv Premium', amount: 21000, validity: '30 days' },
    { id: 'dstv_super', name: 'DStv Super', amount: 14600, validity: '30 days' },
  ],
  gotv: [
    { id: 'gotv_lite', name: 'GOtv Lite', amount: 900, validity: '30 days' },
    { id: 'gotv_value', name: 'GOtv Value', amount: 2400, validity: '30 days' },
    { id: 'gotv_plus', name: 'GOtv Plus', amount: 4600, validity: '30 days' },
    { id: 'gotv_max', name: 'GOtv Max', amount: 7200, validity: '30 days' },
  ],
  startimes: [
    { id: 'startimes_nova', name: 'Nova', amount: 900, validity: '30 days' },
    { id: 'startimes_basic', name: 'Basic', amount: 1900, validity: '30 days' },
    { id: 'startimes_classic', name: 'Classic', amount: 2900, validity: '30 days' },
    { id: 'startimes_super', name: 'Super', amount: 5000, validity: '30 days' },
  ],
}

export default function TVPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [provider, setProvider] = useState<TVProvider | ''>('')
  const [smartCard, setSmartCard] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<TVPlan | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subscriberInfo, setSubscriberInfo] = useState<{ name: string } | null>(null)

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

  const validateSmartCard = async () => {
    if (!provider || !smartCard) {
      setError('Please select provider and enter smart card number')
      return
    }

    setValidating(true)
    setError('')
    setSubscriberInfo(null)

    try {
      const response = await fetch('/api/services/tv/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, smartCardNumber: smartCard }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.subscriber) {
        setSubscriberInfo(data.subscriber)
      }
    } catch {
      setError('Failed to validate smart card number')
    }

    setValidating(false)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!provider || !smartCard || !selectedPlan || !phone) {
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

      const response = await fetch('/api/services/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          provider,
          smartCardNumber: smartCard,
          plan_id: selectedPlan.id,
          amount: selectedPlan.amount,
          phone,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Subscription renewed successfully! Ref: ${data.reference}`)
        setSmartCard('')
        setSelectedPlan(null)
        setPhone('')
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

  const plans = provider ? TV_PLANS[provider] : []

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">TV Subscription</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardDescription>Wallet Balance</CardDescription>
          <CardTitle>{formatCurrency(wallet?.balance || 0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Renew Subscription</CardTitle>
          <CardDescription>Select TV provider and choose a package</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-6">
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
              <Label>Select TV Provider</Label>
              <div className="grid grid-cols-3 gap-3">
                {TV_PROVIDERS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={provider === option.value ? 'default' : 'outline'}
                    onClick={() => { setProvider(option.value); setSelectedPlan(null); setSubscriberInfo(null); }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smartCard">Smart Card Number / IUC Number</Label>
              <div className="flex gap-2">
                <Input
                  id="smartCard"
                  type="text"
                  placeholder="Enter smart card number"
                  value={smartCard}
                  onChange={(e) => setSmartCard(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={validateSmartCard} disabled={validating || !provider}>
                  {validating ? 'Validating...' : 'Validate'}
                </Button>
              </div>
            </div>

            {subscriberInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium">Subscriber: {subscriberInfo.name}</p>
              </div>
            )}

            {provider && (
              <div className="space-y-3">
                <Label>Select Package</Label>
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
                          <div className="text-sm text-muted-foreground">{plan.validity}</div>
                        </div>
                        <div className="font-bold">{formatCurrency(plan.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

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
              disabled={loading || !provider || !smartCard || !selectedPlan || !phone || !wallet || (selectedPlan && selectedPlan.amount > wallet.balance)}
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
