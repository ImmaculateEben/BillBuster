'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ServicesPage() {
  const services = [
    {
      title: 'Airtime',
      description: 'Buy airtime for MTN, Glo, Airtel, and 9mobile',
      href: '/services/airtime',
      icon: '📱',
    },
    {
      title: 'Data Bundles',
      description: 'Get affordable data plans for all networks',
      href: '/services/data',
      icon: '📶',
    },
    {
      title: 'Electricity',
      description: 'Pay electricity bills for all disco companies',
      href: '/services/bills/electricity',
      icon: '⚡',
    },
    {
      title: 'TV Subscription',
      description: 'Renew DSTV, GOtv, and Startimes subscriptions',
      href: '/services/bills/tv',
      icon: '📺',
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Our Services</h1>
      <p className="text-muted-foreground mb-8">Choose a service to get started</p>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Link key={service.href} href={service.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{service.icon}</span>
                  <div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-primary font-medium">Get Started →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
