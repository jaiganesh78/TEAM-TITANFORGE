export interface ChunkPayload {
  content: string;
  section?: string;
  pageNumber?: number;
  tokenCount: number;
}

export class ChunkingService {
  /**
   * Splitting logic based on configured format.
   */
  static splitText(text: string, format: 'paragraph' | 'section' | 'table' | 'document' | 'website'): ChunkPayload[] {
    const cleanText = text.trim();
    if (!cleanText) return [];

    switch (format) {
      case 'section':
        return this.splitBySections(cleanText);
      case 'table':
        return this.splitByTables(cleanText);
      case 'paragraph':
      case 'website':
      case 'document':
      default:
        return this.splitByParagraphs(cleanText);
    }
  }

  private static splitByParagraphs(text: string): ChunkPayload[] {
    const paragraphs = text.split(/\n\s*\n+/);
    return paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map((p, idx) => ({
        content: p,
        section: `Paragraph ${idx + 1}`,
        tokenCount: Math.ceil(p.length / 4)
      }));
  }

  private static splitBySections(text: string): ChunkPayload[] {
    // Matches markdown-style header section lines
    const sections = text.split(/(?=^#+\s+)/m);
    return sections
      .map(sec => sec.trim())
      .filter(sec => sec.length > 0)
      .map(sec => {
        const firstLine = sec.split('\n')[0];
        const heading = firstLine.replace(/^#+\s+/, '').trim();
        return {
          content: sec,
          section: heading || 'Introduction',
          tokenCount: Math.ceil(sec.length / 4)
        };
      });
  }

  private static splitByTables(text: string): ChunkPayload[] {
    // Group table rows or csv records
    const lines = text.split('\n');
    const chunks: ChunkPayload[] = [];
    let currentBlock: string[] = [];

    for (const line of lines) {
      if (line.includes('|') || line.includes(',')) {
        currentBlock.push(line);
      } else if (currentBlock.length > 0) {
        chunks.push({
          content: currentBlock.join('\n'),
          section: 'Table Extract',
          tokenCount: Math.ceil(currentBlock.join('\n').length / 4)
        });
        currentBlock = [];
      }
    }

    if (currentBlock.length > 0) {
      chunks.push({
        content: currentBlock.join('\n'),
        section: 'Table Extract',
        tokenCount: Math.ceil(currentBlock.join('\n').length / 4)
      });
    }

    // If no tables found, fallback to paragraph splitter
    return chunks.length > 0 ? chunks : this.splitByParagraphs(text);
  }
}
