'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Archive, Download, FileText, Settings } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const getQualityFromLevel = (level: string) => {
    switch (level) {
      case 'low':
        return 0.9;
      case 'medium':
        return 0.7;
      case 'high':
        return 0.5;
      default:
        return 0.7;
    }
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a PDF file to compress');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('operation', 'compress');
      formData.append('file', file);
      formData.append('quality', quality.toString());

      const response = await fetch('/api/operations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to compress PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const originalSize = file.size;
      const compressedSize = blob.size;
      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      toast.success(`PDF compressed successfully! Size reduced by ${reduction}%`);
      setFile(null);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to compress PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Archive className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Compress PDF File</h2>
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
                Selected: {file.name} ({formatFileSize(file.size)})
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Compression Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Compression Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setCompressionLevel('low');
                        setQuality(getQualityFromLevel('low'));
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        compressionLevel === 'low'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">Low</div>
                        <div className="text-xs text-gray-500">Best quality</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setCompressionLevel('medium');
                        setQuality(getQualityFromLevel('medium'));
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        compressionLevel === 'medium'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">Medium</div>
                        <div className="text-xs text-gray-500">Balanced</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setCompressionLevel('high');
                        setQuality(getQualityFromLevel('high'));
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        compressionLevel === 'high'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">High</div>
                        <div className="text-xs text-gray-500">Smaller size</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Custom Quality ({Math.round(quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => {
                      const newQuality = parseFloat(e.target.value);
                      setQuality(newQuality);
                      // Update compression level based on quality
                      if (newQuality >= 0.8) setCompressionLevel('low');
                      else if (newQuality >= 0.6) setCompressionLevel('medium');
                      else setCompressionLevel('high');
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller size</span>
                    <span>Better quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleCompress}
            disabled={!file || isProcessing}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            {isProcessing ? 'Compressing...' : 'Compress PDF'}
          </button>
        </div>

        {!file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
              Upload a PDF file to reduce its size while maintaining quality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}