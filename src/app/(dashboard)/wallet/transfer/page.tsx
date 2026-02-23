'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Wallet {
  id: string
  balance: number
}

export default function TransferPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const fetchWallet = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', user.id)
          .single()
        if (data) setWallet(data)
      }
    }

    fetchWallet()
  }, [])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!wallet) return

    const transferAmount = parseFloat(amount)

    if (transferAmount < 100) {
      setError('Minimum transfer amount is NGN 100')
      return
    }

    if (transferAmount > wallet.balance) {
      setError('Insufficient balance')
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

      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id, email, phone, full_name')
        .or(`email.eq.${recipient},phone.eq.${recipient}`)
        .single()

      if (recipientError || !recipientData) {
        setError('Recipient not found')
        setLoading(false)
        return
      }

      if (recipientData.id === user.id) {
        setError('You cannot transfer to yourself')
        setLoading(false)
        return
      }

      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          recipient_id: recipientData.id,
          amount: transferAmount,
          note,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(transferAmount)
        setSuccessMsg(`Successfully transferred ${formattedAmount} to ${recipientData.full_name || recipientData.email}`)
        setRecipient('')
        setAmount('')
        setNote('')
        const { data: newWallet } = await supabase
          .from('wallets')
          .select('id, balance')
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
      <h1 className="text-3xl font-bold mb-8">Transfer</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardDescription>Available Balance</CardDescription>
          <CardTitle>{formatCurrency(wallet?.balance || 0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Money</CardTitle>
          <CardDescription>Transfer to another BillBuster user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-100 text-green-600 text-sm p-3 rounded-md">
                {successMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email or Phone</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="email@example.com or +2348000000000"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                type="text"
                placeholder="What is this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {amount && parseFloat(amount) > 0 && wallet && (
              <div className="text-sm text-muted-foreground">
                Recipient will receive: {formatCurrency(parseFloat(amount))}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !wallet || parseFloat(amount) > wallet.balance}
            >
              {loading ? 'Processing...' : 'Transfer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
