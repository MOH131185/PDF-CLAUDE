import { NextRequest, NextResponse } from 'next/server';
import { mergePDFs, splitPDF, compressPDF } from '@/lib/pdf-operations';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handler(req: NextRequest) {
  try {
    // Check if we're in a build environment without proper setup
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      // Allow operations in development/build
    }
    const formData = await req.formData();
    const operation = formData.get('operation') as string;
    
    switch (operation) {
      case 'merge': {
        const files = formData.getAll('files') as File[];
        if (files.length < 2) {
          return NextResponse.json({ error: 'At least 2 files required for merging' }, { status: 400 });
        }
        
        const mergedPDF = await mergePDFs(files);
        
        return new NextResponse(Buffer.from(mergedPDF), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="merged.pdf"',
          },
        });
      }
      
      case 'split': {
        const file = formData.get('file') as File;
        const pageRanges = JSON.parse(formData.get('pageRanges') as string);
        
        if (!file) {
          return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }
        
        const splitPDFs = await splitPDF(file, pageRanges);
        
        return NextResponse.json({ files: splitPDFs });
      }
      
      case 'compress': {
        const file = formData.get('file') as File;
        
        if (!file) {
          return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }
        
        const compressedPDF = await compressPDF(file);
        
        return new NextResponse(Buffer.from(compressedPDF), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="compressed.pdf"',
          },
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('PDF operation error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(rateLimiters.pdfOperations, handler);