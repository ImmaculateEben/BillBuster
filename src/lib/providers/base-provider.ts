// Base provider interface for VTU services

export interface VTUProvider {
  id: string
  name: string
  category: 'airtime' | 'data' | 'electricity' | 'tv' | 'internet'
  isActive: boolean
  weight: number
  
  // Airtime methods
  purchaseAirtime?(network: string, phone: string, amount: number): Promise<VTUResponse>
  
  // Data methods
  getDataPlans?(network: string): Promise<DataPlan[]>
  purchaseData?(network: string, phone: string, planId: string): Promise<VTUResponse>
  
  // Bills methods
  validateMeter?(meterNumber: string, disco: string): Promise<MeterValidation>
  payBill?(service: string, itemCode: string, phone: string, amount: number): Promise<VTUResponse>
}

export interface VTUResponse {
  success: boolean
  reference?: string
  message?: string
  data?: Record<string, unknown>
  error?: string
}

export interface DataPlan {
  id: string
  name: string
  amount: number
  validity: string
  data: string
}

export interface MeterValidation {
  valid: boolean
  customerName?: string
  meterNumber?: string
  address?: string
  balance?: number
}

export interface ProviderHealth {
  providerId: string
  successRate: number
  avgResponseTime: number
  isHealthy: boolean
}

// Network codes
export const NETWORK_CODES = {
  mtn: ['MTN', 'mtn'],
  glo: ['GLO', 'glo'],
  airtel: ['AIRTEL', 'airtel', 'Airtel'],
  '9mobile': ['9MOBILE', '9mobile', 'Etisalat'],
} as const

// Disco codes for electricity
export const DISCO_CODES = {
  'ikeja-electric': ' Ikeja Electric',
  'eko-electric': 'Eko Electric',
  'phed': 'PHED',
  'jos-electric': 'Jos Electric',
  'kaduna-electric': 'Kaduna Electric',
  'kano-electric': 'Kano Electric',
  'port-harcourt-electric': 'Port Harcourt Electric',
} as const
