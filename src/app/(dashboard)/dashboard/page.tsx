'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

interface Wallet {
  id: string
  user_id: string
  balance: number
}

interface RecentTransaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (walletData) {
          setWallet(walletData)
        }

        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (transactions) {
          setRecentTransactions(transactions)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [])

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
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      airtime_purchase: 'Airtime',
      data_purchase: 'Data',
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
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      failed: 'text-red-600',
      refunded: 'text-gray-600',
    }
    return colors[status] || ''
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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Wallet Balance */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wallet Balance</CardDescription>
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
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/services/airtime">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">&#x1F4F1;</div>
              <div className="font-medium">Buy Airtime</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/services/data">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">&#x1F4BB;</div>
              <div className="font-medium">Buy Data</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/services/bills/electricity">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">&#x26A1;</div>
              <div className="font-medium">Pay Bills</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/services/bills/tv">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">&#x1F4FA;</div>
              <div className="font-medium">TV Subscription</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions yet. Start by funding your wallet or making a purchase.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {getTransactionTypeLabel(transaction.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/transactions">
              <Button variant="outline" className="w-full">View All Transactions</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
