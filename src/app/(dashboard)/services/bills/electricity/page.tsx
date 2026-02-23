'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Disco = 'ikeja-electric' | 'eko-electric' | 'phed' | 'jos-electric' | 'kaduna-electric'

interface Wallet {
  balance: number
}

const DISCO_OPTIONS: { value: Disco; label: string }[] = [
  { value: 'ikeja-electric', label: 'Ikeja Electric' },
  { value: 'eko-electric', label: 'Eko Electric' },
  { value: 'phed', label: 'PHED' },
  { value: 'jos-electric', label: 'Jos Electric' },
  { value: 'kaduna-electric', label: 'Kaduna Electric' },
]

export default function ElectricityPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [disco, setDisco] = useState<Disco | ''>('')
  const [meterNumber, setMeterNumber] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [customerInfo, setCustomerInfo] = useState<{ name: string; address: string } | null>(null)

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

  const validateMeter = async () => {
    if (!disco || !meterNumber) {
      setError('Please select disco and enter meter number')
      return
    }

    setValidating(true)
    setError('')
    setCustomerInfo(null)

    try {
      const response = await fetch('/api/services/electricity/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disco, meterNumber, meterType }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.customer) {
        setCustomerInfo(data.customer)
      }
    } catch {
      setError('Failed to validate meter number')
    }

    setValidating(false)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!disco || !meterNumber || !amount || !phone) {
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

      const response = await fetch('/api/services/electricity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          disco,
          meterNumber,
          meterType,
          amount: parseFloat(amount),
          phone,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Electricity paid successfully! Token: ${data.token || 'N/A'}, Ref: ${data.reference}`)
        setAmount('')
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

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Pay Electricity Bill</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardDescription>Wallet Balance</CardDescription>
          <CardTitle>{formatCurrency(wallet?.balance || 0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Electricity Payment</CardTitle>
          <CardDescription>Enter meter details to pay your electricity bill</CardDescription>
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
              <Label>Select Distribution Company</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {DISCO_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={disco === option.value ? 'default' : 'outline'}
                    onClick={() => { setDisco(option.value); setCustomerInfo(null); }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Meter Type</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={meterType === 'prepaid' ? 'default' : 'outline'}
                  onClick={() => setMeterType('prepaid')}
                >
                  Prepaid
                </Button>
                <Button
                  type="button"
                  variant={meterType === 'postpaid' ? 'default' : 'outline'}
                  onClick={() => setMeterType('postpaid')}
                >
                  Postpaid
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meterNumber">Meter Number</Label>
              <div className="flex gap-2">
                <Input
                  id="meterNumber"
                  type="text"
                  placeholder="Enter meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={validateMeter} disabled={validating || !disco}>
                  {validating ? 'Validating...' : 'Validate'}
                </Button>
              </div>
            </div>

            {customerInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium">{customerInfo.name}</p>
                <p className="text-sm text-muted-foreground">{customerInfo.address}</p>
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
              disabled={loading || !disco || !meterNumber || !amount || !phone || !wallet || parseFloat(amount) > wallet.balance}
            >
              {loading ? 'Processing...' : 'Pay Bill'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
