'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Agent {
  id: string
  user_id: string
  commission_rate: number
  api_key: string | null
  is_active: boolean
}

interface Wallet {
  balance: number
}

interface SubAgent {
  id: string
  user_id: string
  email: string
  full_name: string
  commission_rate: number
  is_active: boolean
}

interface Transaction {
  id: string
  amount: number
  type: string
  created_at: string
}

export default function AgentDashboardPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [subAgents, setSubAgents] = useState<SubAgent[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Fetch agent data
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (agentData) {
        setAgent(agentData)

        // Fetch wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        if (walletData) setWallet(walletData)

        // Fetch sub-agents
        const { data: subAgentsData } = await supabase
          .from('agents')
          .select('id, user_id, commission_rate, is_active')
          .eq('parent_id', agentData.id)

        if (subAgentsData && subAgentsData.length > 0) {
          // Get sub-agent profile details
          const subAgentIds = subAgentsData.map(sa => sa.user_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', subAgentIds)

          const enrichedSubAgents = subAgentsData.map(sa => ({
            ...sa,
            email: profiles?.find(p => p.id === sa.user_id)?.email || '',
            full_name: profiles?.find(p => p.id === sa.user_id)?.full_name || '',
          }))
          setSubAgents(enrichedSubAgents)
        }

        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (transactions) setRecentTransactions(transactions)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
  }

  const generateApiKey = async () => {
    const newKey = 'BB_AGENT_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    const { supabase } = await import('@/lib/supabase/client')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && agent) {
      await supabase
        .from('agents')
        .update({ api_key: newKey })
        .eq('id', agent.id)
      
      setAgent({ ...agent, api_key: newKey })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You are not an agent yet.</p>
            <Button>Apply to become an Agent</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Wallet Balance</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(wallet?.balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/agent/wallet">
              <Button>Fund Wallet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Commission Rate</CardDescription>
            <CardTitle className="text-3xl">{agent.commission_rate}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Sub-Agents</CardDescription>
            <CardTitle className="text-3xl">{subAgents.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/agent/sub-agents">
              <Button variant="outline">Manage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* API Key */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Use your API key to integrate with your systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <code className="bg-muted px-4 py-2 rounded flex-1 font-mono">
              {agent.api_key || 'No API key generated'}
            </code>
            <Button onClick={generateApiKey} variant="outline">
              {agent.api_key ? 'Regenerate' : 'Generate Key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-agents */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sub-Agents</CardTitle>
            <CardDescription>Manage your sub-agents</CardDescription>
          </div>
          <Link href="/agent/sub-agents/create">
            <Button>Add Sub-Agent</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {subAgents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sub-agents yet.</p>
          ) : (
            <div className="space-y-3">
              {subAgents.map((subAgent) => (
                <div key={subAgent.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{subAgent.full_name || subAgent.email}</div>
                    <div className="text-sm text-muted-foreground">Rate: {subAgent.commission_rate}%</div>
                  </div>
                  <div className={`text-sm ${subAgent.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {subAgent.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium capitalize">{tx.type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(tx.created_at)}</div>
                  </div>
                  <div className="font-medium">{formatCurrency(tx.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
