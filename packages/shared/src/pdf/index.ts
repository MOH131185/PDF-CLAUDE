import { PDFDocument, PDFPage } from 'pdf-lib';
import { PDFFile } from '../types';

export interface PDFProcessingOptions {
  quality?: number; // For compression (0.1 to 1.0)
  password?: string; // For password-protected PDFs
  pages?: number[] | string; // For splitting specific pages
}

export interface PDFProcessingResult {
  success: boolean;
  output?: Uint8Array;
  error?: string;
  metadata?: {
    originalSize: number;
    compressedSize?: number;
    compressionRatio?: number;
    pageCount: number;
  };
}

// PDF Processing utilities that work across platforms
export class PDFProcessor {
  
  /**
   * Merge multiple PDF files into a single PDF
   */
  static async mergePDFs(files: PDFFile[]): Promise<PDFProcessingResult> {
    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;
      let totalSize = 0;

      for (const file of files) {
        const pdfBytes = await this.getFileBytes(file);
        const pdf = await PDFDocument.load(pdfBytes);
        const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          totalPages++;
        });
        
        totalSize += file.size;
      }

      const pdfBytes = await mergedPdf.save();
      
      return {
        success: true,
        output: pdfBytes,
        metadata: {
          originalSize: totalSize,
          compressedSize: pdfBytes.length,
          pageCount: totalPages,
          compressionRatio: pdfBytes.length / totalSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge PDFs',
      };
    }
  }

  /**
   * Split a PDF into multiple PDFs or extract specific pages
   */
  static async splitPDF(file: PDFFile, options: PDFProcessingOptions = {}): Promise<PDFProcessingResult[]> {
    try {
      const pdfBytes = await this.getFileBytes(file);
      const pdf = await PDFDocument.load(pdfBytes);
      const totalPages = pdf.getPageCount();
      
      let pageRanges: number[][];
      
      if (options.pages) {
        // Extract specific pages
        const pages = typeof options.pages === 'string' 
          ? this.parsePageRange(options.pages, totalPages)
          : options.pages;
        
        pageRanges = pages.map(pageNum => [pageNum - 1]); // Convert to 0-based indexing
      } else {
        // Split into individual pages
        pageRanges = Array.from({ length: totalPages }, (_, i) => [i]);
      }

      const results: PDFProcessingResult[] = [];

      for (const pageIndices of pageRanges) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        
        copiedPages.forEach((page) => {
          newPdf.addPage(page);
        });

        const splitPdfBytes = await newPdf.save();
        
        results.push({
          success: true,
          output: splitPdfBytes,
          metadata: {
            originalSize: file.size,
            compressedSize: splitPdfBytes.length,
            pageCount: pageIndices.length,
            compressionRatio: splitPdfBytes.length / file.size,
          },
        });
      }

      return results;
    } catch (error) {
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Failed to split PDF',
      }];
    }
  }

  /**
   * Compress a PDF file
   */
  static async compressPDF(file: PDFFile, options: PDFProcessingOptions = {}): Promise<PDFProcessingResult> {
    try {
      const pdfBytes = await this.getFileBytes(file);
      const pdf = await PDFDocument.load(pdfBytes);
      
      // Basic compression by re-saving the PDF
      // For more advanced compression, you might need additional libraries
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressionRatio = compressedBytes.length / file.size;
      
      return {
        success: true,
        output: compressedBytes,
        metadata: {
          originalSize: file.size,
          compressedSize: compressedBytes.length,
          pageCount: pdf.getPageCount(),
          compressionRatio,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compress PDF',
      };
    }
  }

  /**
   * Get PDF metadata without processing
   */
  static async getPDFInfo(file: PDFFile): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  } | null> {
    try {
      const pdfBytes = await this.getFileBytes(file);
      const pdf = await PDFDocument.load(pdfBytes);
      
      const info = {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
      };

      return info;
    } catch (error) {
      console.error('Failed to get PDF info:', error);
      return null;
    }
  }

  /**
   * Parse page range string (e.g., "1-5,7,9-12")
   */
  private static parsePageRange(rangeString: string, totalPages: number): number[] {
    const pages: number[] = [];
    const ranges = rangeString.split(',');

    for (const range of ranges) {
      const trimmedRange = range.trim();
      
      if (trimmedRange.includes('-')) {
        const [start, end] = trimmedRange.split('-').map(s => parseInt(s.trim()));
        
        if (isNaN(start) || isNaN(end)) continue;
        
        const validStart = Math.max(1, Math.min(start, totalPages));
        const validEnd = Math.max(validStart, Math.min(end, totalPages));
        
        for (let i = validStart; i <= validEnd; i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }
      } else {
        const pageNum = parseInt(trimmedRange);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  }

  /**
   * Get file bytes from PDFFile (platform-agnostic)
   */
  private static async getFileBytes(file: PDFFile): Promise<Uint8Array> {
    if (file.buffer) {
      // Web environment - file.buffer is a File object
      if (file.buffer instanceof File) {
        const arrayBuffer = await file.buffer.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      } else if (file.buffer instanceof ArrayBuffer) {
        return new Uint8Array(file.buffer);
      } else if (file.buffer instanceof Uint8Array) {
        return file.buffer;
      }
    }
    
    throw new Error('Unable to read file data');
  }
}

// Helper functions for creating PDFFile objects
export function createPDFFileFromWeb(file: File): PDFFile {
  return {
    id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    buffer: file,
  };
}

export function createPDFFileFromMobile(uri: string, name: string, size: number): PDFFile {
  return {
    id: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    size,
    type: 'application/pdf',
    uri,
  };
}

// PDF validation utilities
export function isPDFFile(file: File | { type: string }): boolean {
  return file.type === 'application/pdf' || file.type.includes('pdf');
}

export function validatePDFFile(file: File, maxSizeMB: number = 50): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!isPDFFile(file)) {
    errors.push('File must be a PDF');
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  if (file.size === 0) {
    errors.push('File is empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}