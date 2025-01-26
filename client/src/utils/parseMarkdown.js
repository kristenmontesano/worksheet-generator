export const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  return (
    markdown
      // Remove bold (e.g., "**text**" -> "text")
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic (e.g., "*text*" or "_text_" -> "text")
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove bold+italic (e.g., "***text***" or "___text___" -> "text")
      .replace(/(\*\*\*|___)(.*?)\1/g, '$2')
      // Remove strikethrough (e.g., "~~text~~" -> "text")
      .replace(/~~(.*?)~~/g, '$1')
      // Remove inline code (e.g., "`code`" -> "code")
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks (e.g., ```code```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove headings (e.g., "# Heading" -> "Heading")
      .replace(/(^|\n)#+\s*(.+)/g, '$2')
      // Remove unordered list markers (e.g., "- Item", "* Item", "+ Item" -> "Item")
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove ordered list markers (e.g., "1. Item" -> "1. Item")
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove blockquotes (e.g., "> text" -> "text")
      .replace(/^>\s?/gm, '')
      // Remove images (e.g., "![alt](url)" -> "")
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove links but keep link text (e.g., "[text](url)" -> "text")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      // Replace multiple newlines with a single newline
      .replace(/\n{2,}/g, '\n')
      // Trim leading and trailing spaces
      .trim()
  );
};

export default parseMarkdown;
