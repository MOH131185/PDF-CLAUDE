import { Metadata } from 'next';
import PDFMerger from '@/components/pdf-tools/PDFMerger';
import ToolErrorBoundary from '@/components/pdf-tools/ToolErrorBoundary';

export const metadata: Metadata = {
  title: 'Merge PDF Files Online - Free PDF Merger Tool | PDF Tools',
  description: 'Combine multiple PDF files into one document instantly. Secure, fast, and free PDF merger. No watermarks, no registration required. Upload and merge PDFs online.',
  keywords: 'merge PDF, combine PDF, PDF merger, join PDF files, PDF tools, online PDF merger',
  openGraph: {
    title: 'Free Online PDF Merger - Combine PDF Files',
    description: 'Merge multiple PDF files into a single document. Fast, secure, and free PDF merger tool.',
    type: 'website',
    images: [
      {
        url: '/og-merge-pdf.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Merge Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Merger - Combine Multiple PDFs',
    description: 'Merge PDF files online for free. Secure and fast PDF combining tool.',
  },
  alternates: {
    canonical: '/merge-pdf'
  }
};

export default function MergePDFPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Merge PDF Files</h1>
          <p className="text-lg text-gray-600">
            Combine multiple PDF files into a single document quickly and easily.
          </p>
        </div>
        
        <ToolErrorBoundary toolName="PDF Merger">
          <PDFMerger />
        </ToolErrorBoundary>
      </div>
    </div>
  );
}