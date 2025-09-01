# PDF Tools SaaS Application

A modern SaaS application for PDF manipulation built with Next.js, TypeScript, and Tailwind CSS. Features include merging, splitting, and compressing PDF files with user authentication and subscription management.

## Features

- 🔄 **PDF Merge**: Combine multiple PDF files into one
- ✂️ **PDF Split**: Extract pages or split PDF into multiple files  
- 🗜️ **PDF Compress**: Reduce file size while maintaining quality
- 🔐 **User Authentication**: Secure login/signup with Supabase
- 💳 **Subscription Management**: Stripe integration for payments
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Modern UI**: Clean interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: PDF-lib
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe
- **State Management**: Zustand
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pdf-tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
```

## Project Structure

```
pdf-tools/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/               # Authentication pages
│   ├── (tools)/
│   │   ├── merge-pdf/          # PDF merge tool
│   │   ├── split-pdf/          # PDF split tool
│   │   └── compress-pdf/       # PDF compress tool
│   ├── api/
│   │   ├── operations/         # PDF processing API
│   │   └── webhook/stripe/     # Stripe webhook handler
│   ├── dashboard/              # User dashboard
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── pdf-tools/              # PDF tool components
│   ├── ui/                     # Reusable UI components
│   └── Navbar.tsx              # Navigation component
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   └── useOperations.ts        # Operations management hook
├── lib/
│   ├── pdf-operations.ts       # PDF processing logic
│   ├── supabase.ts             # Supabase client
│   └── stripe.ts               # Stripe configuration
└── public/                     # Static assets
```

## Features in Detail

### PDF Operations

- **Merge**: Combine multiple PDFs in a specified order
- **Split**: Extract specific page ranges or split into individual pages
- **Compress**: Reduce file size with quality control

### User Management

- Email/password authentication via Supabase
- User dashboard with operation history
- Profile management

### Subscription System

- Free tier: 5 operations/day, 10MB file limit
- Pro tier: Unlimited operations, 100MB file limit
- Stripe integration for payments and billing

## Deployment

Deploy to Vercel by connecting your GitHub repository and setting up environment variables in the Vercel dashboard.

## License

MIT License
