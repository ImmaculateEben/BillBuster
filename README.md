# BillBuster VTU Application

A complete VTU (Virtual Top-Up) web application built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and payment integration (Paystack/Flutterwave).

## Features

- User authentication with Supabase
- Wallet system with funding, transfers, and history
- VTU Services: Airtime, Data, Electricity, TV subscriptions
- Multi-provider routing with fallback
- Agent and Sub-agent management
- Admin dashboard with KYC verification
- Provider management and metrics
- Rate limiting for API endpoints

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Paystack, Flutterwave

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Paystack/Flutterwave account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Run migrations in `supabase/migrations/`
   - Update `.env.local` with your Supabase credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

To create demo accounts, run:
```bash
curl -X POST http://localhost:3000/api/demo
```

This creates:
- **User**: demo@billbuster.com / Demo@123
- **Admin**: admin@billbuster.com / Admin@123
- **Agent**: agent@billbuster.com / Agent@123

## Routes

### Public
- `/` - Landing page
- `/login` - Login
- `/register` - Registration

### User Dashboard
- `/dashboard` - Main dashboard
- `/wallet` - Wallet overview
- `/wallet/fund` - Fund wallet
- `/wallet/transfer` - Transfer funds
- `/wallet/history` - Transaction history

### Services
- `/services` - Services overview
- `/services/airtime` - Buy airtime
- `/services/data` - Buy data
- `/services/bills/electricity` - Pay electricity
- `/services/bills/tv` - TV subscription

### Admin
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/kyc` - KYC verification
- `/admin/providers` - Provider management
- `/admin/metrics` - Provider metrics
- `/admin/rate-limits` - Rate limiting

### Agent
- `/agent` - Agent dashboard
- `/agent/sub-agents` - Sub-agent management

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables

See `.env.production.example` for required variables.

## License

MIT
