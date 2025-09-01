import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const pdfBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(file: File, pageRanges: string[]): Promise<{ name: string; data: Uint8Array }[]> {
  const pdfBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(pdfBytes);
  const results: { name: string; data: Uint8Array }[] = [];

  for (let i = 0; i < pageRanges.length; i++) {
    const range = pageRanges[i];
    const splitPdf = await PDFDocument.create();
    
    // Parse page range (e.g., "1-5", "3", "7-10")
    const pages = parsePageRange(range, pdf.getPageCount());
    const copiedPages = await splitPdf.copyPages(pdf, pages.map(p => p - 1)); // Convert to 0-based
    
    copiedPages.forEach((page) => splitPdf.addPage(page));
    
    const pdfBytes = await splitPdf.save();
    const baseName = file.name.replace('.pdf', '');
    
    results.push({
      name: `${baseName}_pages_${range}.pdf`,
      data: pdfBytes,
    });
  }

  return results;
}

export async function compressPDF(file: File, quality: number = 0.7): Promise<Uint8Array> {
  const pdfBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(pdfBytes);
  
  // Basic compression - in a real implementation, you'd need more sophisticated compression
  // This is a simplified version that just saves the PDF again
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return compressedBytes;
}

function parsePageRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  
  if (range.includes('-')) {
    const [start, end] = range.split('-').map(n => parseInt(n.trim()));
    for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
      pages.push(i);
    }
  } else {
    const pageNum = parseInt(range.trim());
    if (pageNum >= 1 && pageNum <= totalPages) {
      pages.push(pageNum);
    }
  }
  
  return pages;
}