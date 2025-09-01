import PDFMerger from '@/components/pdf-tools/PDFMerger';

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
        
        <PDFMerger />
      </div>
    </div>
  );
}