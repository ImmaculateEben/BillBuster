# BillBuster Architecture Plan

## 1. Feature Checklist

### 1.1 Authentication and Authorization
- [ ] User registration with email/phone
- [ ] User login with email or phone + password
- [ ] Social authentication (Google, GitHub)
- [ ] Password reset flow
- [ ] Email/phone verification
- [ ] Role-based access control (Users, Agents, Sub-agents, Super Admin, Finance Admin)
- [ ] Session management with Supabase Auth
- [ ] JWT token refresh handling
- [ ] Protected routes based on user roles
- [ ] Two-factor authentication (2FA) - optional per user

### 1.2 KYC System
- [ ] KYC Level 1: Basic (email + phone verification) - N50,000 limit
- [ ] KYC Level 2: Intermediate (BVN verification) - N200,000 limit
- [ ] KYC Level 3: Full (ID card upload + selfie) - Unlimited
- [ ] KYC document upload to Supabase Storage
- [ ] KYC approval workflow by admin
- [ ] Transaction limit enforcement per KYC level

### 1.3 Wallet System
- [ ] Wallet creation on user registration
- [ ] Wallet balance display
- [ ] Fund wallet via Paystack (card payment)
- [ ] Fund wallet via Flutterwave (card payment)
- [ ] Fund wallet via bank transfer (virtual account)
- [ ] Wallet-to-wallet transfer
- [ ] Peer-to-peer transfer
- [ ] Agent wallet management (for agents)
- [ ] Sub-agent wallet management (for sub-agents)
- [ ] Wallet transaction history
- [ ] Wallet statement generation
- [ ] Auto-rollback on failed transactions

### 1.4 Airtime VTU
- [ ] MTN airtime purchase
- [ ] Glo airtime purchase
- [ ] Airtel airtime purchase
- [ ] 9mobile airtime purchase
- [ ] Airtime discount for agents
- [ ] Bulk airtime purchase
- [ ] Airtime transaction history
- [ ] Provider fallback routing (3+ providers)
- [ ] Weighted provider selection
- [ ] Real-time transaction status

### 1.5 Data VTU
- [ ] MTN data bundle purchase
- [ ] Glo data bundle purchase
- [ ] Airtel data bundle purchase
- [ ] 9mobile data bundle purchase
- [ ] Data plan browsing by network
- [ ] Data discount for agents
- [ ] Auto-subscribe data plans
- [ ] Data rollover management
- [ ] Bulk data purchase
- [ ] Data transaction history
- [ ] Provider fallback routing
- [ ] Data balance check API integration

### 1.6 Bills Payment
- [ ] Electricity bill payment ( Ikeja Electric, Eko Electric, PHED, etc.)
- [ ] DSTV subscription
- [ ] GOtv subscription
- [ ] Startimes subscription
- [ ] Smile Internet payment
- [ ] Spectranet payment
- [ ] Swift TV subscription
- [ ] Bill transaction history
- [ ] Meter number validation
- [ ] IUC number validation
- [ ] Smart card number validation

### 1.7 Agent Management
- [ ] Agent registration
- [ ] Agent dashboard
- [ ] Agent commission tracking
- [ ] Sub-agent creation by agents
- [ ] Sub-agent management
- [ ] Agent wallet funding
- [ ] Agent transaction reports
- [ ] Agent API key generation
- [ ] Agent API usage tracking

### 1.8 Admin Dashboard
- [ ] Super Admin login
- [ ] Finance Admin login
- [ ] User management
- [ ] Agent management
- [ ] KYC approval queue
- [ ] Transaction monitoring
- [ ] Provider configuration
- [ ] Commission settings
- [ ] Service pricing management
- [ ] Revenue reports
- [ ] Wallet management (manual credit/debit)
- [ ] System settings
- [ ] Audit logs

### 1.9 Provider Integration
- [ ] Provider API abstraction layer
- [ ] 3+ providers per service category
- [ ] Weighted routing algorithm
- [ ] Automatic failover on provider failure
- [ ] Provider health monitoring
- [ ] Provider transaction logs
- [ ] Provider balance tracking
- [ ] Provider API response caching

