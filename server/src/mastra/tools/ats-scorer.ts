export function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  return Array.from(new Set(words)).slice(0, 10);
}
