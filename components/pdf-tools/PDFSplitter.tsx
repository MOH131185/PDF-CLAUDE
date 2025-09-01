'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Split, Download, FileText } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';

export default function PDFSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitRanges, setSplitRanges] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'ranges' | 'individual'>('ranges');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (file) {
      // In a real implementation, you would use PDF.js to get page count
      // For now, we'll simulate it
      setPageCount(Math.floor(Math.random() * 20) + 5);
    }
  }, [file]);

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please select a PDF file to split');
      return;
    }

    if (splitMode === 'ranges' && !splitRanges.trim()) {
      toast.error('Please specify page ranges');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('operation', 'split');
      formData.append('file', file);
      
      let ranges;
      if (splitMode === 'individual') {
        // Split into individual pages
        ranges = Array.from({ length: pageCount }, (_, i) => `${i + 1}`);
      } else {
        // Parse custom ranges
        ranges = splitRanges.split(',').map(range => range.trim());
      }
      
      formData.append('pageRanges', JSON.stringify(ranges));

      const response = await fetch('/api/operations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to split PDF');
      }

      await response.json();
      
      // In a real implementation, you would handle multiple file downloads
      toast.success(`PDF split into ${ranges.length} files successfully!`);
      setFile(null);
      setSplitRanges('');
    } catch (error) {
      console.error('Split error:', error);
      toast.error('Failed to split PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Split className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Split PDF File</h2>
        </div>

        <FileUpload
          files={file ? [file] : []}
          onFilesChange={(files) => setFile(files[0] || null)}
          multiple={false}
          maxFiles={1}
          className="mb-6"
        />

        {file && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">
                Selected: {file.name} ({pageCount} pages)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Split Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ranges"
                      checked={splitMode === 'ranges'}
                      onChange={(e) => setSplitMode(e.target.value as 'ranges')}
                      className="mr-2"
                    />
                    Custom ranges
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="individual"
                      checked={splitMode === 'individual'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual')}
                      className="mr-2"
                    />
                    Individual pages
                  </label>
                </div>
              </div>

              {splitMode === 'ranges' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Page Ranges
                  </label>
                  <input
                    type="text"
                    value={splitRanges}
                    onChange={(e) => setSplitRanges(e.target.value)}
                    placeholder="e.g., 1-5, 6-10, 11-15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify page ranges separated by commas (e.g., &quot;1-5, 6-10&quot; or &quot;1, 3, 5-7&quot;)
                  </p>
                </div>
              )}

              {splitMode === 'individual' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    This will split the PDF into {pageCount} individual files, one for each page.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSplit}
            disabled={!file || (splitMode === 'ranges' && !splitRanges.trim()) || isProcessing}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            {isProcessing ? 'Splitting...' : 'Split PDF'}
          </button>
        </div>

        {!file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
              Upload a PDF file to get started with splitting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}