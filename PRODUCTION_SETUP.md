# PDF Tools - Production Setup Guide

This guide covers everything needed to deploy PDF Tools to production with all features enabled.

## Quick Setup Checklist

- [ ] Environment variables configured
- [ ] Supabase database set up with RLS policies
- [ ] Stripe payment processing configured
- [ ] Domain and SSL certificate set up
- [ ] Analytics and monitoring enabled
- [ ] Rate limiting configured
- [ ] Error tracking set up
- [ ] SEO optimizations verified

## 1. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Fill in all required environment variables
3. Ensure sensitive keys are kept secure

### Required Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Analytics (Google Analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
GOOGLE_SITE_VERIFICATION=your_verification_code
```

## 2. Database Setup (Supabase)

### Create Tables

Execute the SQL in `database/schema.sql` in your Supabase SQL editor:

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create operations tracking table
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('merge', 'split', 'compress')),
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  operation_date DATE DEFAULT CURRENT_DATE
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Set Up Row Level Security (RLS)

Enable RLS and create policies as shown in `database/schema.sql`.

## 3. Stripe Configuration

### 1. Create Products and Prices

1. Log into Stripe Dashboard
2. Create a "Pro Plan" product
3. Create a recurring price (e.g., $19/month)
4. Copy the Price ID to `STRIPE_PRO_PRICE_ID`

### 2. Configure Webhooks

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Enable Customer Portal

1. In Stripe Dashboard → Settings → Billing → Customer Portal
2. Activate customer portal
3. Configure allowed features (cancel, update payment method, etc.)

## 4. Domain and SSL

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add custom domain in Vercel dashboard
3. Configure DNS records as instructed by Vercel
4. SSL is automatically handled by Vercel

### Custom Deployment

1. Set up SSL certificate (Let's Encrypt recommended)
2. Configure web server (Nginx/Apache)
3. Set up reverse proxy to Next.js application
4. Configure CDN for static assets (optional)

## 5. Analytics and Monitoring

### Google Analytics 4

1. Create GA4 property
2. Get Measurement ID
3. Add to `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Google Search Console

1. Add property for your domain
2. Verify ownership with meta tag
3. Add verification code to `GOOGLE_SITE_VERIFICATION`
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### Error Tracking (Optional but Recommended)

1. Set up Sentry account
2. Create new project
3. Add DSN to `SENTRY_DSN`

## 6. SEO Configuration

### Meta Tags and Structured Data

All meta tags are already configured in the application. Verify:

- [ ] Title tags are descriptive and unique
- [ ] Meta descriptions under 160 characters
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card meta tags
- [ ] Structured data for tools (JSON-LD)

### Sitemap and Robots.txt

Files are automatically generated:
- Sitemap: `https://your-domain.com/sitemap.xml`
- Robots: `https://your-domain.com/robots.txt`

Update the sitemap base URL in `app/sitemap.ts` if needed.

## 7. Performance Optimization

### Image Optimization

1. Add Open Graph images to `/public/`:
   - `og-image.jpg` (1200x630)
   - `og-merge-pdf.jpg` (1200x630)
   - `og-split-pdf.jpg` (1200x630)
   - `og-compress-pdf.jpg` (1200x630)

### Caching

Configure appropriate cache headers:
- Static assets: 1 year
- API responses: Based on data freshness
- Pages: Based on update frequency

## 8. Security Checklist

- [ ] All secrets stored securely (not in code)
- [ ] Rate limiting enabled on all API routes
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Content Security Policy implemented
- [ ] Input validation on all forms
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection enabled

## 9. Testing

### Pre-Production Testing

1. Test all PDF operations (merge, split, compress)
2. Test payment flow end-to-end
3. Test subscription management
4. Test rate limiting
5. Test error boundaries
6. Test mobile responsiveness
7. Test SEO tags with social media debugging tools

### Load Testing

1. Test with large PDF files
2. Test concurrent operations
3. Monitor memory usage
4. Test rate limiting under load

## 10. Launch Checklist

- [ ] All environment variables set
- [ ] Database tables created and populated
- [ ] Stripe products and webhooks configured
- [ ] Domain and SSL certificate active
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] All features tested in production environment
- [ ] Performance metrics baseline established
- [ ] Monitoring and alerting set up

## 11. Post-Launch Monitoring

### Key Metrics to Track

1. **User Metrics**
   - Daily/monthly active users
   - Conversion rate (free to paid)
   - Churn rate
   - User journey through tools

2. **Technical Metrics**
   - API response times
   - Error rates
   - Server resource usage
   - PDF processing success rates

3. **Business Metrics**
   - Revenue (MRR/ARR)
   - Customer acquisition cost
   - Lifetime value
   - Support ticket volume

### Recommended Tools

- **Analytics**: Google Analytics 4, Vercel Analytics
- **Error Tracking**: Sentry, LogRocket
- **Uptime Monitoring**: UptimeRobot, StatusPage
- **Performance**: Lighthouse, Web Vitals
- **User Feedback**: Hotjar, FullStory

## 12. Scaling Considerations

### Database Scaling

- Monitor query performance
- Add indexes for frequently queried columns
- Consider read replicas for high traffic
- Implement database connection pooling

### File Processing

- Consider moving PDF processing to background jobs
- Implement file size limits
- Add progress tracking for large operations
- Consider using worker processes for CPU-intensive tasks

### CDN and Caching

- Use CDN for static assets
- Implement Redis for session storage
- Add response caching where appropriate
- Use edge computing for better global performance

## Support and Maintenance

### Regular Tasks

- [ ] Monitor error rates and performance
- [ ] Update dependencies monthly
- [ ] Review and optimize database queries
- [ ] Backup database regularly
- [ ] Monitor SSL certificate expiration
- [ ] Review and update SEO content

### Documentation

Keep this documentation updated as you make changes to the infrastructure and deployment process.

---

Need help with any part of the setup? Check the individual component documentation or create an issue in the repository.