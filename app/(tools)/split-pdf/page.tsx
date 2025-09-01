import PDFSplitter from '@/components/pdf-tools/PDFSplitter';

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
        
        <PDFSplitter />
      </div>
    </div>
  );
}