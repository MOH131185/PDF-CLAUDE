import PDFCompressor from '@/components/pdf-tools/PDFCompressor';

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
        
        <PDFCompressor />
      </div>
    </div>
  );
}