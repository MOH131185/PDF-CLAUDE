import Link from 'next/link';
import { FileText, Merge, Split, Archive, Star, Check } from 'lucide-react';
import PricingCard from '@/components/ui/PricingCard';

export default function Home() {
  const features = [
    {
      icon: Merge,
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single document',
      href: '/merge-pdf',
    },
    {
      icon: Split,
      title: 'Split PDFs',
      description: 'Extract pages or split PDF into multiple files',
      href: '/split-pdf',
    },
    {
      icon: Archive,
      title: 'Compress PDFs',
      description: 'Reduce file size while maintaining quality',
      href: '/compress-pdf',
    },
  ];

  const benefits = [
    'Secure processing - files are deleted after use',
    'No file size limits',
    'Batch operations support',
    'High-quality output',
    'Fast processing speed',
    'Works on all devices',
  ];

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional PDF Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Merge, split, and compress your PDF files with our easy-to-use online tools. 
              No downloads required, works in your browser.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <FileText className="w-5 h-5 mr-2" />
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your PDF Tool
            </h2>
            <p className="text-lg text-gray-600">
              Select the tool you need to work with your PDF files
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="block p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-blue-300"
                >
                  <div className="text-center">
                    <div className="inline-flex p-3 bg-blue-100 rounded-lg mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our PDF Tools?
            </h2>
            <p className="text-lg text-gray-600">
              Built for professionals who need reliable PDF processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade as you grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free"
              price="$0"
              period="forever"
              features={[
                '5 operations per day',
                'Files up to 10MB',
                'Basic support',
                'All PDF tools',
              ]}
              buttonText="Get Started"
              buttonHref="/dashboard"
            />
            <PricingCard
              title="Pro"
              price="$9"
              period="month"
              features={[
                'Unlimited operations',
                'Files up to 100MB',
                'Priority support',
                'Advanced features',
                'API access',
              ]}
              buttonText="Upgrade to Pro"
              buttonHref="/dashboard"
              popular
            />
          </div>
        </div>
      </section>
    </div>
  );
}
