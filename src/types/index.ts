// User roles
export type UserRole = 'user' | 'agent' | 'sub_agent' | 'super_admin' | 'finance_admin'

// KYC levels
export type KYCLevel = 'basic' | 'intermediate' | 'full'

// Transaction types
export type TransactionType = 
  | 'airtime_purchase' 
  | 'data_purchase' 
  | 'bill_payment' 
  | 'wallet_funding' 
  | 'wallet_transfer' 
  | 'wallet_debit'
  | 'refund'
  | 'commission'

// Transaction status
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

// Service categories
export type ServiceCategory = 'airtime' | 'data' | 'electricity' | 'tv' | 'internet'

// Network providers
export type NetworkProvider = 'mtn' | 'glo' | 'airtel' | '9mobile'

// TV providers
export type TVProvider = 'dstv' | 'gotv' | 'startimes'

// User interface
export interface User {
  id: string
  email: string
  phone: string
  full_name: string
  role: UserRole
  kyc_level: KYCLevel
  kyc_status: 'pending' | 'approved' | 'rejected'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Wallet interface
export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

// Transaction interface
export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  provider: string
  service: string
  reference: string
  phone: string
  network?: NetworkProvider
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Provider interface
export interface Provider {
  id: string
  name: string
  category: ServiceCategory
  api_key: string
  base_url: string
  weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Provider metrics
export interface ProviderMetrics {
  id: string
  provider_id: string
  success_rate: number
  avg_response_time: number
  total_transactions: number
  successful_transactions: number
  failed_transactions: number
  date: string
}

// Agent interface
export interface Agent {
  id: string
  user_id: string
  parent_id?: string
  commission_rate: number
  api_key?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// KYC application
export interface KYCApplication {
  id: string
  user_id: string
  level: KYCLevel
  bvn?: string
  id_type?: string
  id_number?: string
  document_url?: string
  selfie_url?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

// Rate limit
export interface RateLimit {
  id: string
  user_id: string
  endpoint: string
  count: number
  window_start: string
}

// Audit log
export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  created_at: string
}
