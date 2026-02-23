'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SubAgent {
  id: string
  user_id: string
  email: string
  full_name: string
  commission_rate: number
  is_active: boolean
}

export default function SubAgentsPage() {
  const router = useRouter()
  const [agent, setAgent] = useState<{ id: string } | null>(null)
  const [subAgents, setSubAgents] = useState<SubAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [email, setEmail] = useState('')
  const [commissionRate, setCommissionRate] = useState('5')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agentData) {
        setLoading(false)
        return
      }

      setAgent(agentData)

      // Fetch sub-agents
      const { data: subAgentsData } = await supabase
        .from('agents')
        .select('id, user_id, commission_rate, is_active')
        .eq('parent_id', agentData.id)

      if (subAgentsData && subAgentsData.length > 0) {
        const subAgentIds = subAgentsData.map(sa => sa.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', subAgentIds)

        const enriched = subAgentsData.map(sa => ({
          ...sa,
          email: profiles?.find(p => p.id === sa.user_id)?.email || '',
          full_name: profiles?.find(p => p.id === sa.user_id)?.full_name || '',
        }))
        setSubAgents(enriched)
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const createSubAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)

    try {
      const { supabase } = await import('@/lib/supabase/client')

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!existingUser) {
        setError('User not found. They must register first.')
        setCreating(false)
        return
      }

      // Create sub-agent
      const { error: insertError } = await supabase.from('agents').insert({
        user_id: existingUser.id,
        parent_id: agent?.id,
        commission_rate: parseFloat(commissionRate),
        is_active: true,
      })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess('Sub-agent added successfully!')
        setEmail('')
        setCommissionRate('5')
        setShowCreate(false)
        // Refresh list
        window.location.reload()
      }
    } catch {
      setError('An error occurred')
    }

    setCreating(false)
  }

  const toggleSubAgentStatus = async (subAgentId: string, currentStatus: boolean) => {
    const { supabase } = await import('@/lib/supabase/client')
    await supabase
      .from('agents')
      .update({ is_active: !currentStatus })
      .eq('id', subAgentId)

    setSubAgents(subAgents.map(sa => 
      sa.id === subAgentId ? { ...sa, is_active: !currentStatus } : sa
    ))
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
        <h1 className="text-3xl font-bold mb-8">Sub-Agents</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You are not an agent.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sub-Agents</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Add Sub-Agent'}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Sub-Agent</CardTitle>
            <CardDescription>Enter the user's email to add them as a sub-agent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSubAgent} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? 'Adding...' : 'Add Sub-Agent'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Sub-Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {subAgents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No sub-agents yet. Add your first sub-agent to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {subAgents.map((subAgent) => (
                <div key={subAgent.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">{subAgent.full_name || subAgent.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Commission Rate: {subAgent.commission_rate}%
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${subAgent.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {subAgent.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSubAgentStatus(subAgent.id, subAgent.is_active)}
                    >
                      {subAgent.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
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
