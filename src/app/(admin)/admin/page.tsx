'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalUsers: number
  totalAgents: number
  totalFunded: number
  totalSales: number
  totalProfit: number
  failureRate: number
}

interface RecentTransaction {
  id: string
  type: string
  amount: number
  status: string
  user_id: string
  created_at: string
}

interface ProviderMetric {
  provider_id: string
  provider_name: string
  success_rate: number
  total_transactions: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentTx, setRecentTx] = useState<RecentTransaction[]>([])
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['super_admin', 'finance_admin'].includes(profile.role)) {
        setLoading(false)
        return
      }

      setRole(profile.role)

      // Fetch stats
      const [usersRes, agentsRes, txRes, fundedRes, profitRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('agents').select('id', { count: 'exact' }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('transactions').select('amount').eq('type', 'wallet_funding').eq('status', 'completed'),
        supabase.from('transactions').select('amount').eq('status', 'completed'),
      ])

      const transactions = txRes.data || []
      const totalFunded = (fundedRes.data || []).reduce((sum, tx) => sum + tx.amount, 0)
      const totalSales = (transactions.filter(t => ['airtime_purchase', 'data_purchase', 'bill_payment'].includes(t.type)).reduce((sum, tx) => sum + tx.amount, 0))
      const totalProfit = totalSales * 0.05 // 5% profit margin
      const failed = transactions.filter(t => t.status === 'failed').length
      const failureRate = transactions.length > 0 ? (failed / transactions.length) * 100 : 0

      setStats({
        totalUsers: usersRes.count || 0,
        totalAgents: agentsRes.count || 0,
        totalFunded,
        totalSales,
        totalProfit,
        failureRate,
      })

      setRecentTx(transactions.slice(0, 10))

      // Fetch provider metrics
      const { data: metrics } = await supabase
        .from('provider_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)

      if (metrics && metrics.length > 0) {
        const { data: providers } = await supabase.from('providers').select('id, name')
        
        const enrichedMetrics = metrics.map(m => ({
          provider_id: m.provider_id,
          provider_name: providers?.find(p => p.id === m.provider_id)?.name || 'Unknown',
          success_rate: m.success_rate,
          total_transactions: m.total_transactions,
        }))
        setProviderMetrics(enrichedMetrics)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      failed: 'text-red-600',
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

  if (!role) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalUsers || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Agents</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalAgents || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Funded</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats?.totalFunded || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats?.totalSales || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit (est.)</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats?.totalProfit || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failure Rate</CardDescription>
            <CardTitle className="text-2xl">{(stats?.failureRate || 0).toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest platform transactions</CardDescription>
            </div>
            <Link href="/admin/transactions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTx.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium capitalize text-sm">{tx.type.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(tx.amount)}</div>
                      <div className={`text-xs capitalize ${getStatusColor(tx.status)}`}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Provider Performance</CardTitle>
              <CardDescription>Success rates by provider</CardDescription>
            </div>
            <Link href="/admin/providers">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {providerMetrics.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No metrics available.</p>
            ) : (
              <div className="space-y-4">
                {providerMetrics.map((metric) => (
                  <div key={metric.provider_id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{metric.provider_name}</span>
                      <span>{metric.success_rate.toFixed(1)}% success</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.success_rate > 90 ? 'bg-green-500' : metric.success_rate > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${metric.success_rate}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.total_transactions} transactions
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/users">
          <Button variant="outline" className="w-full h-20">Manage Users</Button>
        </Link>
        <Link href="/admin/agents">
          <Button variant="outline" className="w-full h-20">Manage Agents</Button>
        </Link>
        <Link href="/admin/kyc">
          <Button variant="outline" className="w-full h-20">KYC Queue</Button>
        </Link>
        <Link href="/admin/wallets">
          <Button variant="outline" className="w-full h-20">Wallets</Button>
        </Link>
      </div>
    </div>
  )
}
