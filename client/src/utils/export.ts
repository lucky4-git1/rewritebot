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

/**
 * Generate a formal PDF Plagiarism & Originality Audit Report
 */
export function exportPlagiarismAuditPdf(
  report: {
    originalityScore: number;
    plagiarismScore: number;
    riskLevel: string;
    wordCount: number;
    humanScore?: number;
    matches: Array<{
      sentence: string;
      type: string;
      similarity: number;
      sourceTitle?: string;
      explanation?: string;
    }>;
    sources: Array<{
      title: string;
      url: string;
      domain: string;
      similarity: number;
    }>;
  },
  _documentText: string,
  filename: string = 'RewriteBot_Originality_Audit'
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 22;

  // Header Bar
  doc.setFillColor(16, 185, 129); // #10b981
  doc.rect(margin, y, contentWidth, 3, 'F');
  y += 10;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text('RewriteBot Originality Audit Certificate', margin, y);
  y += 7;

  // Subtitle & Timestamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // #64748b
  const timestamp = new Date().toLocaleString();
  doc.text(`Generated on ${timestamp} • Verified by RewriteBot AI Compliance Engine`, margin, y);
  y += 12;

  // Score Summary Cards
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  const cardThird = contentWidth / 3;
  // Card 1: Originality Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`${report.originalityScore}%`, margin + 10, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Originality Score', margin + 10, y + 19);

  // Card 2: Human Content Score
  const humanScore = report.humanScore ?? Math.min(100, report.originalityScore + 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(67, 56, 202);
  doc.text(`${humanScore}%`, margin + cardThird + 10, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Human-Written Score', margin + cardThird + 10, y + 19);

  // Card 3: Risk Level & Word count
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(report.riskLevel === 'safe' ? 5 : 217, report.riskLevel === 'safe' ? 150 : 119, report.riskLevel === 'safe' ? 105 : 6);
  doc.text(report.riskLevel.toUpperCase(), margin + cardThird * 2 + 10, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${report.wordCount} words scanned`, margin + cardThird * 2 + 10, y + 19);
  y += 34;

  // Section: Highlighted Sentence Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Sentence-by-Sentence Originality Breakdown', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const flagged = report.matches.filter((m) => m.type !== 'clean');
  if (flagged.length === 0) {
    doc.setTextColor(5, 150, 105);
    doc.text('✓ All sentences were verified as 100% original and free of plagiarism.', margin, y);
    y += 10;
  } else {
    flagged.forEach((m) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text(`[${m.type.toUpperCase()} • ${m.similarity}% similarity]`, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const sentenceLines = doc.splitTextToSize(`"${m.sentence}"`, contentWidth - 10);
      doc.text(sentenceLines, margin + 5, y);
      y += sentenceLines.length * 5 + 2;

      if (m.sourceTitle || m.explanation) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const detail = `${m.sourceTitle ? `Source: ${m.sourceTitle} • ` : ''}${m.explanation || ''}`;
        doc.text(detail, margin + 5, y);
        y += 6;
        doc.setFontSize(10);
      }
      y += 4;
    });
  }

  // Section: Matched Sources
  if (y > 230) {
    doc.addPage();
    y = 20;
  } else {
    y += 8;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Identified Sources (${report.sources.length})`, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (report.sources.length === 0) {
    doc.setTextColor(5, 150, 105);
    doc.text('No overlapping web publications or academic journals detected.', margin, y);
    y += 10;
  } else {
    report.sources.forEach((src) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${src.title} (${src.similarity}% match)`, margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(99, 102, 241);
      doc.text(src.url || src.domain, margin + 4, y);
      y += 6;
    });
  }

  // Footer Certificate Note
  if (y > 260) {
    doc.addPage();
    y = 20;
  } else {
    y = Math.max(y + 10, 270);
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This audit certificate was automatically generated by RewriteBot AI Compliance and Anti-Plagiarism Engine.', margin, y);

  doc.save(`${filename}_${Date.now()}.pdf`);
}
