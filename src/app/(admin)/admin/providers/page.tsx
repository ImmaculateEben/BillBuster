'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Provider {
  id: string
  name: string
  category: string
  base_url: string
  weight: number
  is_active: boolean
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newProvider, setNewProvider] = useState({
    name: '',
    category: 'airtime',
    api_key: '',
    base_url: '',
    weight: 10,
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

      const { data: providersData } = await supabase
        .from('providers')
        .select('*')
        .order('category')

      if (providersData) setProviders(providersData)
      setLoading(false)
    }

    fetchData()
  }, [])

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    const { supabase } = await import('@/lib/supabase/client')
    await supabase
      .from('providers')
      .update({ is_active: !currentStatus })
      .eq('id', providerId)

    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, is_active: !currentStatus } : p
    ))
  }

  const createProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase/client')

    const { error } = await supabase.from('providers').insert({
      name: newProvider.name,
      category: newProvider.category,
      api_key: newProvider.api_key,
      base_url: newProvider.base_url,
      weight: newProvider.weight,
      is_active: true,
    })

    if (!error) {
      const { data } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) setProviders([...providers, data])
      setShowCreate(false)
      setNewProvider({ name: '', category: 'airtime', api_key: '', base_url: '', weight: 10 })
    }
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
        <h1 className="text-3xl font-bold mb-8">Provider Management</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categories = ['airtime', 'data', 'electricity', 'tv', 'internet']

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Provider Management</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Add Provider'}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Provider</CardTitle>
            <CardDescription>Configure a new VTU provider</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createProvider} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    placeholder="Provider One"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newProvider.category}
                    onChange={(e) => setNewProvider({ ...newProvider, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={newProvider.api_key}
                    onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <Input
                    value={newProvider.base_url}
                    onChange={(e) => setNewProvider({ ...newProvider, base_url: e.target.value })}
                    placeholder="https://api.provider.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (1-100)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newProvider.weight}
                    onChange={(e) => setNewProvider({ ...newProvider, weight: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button type="submit">Add Provider</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryProviders = providers.filter(p => p.category === category)
          if (categoryProviders.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category} Providers</CardTitle>
                <CardDescription>{categoryProviders.length} provider(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-muted-foreground">{provider.base_url}</div>
                        <div className="text-xs text-muted-foreground">Weight: {provider.weight}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs ${provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {provider.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProviderStatus(provider.id, provider.is_active)}
                        >
                          {provider.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
