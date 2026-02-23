'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KYCApplication {
  id: string
  user_id: string
  level: string
  bvn: string | null
  id_type: string | null
  id_number: string | null
  document_url: string | null
  status: string
  created_at: string
  user_email?: string
  user_name?: string
}

export default function AdminKYCUeuePage() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
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

      // Fetch KYC applications with user details
      const { data: kycData } = await supabase
        .from('kyc_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (kycData && kycData.length > 0) {
        const userIds = kycData.map(k => k.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        const enriched = kycData.map(kyc => ({
          ...kyc,
          user_email: profiles?.find(p => p.id === kyc.user_id)?.email,
          user_name: profiles?.find(p => p.id === kyc.user_id)?.full_name,
        }))
        setApplications(enriched)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleKYC = async (applicationId: string, approved: boolean) => {
    const { supabase } = await import('@/lib/supabase/client')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('kyc_applications')
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    // Update user's KYC level if approved
    const application = applications.find(a => a.id === applicationId)
    if (approved && application) {
      await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          kyc_level: application.level,
        })
        .eq('id', application.user_id)
    }

    setApplications(applications.filter(a => a.id !== applicationId))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
        <h1 className="text-3xl font-bold mb-8">KYC Queue</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Access denied.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">KYC Approval Queue</h1>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending KYC applications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{app.user_name || app.user_email}</CardTitle>
                  <p className="text-sm text-muted-foreground">{app.user_email}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {app.level} - Pending
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">BVN</p>
                    <p className="font-mono">{app.bvn || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Type</p>
                    <p>{app.id_type ? `${app.id_type} - ${app.id_number}` : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => handleKYC(app.id, true)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleKYC(app.id, false)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
