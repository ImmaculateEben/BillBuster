'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RateLimit {
  id: string
  endpoint_pattern: string
  method: string
  max_requests: number
  window_seconds: number
  is_active: boolean
}

export default function AdminRateLimitsPage() {
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newLimit, setNewLimit] = useState({
    endpoint_pattern: '/api/',
    method: 'POST',
    max_requests: 100,
    window_seconds: 60,
  })

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

      if (!profile || profile.role !== 'super_admin') {
        setLoading(false)
        return
      }

      setRole(profile.role)

      const { data: limitsData } = await supabase
        .from('rate_limits')
        .select('*')
        .order('endpoint_pattern')

      if (limitsData) setRateLimits(limitsData)
      setLoading(false)
    }

    fetchData()
  }, [])

  const toggleLimitStatus = async (limitId: string, currentStatus: boolean) => {
    const { supabase } = await import('@/lib/supabase/client')
    await supabase
      .from('rate_limits')
      .update({ is_active: !currentStatus })
      .eq('id', limitId)

    setRateLimits(rateLimits.map(l =>
      l.id === limitId ? { ...l, is_active: !currentStatus } : l
    ))
  }

  const createRateLimit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase/client')

    const { error } = await supabase.from('rate_limits').insert({
      endpoint_pattern: newLimit.endpoint_pattern,
      method: newLimit.method,
      max_requests: newLimit.max_requests,
      window_seconds: newLimit.window_seconds,
      is_active: true,
    })

    if (!error) {
      const { data } = await supabase
        .from('rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) setRateLimits([...rateLimits, data])
      setShowCreate(false)
      setNewLimit({ endpoint_pattern: '/api/', method: 'POST', max_requests: 100, window_seconds: 60 })
    }
  }

  const deleteRateLimit = async (limitId: string) => {
    const { supabase } = await import('@/lib/supabase/client')
    await supabase.from('rate_limits').delete().eq('id', limitId)
    setRateLimits(rateLimits.filter(l => l.id !== limitId))
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
        <h1 className="text-3xl font-bold mb-8">Rate Limiting</h1>
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
        <h1 className="text-3xl font-bold">Rate Limiting</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Add Rule'}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Rate Limit Rule</CardTitle>
            <CardDescription>Configure rate limiting for API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRateLimit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint Pattern</Label>
                  <Input
                    value={newLimit.endpoint_pattern}
                    onChange={(e) => setNewLimit({ ...newLimit, endpoint_pattern: e.target.value })}
                    placeholder="/api/services/airtime"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newLimit.method}
                    onChange={(e) => setNewLimit({ ...newLimit, method: e.target.value })}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Max Requests</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newLimit.max_requests}
                    onChange={(e) => setNewLimit({ ...newLimit, max_requests: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Window (seconds)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newLimit.window_seconds}
                    onChange={(e) => setNewLimit({ ...newLimit, window_seconds: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <Button type="submit">Add Rule</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Rate Limit Rules</CardTitle>
          <CardDescription>API endpoints with rate limiting configured</CardDescription>
        </CardHeader>
        <CardContent>
          {rateLimits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rate limit rules configured</p>
          ) : (
            <div className="space-y-4">
              {rateLimits.map((limit) => (
                <div key={limit.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-mono text-sm">{limit.endpoint_pattern}</div>
                    <div className="text-sm text-muted-foreground">
                      {limit.method} - {limit.max_requests} requests / {limit.window_seconds}s
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs ${limit.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {limit.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLimitStatus(limit.id, limit.is_active)}
                    >
                      {limit.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => deleteRateLimit(limit.id)}
                    >
                      Delete
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
