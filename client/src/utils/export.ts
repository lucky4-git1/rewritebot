import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
export type ExportFormat = 'txt' | 'docx' | 'pdf' | 'md';

/**
 * Export text to TXT format
 */
function exportToTxt(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
}

/**
 * Export text to DOCX format
 */
async function exportToDocx(content: string, filename: string): Promise<void> {
  // Split content into paragraphs
  const paragraphs = content.split('\n').map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || ' ', // Empty lines need a space
            size: 24, // 12pt font
          }),
        ],
        spacing: {
          after: 200, // Space after paragraph
        },
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

/**
 * Export text to PDF format
 */
function exportToPdf(content: string, filename: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  const fontSize = 12;

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(content, maxWidth);
  
  let y = margin;
  
  lines.forEach((line: string) => {
    // Check if we need a new page
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Export text to Markdown format
 */
function exportToMarkdown(content: string, filename: string): void {
  // Add basic markdown formatting if not already present
  let mdContent = content;
  
  // If content doesn't have markdown headers, wrap it
  if (!content.includes('#')) {
    mdContent = `# ${filename}\n\n${content}`;
  }
  
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${filename}.md`);
}

/**
 * Main export function
 */
export async function exportDocument(
  content: string,
  filename: string,
  format: ExportFormat
): Promise<void> {
  // Sanitize filename
  const sanitizedFilename = filename.replace(/[^a-z0-9_\-]/gi, '_');

  switch (format) {
    case 'txt':
      exportToTxt(content, sanitizedFilename);
      break;
    case 'docx':
      await exportToDocx(content, sanitizedFilename);
      break;
    case 'pdf':
      exportToPdf(content, sanitizedFilename);
      break;
    case 'md':
      exportToMarkdown(content, sanitizedFilename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  return format;
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    md: 'text/markdown',
  };
  return mimeTypes[format];
}