### 1.10 Notifications
- [ ] In-app notifications
- [ ] Email notifications
- [ ] SMS notifications (via provider)
- [ ] Push notifications
- [ ] Transaction alerts
- [ ] KYC status updates
- [ ] Wallet funding confirmations

### 1.11 Provider Scalability
- [ ] Dynamic provider registration in database
- [ ] Provider CRUD API endpoints
- [ ] Provider enable/disable toggle
- [ ] Provider service assignment
- [ ] Provider priority configuration
- [ ] Provider pricing/markup rules
- [ ] Provider performance metrics tracking
- [ ] Success rate per provider
- [ ] Response time per provider
- [ ] Auto-routing based on performance (future)
- [ ] New provider onboarding without code deploy
- [ ] Service category expansion without code changes

### 1.12 Security Model
- [ ] Supabase Row Level Security (RLS) policies
- [ ] Users can only see their own data
- [ ] Admins can see all data
- [ ] No public access to financial data
- [ ] Provider API keys server-side only
- [ ] Wallet mutations via server actions only
- [ ] Payment verification server-side only
- [ ] Rate limiting per user per minute
- [ ] Rate limits stored in rate_limits table
- [ ] Rate limit exceeded response
- [ ] Audit logging for funding events
- [ ] Audit logging for purchases
- [ ] Audit logging for refunds
- [ ] Audit logging for admin actions
- [ ] Audit logging for reconciliation events

### 1.13 Admin Panel - Dashboard
- [ ] Total funded amount display
- [ ] Total sales amount display
- [ ] Profit summary calculation
- [ ] Transaction failure rate percentage
- [ ] Provider performance metrics
- [ ] Real-time dashboard updates
- [ ] Date range filters

### 1.14 Admin Panel - Providers
- [ ] Provider list view
- [ ] Add new provider form
- [ ] Edit provider configuration
- [ ] Disable/enable provider toggle
- [ ] Assign services to provider
- [ ] Set provider priority/weight
- [ ] Set provider markup rules
- [ ] Provider API credentials management

### 1.15 Admin Panel - Transactions
- [ ] All transactions view
- [ ] Transaction search and filters
- [ ] Transaction requery functionality
- [ ] Transaction refund capability
- [ ] Transaction audit trail
- [ ] Export transactions to CSV

### 1.16 Admin Panel - Users
- [ ] User list view
- [ ] Freeze/unfreeze user account
- [ ] View user transaction history
- [ ] View user wallet balance
- [ ] Manual wallet adjustment
- [ ] View user KYC status

### 1.17 User Features
- [ ] User dashboard
- [ ] Transaction history
- [ ] Wallet funding
- [ ] Profile management
- [ ] Change password
- [ ] Support ticket creation
- [ ] Referral system
- [ ] API key for power users (optional)

---

## 2. Route Map

### 2.1 Public Routes
```
/                         - Landing page
/login                    - Login page
/register                 - Registration page
/forgot-password          - Password reset request
/reset-password/[token]   - Password reset form
/verify-email/[token]     - Email verification
/verify-phone/[token]     - Phone verification
/pricing                  - Pricing page
/about                    - About us
/contact                  - Contact page
/faq                      - FAQ page
/terms                    - Terms of service
/privacy                  - Privacy policy
```

### 2.2 User Routes (Authenticated)
```
/dashboard                - User dashboard (default after login)
/wallet                   - Wallet overview
/wallet/fund              - Fund wallet
/wallet/transfer          - Transfer to user
/wallet/history           - Transaction history
/services                 - All VTU services
/services/airtime         - Airtime purchase
/services/data            - Data purchase
/services/bills           - Bills payment
/services/electricity     - Electricity payment
/services/tv             - TV subscription
/transactions             - All transactions
/transactions/[id]        - Transaction details
/profile                  - User profile
/profile/kyc              - KYC application
/profile/security         - Security settings
/profile/notifications    - Notification preferences
/support                  - Support tickets
/support/new              - Create ticket
/support/[id]             - Ticket details
/referrals                - Referral program
```

