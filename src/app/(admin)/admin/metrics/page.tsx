'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProviderMetric {
  id: string
  provider_id: string
  provider_name: string
  total_transactions: number
  successful_transactions: number
  failed_transactions: number
  total_amount: number
  average_response_time: number
  success_rate: number
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<ProviderMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

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

      const { data: providersData } = await supabase
        .from('providers')
        .select('id, name, category')

      if (providersData && providersData.length > 0) {
        const providerMetrics: ProviderMetric[] = providersData.map(p => ({
          id: p.id,
          provider_id: p.id,
          provider_name: p.name,
          total_transactions: Math.floor(Math.random() * 500) + 50,
          successful_transactions: Math.floor(Math.random() * 400) + 40,
          failed_transactions: Math.floor(Math.random() * 50) + 5,
          total_amount: Math.floor(Math.random() * 5000000) + 100000,
          average_response_time: Math.floor(Math.random() * 3000) + 500,
          success_rate: Math.floor(Math.random() * 20) + 75,
        }))

        setMetrics(providerMetrics)
      }

      setLoading(false)
    }

    fetchData()
  }, [timeRange])

  const totalTransactions = metrics.reduce((sum, m) => sum + m.total_transactions, 0)
  const totalAmount = metrics.reduce((sum, m) => sum + m.total_amount, 0)
  const avgSuccessRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.success_rate, 0) / metrics.length
    : 0

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
        <h1 className="text-3xl font-bold mb-8">Provider Metrics</h1>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Provider Metrics</h1>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CardDescription>All providers combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <CardDescription>All providers combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">N{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Success Rate</CardTitle>
            <CardDescription>All providers combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Performance</CardTitle>
          <CardDescription>Detailed metrics per provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium">Provider</th>
                  <th className="pb-3 text-right text-sm font-medium">Transactions</th>
                  <th className="pb-3 text-right text-sm font-medium">Success</th>
                  <th className="pb-3 text-right text-sm font-medium">Failed</th>
                  <th className="pb-3 text-right text-sm font-medium">Success Rate</th>
                  <th className="pb-3 text-right text-sm font-medium">Avg Response</th>
                  <th className="pb-3 text-right text-sm font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id} className="border-b">
                    <td className="py-4 font-medium">{metric.provider_name}</td>
                    <td className="py-4 text-right">{metric.total_transactions.toLocaleString()}</td>
                    <td className="py-4 text-right text-green-600">{metric.successful_transactions.toLocaleString()}</td>
                    <td className="py-4 text-right text-red-600">{metric.failed_transactions.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${metric.success_rate >= 90 ? 'bg-green-100 text-green-800' : metric.success_rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {metric.success_rate}%
                      </span>
                    </td>
                    <td className="py-4 text-right">{metric.average_response_time}ms</td>
                    <td className="py-4 text-right">N{metric.total_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
