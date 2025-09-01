'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Merge, Download, ArrowUp, ArrowDown } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('operation', 'merge');
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/operations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDFs merged successfully!');
      setFiles([]);
    } catch (error) {
      console.error('Merge error:', error);
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < files.length) {
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Merge className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Merge PDF Files</h2>
        </div>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          multiple={true}
          maxFiles={10}
          className="mb-6"
        />

        {files.length >= 2 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Merge Order
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              The files will be merged in the order shown below. Use the arrow buttons to reorder.
            </p>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            {isProcessing ? 'Merging...' : 'Merge PDFs'}
          </button>
        </div>

        {files.length === 1 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-700 text-sm">
              Please add at least one more PDF file to merge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}