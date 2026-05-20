export function countChars(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length;
}

export function totalChars(data: Record<string, string | undefined | null>, keys: string[]): number {
  let total = 0;
  for (const key of keys) {
    const val = data[key];
    if (val) total += countChars(val);
  }
  return total;
}