### 2.3 Agent Routes
```
/agent/dashboard          - Agent dashboard
/agent/wallet             - Agent wallet
/agent/wallet/fund        - Fund agent wallet
/agent/wallet/transfer    - Transfer to sub-agent or user
/agent/sub-agents         - Sub-agent management
/agent/sub-agents/create - Create sub-agent
/agent/transactions       - Agent transactions
/agent/commissions        - Commission history
/agent/api-keys           - API key management
/agent/settings           - Agent settings
/agent/reports            - Sales reports
```

### 2.4 Admin Routes
```
/admin                         - Dashboard (total funded, sales, profit, failure rate)
/admin/providers               - Provider list with add/edit/disable
/admin/providers/add            - Add new provider
/admin/providers/[id]          - Provider configuration and metrics
/admin/providers/[id]/edit     - Edit provider
/admin/services                - Service management and pricing
/admin/services/[id]           - Service configuration
/admin/pricing                 - Markup rules configuration
/admin/transactions            - All transactions with filters
/admin/transactions/[id]       - Transaction details
/admin/transactions/requery    - Transaction requery
/admin/transactions/refund     - Transaction refund
/admin/transactions/export     - Export transactions
/admin/users                   - User management
/admin/users/[id]              - User details
/admin/users/[id]/freeze       - Freeze/unfreeze user
/admin/users/[id]/transactions - User transaction history
/admin/agents                 - Agent management
/admin/agents/[id]            - Agent details
/admin/kyc                    - KYC approval queue
/admin/kyc/[id]               - KYC review
/admin/wallets                 - Wallet management
/admin/wallets/[id]           - Wallet operations (credit/debit)
/admin/wallets/[id]/history   - Wallet transaction history
/admin/reports                - Financial reports
/admin/audit-logs             - System audit logs
/admin/settings               - System settings
/admin/support                - Support ticket management
```

### 2.5 API Routes (Server-side)
```
/api/auth/callback         - Auth callback handlers
/api/auth/refresh          - Token refresh
/api/wallet/fund           - Wallet funding initiation
/api/wallet/verify         - Payment verification
/api/wallet/transfer       - Wallet transfer
/api/airtime/purchase      - Airtime purchase
/api/data/purchase         - Data purchase
/api/bills/payment         - Bills payment
/api/providers/webhook     - Provider webhooks
/api/admin/users           - Admin user CRUD
/api/admin/wallets        - Admin wallet operations
/api/webhooks/paystack    - Paystack webhooks
/api/webhooks/flutterwave - Flutterwave webhooks
```

---

## 3. File Tree Structure

```
billbuster/
├── .env.example
├── .gitignore
├── next.config.js
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── README.md
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── admin-layout.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── password-reset-form.tsx
│   ├── wallet/
│   │   ├── wallet-balance.tsx
│   │   ├── fund-wallet-form.tsx
│   │   ├── transfer-form.tsx
│   │   └── transaction-list.tsx
│   ├── services/
│   │   ├── airtime-form.tsx
│   │   ├── data-form.tsx
│   │   ├── bill-form.tsx
│   │   ├── network-selector.tsx
│   │   ├── plan-selector.tsx
│   │   └── service-card.tsx
│   ├── kyc/
│   │   ├── kyc-form.tsx
│   │   ├── kyc-status.tsx
│   │   └── document-upload.tsx
│   ├── admin/
│   │   ├── user-table.tsx
│   │   ├── transaction-table.tsx
│   │   ├── kyc-queue.tsx
│   │   ├── provider-config.tsx
│   │   ├── provider-form.tsx
│   │   ├── stats-cards.tsx
│   │   ├── dashboard-charts.tsx
│   │   ├── audit-log-table.tsx
│   │   └── user-actions.tsx
│   └── providers/
│       ├── provider-card.tsx
│       └── provider-status.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-wallet.ts
│   │   └── use-services.ts
│   ├── security/
│   │   ├── rls-policies.ts
│   │   ├── rate-limiter.ts
│   │   ├── audit-logger.ts
│   │   └── provider-key-manager.ts
│   ├── providers/
│   │   ├── base-provider.ts
│   │   ├── provider-factory.ts
│   │   ├── provider-registry.ts
│   │   ├── health-monitor.ts
│   │   ├── performance-tracker.ts
│   │   └── routing/
│   │       ├── weighted-routing.ts
│   │       └── failover-routing.ts
│   └── services/
│       ├── service-registry.ts
│       └── service-factory.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── wallet/
│   │   │   ├── page.tsx
│   │   │   ├── fund/
│   │   │   │   └── page.tsx
│   │   │   ├── transfer/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   ├── airtime/
│   │   │   │   └── page.tsx
│   │   │   ├── data/
│   │   │   │   └── page.tsx
│   │   │   └── bills/
│   │   │       ├── page.tsx
│   │   │       ├── electricity/
│   │   │       │   └── page.tsx
│   │   │       └── tv/
│   │   │           └── page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── kyc/
│   │   │   │   └── page.tsx
│   │   │   └── security/
│   │   │       └── page.tsx
│   │   └── support/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── (agent)/
│   │   ├── agent/
│   │   │   └── page.tsx
│   │   ├── agent/wallet/
│   │   ├── agent/sub-agents/
│   │   └── agent/reports/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── admin/users/
│   │   ├── admin/agents/
│   │   ├── admin/kyc/
│   │   ├── admin/transactions/
│   │   ├── admin/providers/
│   │   ├── admin/services/
│   │   ├── admin/wallets/
│   │   ├── admin/reports/
│   │   └── admin/settings/
│   └── api/
│       ├── auth/
│       ├── wallet/
│       ├── services/
│       ├── admin/
│       └── webhooks/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── scripts/
│   └── setup-db.ts
└── types/
    ├── auth.ts
    ├── wallet.ts
    ├── transactions.ts
    ├── users.ts
    ├── providers.ts
    └── kyc.ts
```

