# 🚀 Supabase Setup Guide for PDF Tools SaaS

This guide will help you set up Supabase for your PDF Tools SaaS application with authentication, database, and Row Level Security.

## 📋 Prerequisites

- Supabase account ([signup here](https://supabase.com))
- Basic understanding of SQL
- Environment variables configured

## 🏗️ Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `pdf-tools-saas`
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for project initialization (2-3 minutes)

## 🔑 Step 2: Get API Keys

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

3. Add to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🗄️ Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **"Run"** to execute

This will create:
- ✅ **3 Tables**: `user_profiles`, `operations`, `user_subscriptions`
- ✅ **Indexes** for performance optimization
- ✅ **Row Level Security** policies
- ✅ **Functions** for operations tracking
- ✅ **Triggers** for automatic profile creation

## 🔒 Step 4: Configure Authentication

1. Go to **Authentication** > **Settings**
2. **Site URL**: Set to your domain (e.g., `https://yourapp.com`)
3. **Redirect URLs**: Add your callback URLs:
   - `http://localhost:3000/dashboard` (development)
   - `https://yourapp.com/dashboard` (production)

### Email Settings (Optional)

1. Go to **Authentication** > **Settings** > **SMTP Settings**
2. Configure your email provider (SendGrid, Mailgun, etc.)
3. Or use Supabase's built-in email for development

## 📊 Step 5: Verify Database Setup

Run these queries in the SQL Editor to verify everything is working:

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Test User Operations Function
```sql
SELECT * FROM public.get_remaining_operations('00000000-0000-0000-0000-000000000000');
```

## 🔧 Step 6: Environment Configuration

Update your `.env.local` with all required values:

```env
# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
```

## 🧪 Step 7: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Go to `/login`
   - Create a new account
   - Check that user profile is created automatically

3. **Test Operations Tracking**:
   - Use any PDF tool
   - Check that operations are logged in the database
   - Verify usage limits are enforced

4. **Check Dashboard**:
   - View operation history
   - Verify subscription status
   - Test usage limit display

## 📈 Database Schema Overview

### Tables

#### `user_profiles`
- Stores user information and preferences
- Automatically created when user signs up
- Links to `auth.users` via `user_id`

#### `operations`
- Tracks all PDF operations (merge, split, compress)
- Enforces daily limits for free users
- Stores file metadata and operation results

#### `user_subscriptions`
- Manages subscription plans (free/pro)
- Integrates with Stripe for billing
- Determines user access levels

### Key Features

#### Row Level Security (RLS)
- Users can only access their own data
- Service role can manage subscriptions (for webhooks)
- Secure by default

#### Usage Limits
- Free users: 5 operations per day
- Pro users: Unlimited operations
- Automatic tracking and enforcement

#### Real-time Updates
- Operations sync in real-time
- Dashboard updates automatically
- WebSocket connections for live data

## 🐛 Troubleshooting

### Common Issues

#### 1. "relation does not exist" error
**Solution**: Make sure you ran the complete `schema.sql` script

#### 2. Authentication not working
**Solutions**:
- Check Site URL in Supabase settings
- Verify API keys in environment variables
- Ensure redirect URLs are configured

#### 3. RLS blocking queries
**Solution**: Check that policies are created correctly:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### 4. Functions not working
**Solution**: Verify functions were created:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';
```

### Debug Queries

Check user operations:
```sql
SELECT * FROM operations WHERE user_id = 'your-user-id';
```

Check subscription status:
```sql
SELECT * FROM user_subscriptions WHERE user_id = 'your-user-id';
```

Test usage limits:
```sql
SELECT * FROM get_remaining_operations('your-user-id');
```

## 🔄 Database Migrations

If you need to update the schema later:

1. Create migration file: `migrations/001_update_schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed

## 🚀 Production Deployment

Before going to production:

1. **Update Environment Variables**:
   - Change `NEXT_PUBLIC_SITE_URL` to your domain
   - Use production Supabase keys
   - Configure SMTP for emails

2. **Security Checklist**:
   - ✅ RLS enabled on all tables
   - ✅ API keys secured
   - ✅ Service role key only on server
   - ✅ CORS configured in Supabase

3. **Performance Optimization**:
   - ✅ Database indexes created
   - ✅ Connection pooling enabled
   - ✅ Query performance monitored

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase logs in the dashboard
3. Test queries directly in SQL Editor
4. Verify environment variables are correct

Your PDF Tools SaaS application is now fully integrated with Supabase! 🎉