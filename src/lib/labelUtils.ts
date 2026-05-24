const hexPattern = /^#[0-9A-Fa-f]{6}$/;

export interface ParsedLabel {
  color: string;
  opinion: string;
  details: string;
}

export function parseLabel(label: string): ParsedLabel {
  if (!label) return { color: '', opinion: '', details: '' };

  // 格式: #color::opinion||details
  let base = label;
  let details = '';
  const pipeIdx = label.indexOf('||');
  if (pipeIdx >= 0) {
    base = label.slice(0, pipeIdx);
    details = label.slice(pipeIdx + 2);
  }

  const parts = base.split('::');
  const color = hexPattern.test(parts[0]) ? parts[0] : '';
  const opinion = parts[1] ?? '';

  if (!color && !opinion) {
    // 旧格式兼容：纯文本当作看法
    return { color: '', opinion: label, details: '' };
  }

  return { color, opinion, details };
}

export function encodeLabel(color: string, opinion: string, details: string): string {
  const base = `${color}::${opinion || ''}`;
  return details ? `${base}||${details}` : base;
}