---

## 4. Environment Variables

### 4.1 Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4.2 Paystack Configuration
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

### 4.3 Flutterwave Configuration
```
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret
```

### 4.4 VTU Providers (3+ per service)
```
# Provider 1 - Airtime
VTU_PROVIDER_1_NAME=provider_one
VTU_PROVIDER_1_API_KEY=provider_one_api_key
VTU_PROVIDER_1_BASE_URL=https://api.provider1.com
VTU_PROVIDER_1_WEIGHT=50

# Provider 2 - Airtime
VTU_PROVIDER_2_NAME=provider_two
VTU_PROVIDER_2_API_KEY=provider_two_api_key
VTU_PROVIDER_2_BASE_URL=https://api.provider2.com
VTU_PROVIDER_2_WEIGHT=30

# Provider 3 - Airtime
VTU_PROVIDER_3_NAME=provider_three
VTU_PROVIDER_3_API_KEY=provider_three_api_key
VTU_PROVIDER_3_BASE_URL=https://api.provider3.com
VTU_PROVIDER_3_WEIGHT=20

# Provider 4 - Data
VTU_DATA_PROVIDER_1_NAME=data_provider_one
VTU_DATA_PROVIDER_1_API_KEY=data_provider_one_key
VTU_DATA_PROVIDER_1_BASE_URL=https://api.dataprovider1.com
VTU_DATA_PROVIDER_1_WEIGHT=50

# Provider 5 - Data
VTU_DATA_PROVIDER_2_NAME=data_provider_two
VTU_DATA_PROVIDER_2_API_KEY=data_provider_two_key
VTU_DATA_PROVIDER_2_BASE_URL=https://api.dataprovider2.com
VTU_DATA_PROVIDER_2_WEIGHT=30

# Provider 6 - Bills
VTU_BILLS_PROVIDER_1_NAME=bills_provider_one
VTU_BILLS_PROVIDER_1_API_KEY=bills_provider_one_key
VTU_BILLS_PROVIDER_1_BASE_URL=https://api.billsprovider1.com
VTU_BILLS_PROVIDER_1_WEIGHT=50

# Provider 7 - Bills
VTU_BILLS_PROVIDER_2_NAME=bills_provider_two
VTU_BILLS_PROVIDER_2_API_KEY=bills_provider_two_key
VTU_BILLS_PROVIDER_2_BASE_URL=https://api.billsprovider2.com
VTU_BILLS_PROVIDER_2_WEIGHT=30
```

### 4.5 Application Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BillBuster
NEXT_PUBLIC_APP_EMAIL=support@billbuster.com
NEXT_PUBLIC_APP_PHONE=+2348000000000
```

### 4.6 Security
```
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4.7 Feature Flags
```
NEXT_PUBLIC_ENABLE_REFERRAL=true
NEXT_PUBLIC_ENABLE_2FA=false
NEXT_PUBLIC_ENABLE_API_ACCESS=true
```

