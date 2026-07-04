export class DocumentParserService {
  /**
   * Simulates parsing content of a document depending on its MIME type/extension.
   */
  static parseDocument(fileName: string, mimeType: string, content: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Simulate modular parser selection
    switch (ext) {
      case 'pdf':
        return `[PDF Layout Extraction] Page 1: Headings & Tables \n ${content}`;
      case 'docx':
        return `[DOCX Word Extraction] Paragraphs structure: \n ${content}`;
      case 'csv':
        return `[CSV Table Parse] Row format: \n ${content}`;
      case 'xlsx':
        return `[Excel Sheet Parse] Columns and cells: \n ${content}`;
      case 'pptx':
        return `[Powerpoint Slide Parse] Slide headers: \n ${content}`;
      default:
        return `[Raw Extraction]: \n ${content}`;
    }
  }
}
