"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkingService = void 0;
class ChunkingService {
    /**
     * Splitting logic based on configured format.
     */
    static splitText(text, format) {
        const cleanText = text.trim();
        if (!cleanText)
            return [];
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
    static splitByParagraphs(text) {
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
    static splitBySections(text) {
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
    static splitByTables(text) {
        // Group table rows or csv records
        const lines = text.split('\n');
        const chunks = [];
        let currentBlock = [];
        for (const line of lines) {
            if (line.includes('|') || line.includes(',')) {
                currentBlock.push(line);
            }
            else if (currentBlock.length > 0) {
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
exports.ChunkingService = ChunkingService;
