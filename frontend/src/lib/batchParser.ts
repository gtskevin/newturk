type Delimiter = 'newline' | 'semicolon' | 'comma' | 'tab';

export function detectDelimiter(text: string): Delimiter {
  const lines = text.trim().split('\n');

  // Count occurrences of each delimiter
  let newlineCount = 0;
  let semicolonCount = 0;
  let commaCount = 0;
  let tabCount = 0;

  for (const line of lines) {
    if (line.includes('\t')) tabCount++;
    if (line.includes(';')) semicolonCount++;
    if (line.includes(',')) commaCount++;
    if (line.includes('\n')) newlineCount++;
  }

  // Prioritize: tab > semicolon > comma > newline
  if (tabCount > 0) return 'tab';
  if (semicolonCount > 0) return 'semicolon';
  if (commaCount > 0) return 'comma';
  return 'newline';
}

export function parseBatchInput(text: string): string[] {
  if (!text.trim()) return [];

  // Split by all possible delimiters at once using a regex
  // The regex matches: newline, semicolon, comma, or tab
  const items = text.split(/\n|;|,|\t/);

  // Trim whitespace and filter empty lines
  return items
    .map(item => item.trim())
    .filter(item => item.length > 0);
}
