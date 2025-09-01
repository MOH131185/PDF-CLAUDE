-- PDF Tools SaaS - Complete Database Schema and RLS Policies
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create operations table
CREATE TABLE IF NOT EXISTS public.operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('merge', 'split', 'compress')),
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    operation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'pro')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS operations_user_id_idx ON public.operations(user_id);
CREATE INDEX IF NOT EXISTS operations_user_date_idx ON public.operations(user_id, operation_date);
CREATE INDEX IF NOT EXISTS operations_created_at_idx ON public.operations(created_at DESC);
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON public.user_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can insert own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can update own operations" ON public.operations;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;

-- Row Level Security Policies

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Operations Policies
CREATE POLICY "Users can view own operations" ON public.operations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations" ON public.operations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations" ON public.operations
    FOR UPDATE USING (auth.uid() = user_id);

-- User Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage subscriptions (for Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.user_subscriptions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create view for user operation statistics
CREATE OR REPLACE VIEW public.user_operation_stats AS
SELECT 
    user_id,
    COUNT(*) as total_operations,
    COUNT(*) FILTER (WHERE operation_date = CURRENT_DATE) as today_operations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_operations,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_operations,
    MAX(created_at) as last_operation,
    SUM(file_size) as total_file_size
FROM public.operations
GROUP BY user_id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.operations TO anon, authenticated;
GRANT ALL ON public.user_subscriptions TO anon, authenticated;
GRANT SELECT ON public.user_operation_stats TO authenticated;

-- Insert default subscription for existing users (optional)
-- This will create a 'free' subscription for users who don't have one
INSERT INTO public.user_subscriptions (user_id, stripe_customer_id, plan_id, status)
SELECT 
    id as user_id,
    'temp_' || id as stripe_customer_id,
    'free' as plan_id,
    'active' as status
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Create function to get user's remaining operations for today
CREATE OR REPLACE FUNCTION public.get_remaining_operations(user_id_param UUID)
RETURNS TABLE(remaining_operations INTEGER, is_pro_user BOOLEAN, daily_limit INTEGER) AS $$
DECLARE
    user_subscription_status TEXT;
    user_plan_id TEXT;
    operations_today INTEGER;
    limit_value INTEGER;
BEGIN
    -- Get user subscription info
    SELECT status, plan_id INTO user_subscription_status, user_plan_id
    FROM public.user_subscriptions
    WHERE user_id = user_id_param AND status = 'active'
    LIMIT 1;
    
    -- If no subscription found, treat as free user
    IF user_plan_id IS NULL THEN
        user_plan_id := 'free';
    END IF;
    
    -- Count operations for today
    SELECT COUNT(*) INTO operations_today
    FROM public.operations
    WHERE user_id = user_id_param AND operation_date = CURRENT_DATE;
    
    -- Set limits based on plan
    IF user_plan_id = 'pro' THEN
        limit_value := 999999; -- Unlimited for pro users
        RETURN QUERY SELECT limit_value - operations_today, TRUE, limit_value;
    ELSE
        limit_value := 5; -- Free user limit
        RETURN QUERY SELECT GREATEST(0, limit_value - operations_today), FALSE, limit_value;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_remaining_operations(UUID) TO authenticated;

-- Success message
DO $$ BEGIN
    RAISE NOTICE 'PDF Tools database schema has been successfully created!';
    RAISE NOTICE 'Tables: user_profiles, operations, user_subscriptions';
    RAISE NOTICE 'RLS policies: Enabled and configured';
    RAISE NOTICE 'Functions: handle_updated_at, handle_new_user, get_remaining_operations';
    RAISE NOTICE 'Triggers: Auto profile creation, updated_at timestamps';
    RAISE NOTICE 'Ready for your PDF Tools SaaS application!';
END $$;