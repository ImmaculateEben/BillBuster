-- Demo Users for BillBuster VTU Application
-- Run this SQL in your Supabase SQL Editor to create demo accounts

-- ============================================
-- DEMO USER ACCOUNT (Regular User)
-- ============================================
-- Email: demo@billbuster.com
-- Password: Demo@123

-- Create auth user for demo
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo@billbuster.com',
  '$2a$10$EpPrw7P8HJhW3K5p3xX4Ou6Y8K9N2P5Q7R8S9T0U1V2W3X4Y5Z6A7B',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create profile for demo user
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  kyc_level,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo@billbuster.com',
  'Demo User',
  '+2348000000001',
  'user',
  'basic',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create wallet for demo user with balance
INSERT INTO wallets (
  user_id,
  balance,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  50000.00,  -- N50,000 balance
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- DEMO ADMIN ACCOUNT (Super Admin)
-- ============================================
-- Email: admin@billbuster.com
-- Password: Admin@123

-- Create auth user for admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@billbuster.com',
  '$2a$10$BqPrw8P9JhiX4K6p4yY5Pv7Z9L0O3R6S8T9U0V1W2X3Y4Z5A6B7C',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create profile for admin
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  kyc_level,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@billbuster.com',
  'Super Admin',
  '+2348000000002',
  'super_admin',
  'full',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create wallet for admin
INSERT INTO wallets (
  user_id,
  balance,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  100000.00,  -- N100,000 balance
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- DEMO AGENT ACCOUNT
-- ============================================
-- Email: agent@billbuster.com
-- Password: Agent@123

-- Create auth user for agent
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'agent@billbuster.com',
  '$2a$10$CrQsx9P0JijY5L7q5zZ6Qw8A0M1P2R3S4T5U6V7W8X9Y0Z1A2B3C4D',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create profile for agent
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  kyc_level,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'agent@billbuster.com',
  'Demo Agent',
  '+2348000000003',
  'agent',
  'intermediate',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create wallet for agent
INSERT INTO wallets (
  user_id,
  balance,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  75000.00,  -- N75,000 balance
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Create agent record
INSERT INTO agents (
  id,
  user_id,
  agent_code,
  commission_rate,
  status,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'AGENT001',
  2.5,  -- 2.5% commission
  'active',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEMO VTU PROVIDERS
-- ============================================

-- Airtime Providers
INSERT INTO providers (name, category, api_key, base_url, weight, is_active) VALUES
  ('MTN Airtime Provider', 'airtime', 'mtn_api_key_123', 'https://api.mtnprovider.com', 40, true),
  ('Glo Airtime Provider', 'airtime', 'glo_api_key_456', 'https://api.gloprovider.com', 30, true),
  ('Airtel Airtime Provider', 'airtime', 'airtel_api_key_789', 'https://api.airtelprovider.com', 20, true),
  ('9mobile Airtime Provider', 'airtime', '9mobile_api_key_012', 'https://api.9mobileprovider.com', 10, true)
ON CONFLICT DO NOTHING;

-- Data Providers
INSERT INTO providers (name, category, api_key, base_url, weight, is_active) VALUES
  ('MTN Data Provider', 'data', 'mtn_data_key_123', 'https://api.mtnprovider.com/data', 35, true),
  ('Glo Data Provider', 'data', 'glo_data_key_456', 'https://api.gloprovider.com/data', 30, true),
  ('Airtel Data Provider', 'data', 'airtel_data_key_789', 'https://api.airtelprovider.com/data', 25, true),
  ('9mobile Data Provider', 'data', '9mobile_data_key_012', 'https://api.9mobileprovider.com/data', 10, true)
ON CONFLICT DO NOTHING;

-- Electricity Providers
INSERT INTO providers (name, category, api_key, base_url, weight, is_active) VALUES
  (' Ikeja Electric', 'electricity', 'ikeja_key_123', 'https://api.ikejaelectric.com', 30, true),
  ('Eko Electric', 'electricity', 'eko_key_456', 'https://api.ekoelectric.com', 25, true),
  ('Abuja Electric', 'electricity', 'abuja_key_789', 'https://api.abujaelectric.com', 25, true),
  ('Port Harcourt Electric', 'electricity', 'ph_key_012', 'https://api.phelectric.com', 20, true)
ON CONFLICT DO NOTHING;

-- TV Providers
INSERT INTO providers (name, category, api_key, base_url, weight, is_active) VALUES
  ('DSTV Provider', 'tv', 'dstv_key_123', 'https://api.dstv.com', 40, true),
  ('GOtv Provider', 'tv', 'gotv_key_456', 'https://api.gotv.com', 35, true),
  ('Startimes Provider', 'tv', 'startimes_key_789', 'https://api.startimes.com', 25, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO RATE LIMITS
-- ============================================
INSERT INTO rate_limits (endpoint_pattern, method, max_requests, window_seconds, is_active) VALUES
  ('/api/wallet/fund', 'POST', 10, 3600, true),
  ('/api/wallet/transfer', 'POST', 20, 3600, true),
  ('/api/services/airtime', 'POST', 50, 3600, true),
  ('/api/services/data', 'POST', 50, 3600, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTE: 
-- The passwords in this script are encrypted hashes.
-- For demo purposes, you can reset passwords in Supabase
-- or use the registration flow to create real accounts.
-- 
-- To test, go to /register and create new accounts,
-- then manually update their roles in the profiles table.
-- ============================================