---

## 5. Build Order

### Phase 1: Project Setup
1. Initialize Next.js project with TypeScript
2. Install and configure Tailwind CSS
3. Install and setup shadcn/ui components
4. Configure Supabase client
5. Setup project folder structure

### Phase 2: Authentication System
1. Create Supabase Auth integration
2. Build login page
3. Build registration page
4. Build password reset flow
5. Implement email/phone verification
6. Create protected route middleware
7. Implement role-based access control

### Phase 3: Database Schema
1. Create users table with KYC fields
2. Create wallets table
3. Create transactions table
4. Create agents table
5. Create sub-agents table
6. Create providers table
7. Create provider_metrics table
8. Create services table
9. Create service_pricing table
10. Create notifications table
11. Create support tickets table
12. Create audit_logs table
13. Create rate_limits table
14. Create wallets_ledger table for reconciliation
15. Setup Row Level Security (RLS) policies
16. Create database functions for transactions

### Phase 4: Core Wallet System
1. Create wallet CRUD operations
2. Build wallet dashboard component
3. Implement Paystack integration for funding
4. Implement Flutterwave integration for funding
5. Implement bank transfer (virtual account)
6. Build wallet transfer functionality
7. Create transaction history
8. Implement auto-rollback for failed transactions

### Phase 5: VTU Services - Airtime
1. Create provider abstraction layer
2. Integrate 3+ airtime providers
3. Implement weighted routing algorithm
4. Implement fallback routing
5. Build airtime purchase form
6. Create airtime transaction handler
7. Build airtime history

### Phase 6: VTU Services - Data
1. Integrate 3+ data providers
2. Implement data plan fetching
3. Build data purchase form
4. Create data transaction handler
5. Build data balance check integration
6. Create data history

### Phase 7: VTU Services - Bills
1. Integrate electricity bill providers
2. Integrate TV subscription providers
3. Build bill payment forms
4. Implement meter/card validation
5. Create bill transaction handler
6. Build bill history

### Phase 8: Agent Management
1. Create agent registration flow
2. Build agent dashboard
3. Implement sub-agent creation
4. Build agent commission system
5. Create agent API key management
6. Build agent reports

### Phase 9: Admin Dashboard
1. Create admin layout
2. Build user management
3. Build agent management
4. Create KYC approval queue
5. Build transaction monitoring
6. Create provider configuration
7. Build commission settings
8. Create wallet management
9. Build reports and analytics

### Phase 10: Notifications
1. Setup in-app notification system
2. Implement email notifications
3. Implement SMS notifications
4. Create transaction alerts
5. Create KYC status notifications

### Phase 11: Security Layer Implementation
1. Implement Row Level Security (RLS) policies
2. Configure RLS for users table
3. Configure RLS for wallets table
4. Configure RLS for transactions table
5. Build rate limiting middleware
6. Create rate_limits table functions
7. Implement audit logging system
8. Add funding event logging
9. Add purchase event logging
10. Add refund event logging
11. Add admin action logging
12. Add reconciliation event logging
13. Secure provider API keys server-side
14. Secure wallet mutations
15. Secure payment verification

### Phase 12: Provider Scalability
1. Build provider registry system
2. Create provider CRUD API endpoints
3. Implement dynamic provider loading from database
4. Build provider health monitoring
5. Implement performance tracking
6. Build success rate calculation
7. Implement response time tracking
8. Create provider enable/disable functionality
9. Build service assignment to providers
10. Create provider priority configuration
11. Implement pricing/markup rules
12. Build auto-routing based on performance (future ready)
13. Create service factory for easy service addition
14. Test new provider onboarding

### Phase 13: Testing and Security
1. Write unit tests for core functions
2. Write integration tests
3. Perform security audit
4. Implement rate limiting
5. Add input validation
6. Configure security headers

### Phase 14: Deployment
1. Configure production build
2. Setup environment variables
3. Deploy to hosting platform
4. Configure CI/CD pipeline
5. Setup monitoring
6. Configure backups
