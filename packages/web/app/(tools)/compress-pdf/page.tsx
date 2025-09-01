import { Metadata } from 'next';
import PDFCompressor from '@/components/pdf-tools/PDFCompressor';
import ToolErrorBoundary from '@/components/pdf-tools/ToolErrorBoundary';

export const metadata: Metadata = {
  title: 'Compress PDF Files Online - Free PDF Compressor | PDF Tools',
  description: 'Reduce PDF file size online for free. Compress PDFs while maintaining quality. Fast and secure PDF compression with no watermarks.',
  keywords: 'compress PDF, PDF compressor, reduce PDF size, optimize PDF, PDF tools, online PDF compression',
  openGraph: {
    title: 'Free Online PDF Compressor - Reduce PDF File Size',
    description: 'Compress PDF files to reduce size while maintaining quality. Fast, secure, and free PDF compression tool.',
    type: 'website',
    images: [
      {
        url: '/og-compress-pdf.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Compress Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Compressor - Reduce File Size',
    description: 'Compress PDF files online for free. Reduce size while maintaining quality.',
  },
  alternates: {
    canonical: '/compress-pdf'
  }
};

export default function CompressPDFPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Compress PDF Files</h1>
          <p className="text-lg text-gray-600">
            Reduce PDF file size while maintaining quality for faster sharing and storage.
          </p>
        </div>
        
        <ToolErrorBoundary toolName="PDF Compressor">
          <PDFCompressor />
        </ToolErrorBoundary>
      </div>
    </div>
  );
}