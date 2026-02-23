'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  reference: string
  created_at: string
}

export default function WalletHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchTransactions = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query = query.eq('type', filter)
        }

        const { data } = await query.limit(50)
        if (data) setTransactions(data)
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [filter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      airtime_purchase: 'Airtime Purchase',
      data_purchase: 'Data Purchase',
      bill_payment: 'Bill Payment',
      wallet_funding: 'Wallet Funding',
      wallet_transfer: 'Transfer',
      wallet_debit: 'Debit',
      refund: 'Refund',
      commission: 'Commission',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const transactionTypes = [
    { value: 'all', label: 'All' },
    { value: 'wallet_funding', label: 'Funding' },
    { value: 'wallet_transfer', label: 'Transfers' },
    { value: 'airtime_purchase', label: 'Airtime' },
    { value: 'data_purchase', label: 'Data' },
    { value: 'bill_payment', label: 'Bills' },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map((type) => (
              <Button
                key={type.value}
                variant={filter === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {getTransactionTypeLabel(transaction.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ref: {transaction.reference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {transaction.type.includes('funding') || transaction.type.includes('refund') || transaction.type.includes('commission')
                        ? '+'
                        : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
