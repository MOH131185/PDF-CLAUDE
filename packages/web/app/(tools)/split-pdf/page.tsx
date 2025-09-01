import { Metadata } from 'next';
import PDFSplitter from '@/components/pdf-tools/PDFSplitter';
import ToolErrorBoundary from '@/components/pdf-tools/ToolErrorBoundary';

export const metadata: Metadata = {
  title: 'Split PDF Files Online - Free PDF Splitter Tool | PDF Tools',
  description: 'Split PDF files by page ranges or extract specific pages. Free online PDF splitter with no watermarks. Secure and fast PDF splitting tool.',
  keywords: 'split PDF, PDF splitter, extract PDF pages, divide PDF, PDF tools, online PDF splitter',
  openGraph: {
    title: 'Free Online PDF Splitter - Extract Pages from PDF',
    description: 'Split PDF files into multiple documents or extract specific pages. Fast, secure, and free PDF splitter tool.',
    type: 'website',
    images: [
      {
        url: '/og-split-pdf.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Split Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Splitter - Extract PDF Pages',
    description: 'Split PDF files online for free. Extract pages or divide PDF into multiple documents.',
  },
  alternates: {
    canonical: '/split-pdf'
  }
};

export default function SplitPDFPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Split PDF Files</h1>
          <p className="text-lg text-gray-600">
            Extract specific pages or split your PDF into multiple documents.
          </p>
        </div>
        
        <ToolErrorBoundary toolName="PDF Splitter">
          <PDFSplitter />
        </ToolErrorBoundary>
      </div>
    </div>
  );
}