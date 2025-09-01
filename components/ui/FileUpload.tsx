'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export default function FileUpload({
  files,
  onFilesChange,
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  className = '',
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      onFilesChange(newFiles.slice(0, maxFiles));
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { 'application/pdf': ['.pdf'] },
      multiple,
      maxSize,
      maxFiles: maxFiles - files.length,
    });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive && !isDragReject
            ? 'border-blue-400 bg-blue-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-lg text-gray-600">
            {isDragReject ? 'File type not supported' : 'Drop the files here...'}
          </p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-2">
              Drag and drop PDF files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              {multiple
                ? `Upload up to ${maxFiles} PDF files (max ${formatFileSize(maxSize)} each)`
                : `Upload 1 PDF file (max ${formatFileSize(maxSize)})`}
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}