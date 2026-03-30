import { convert } from 'html-to-text';

export function generatePlainText(html: string): string {
  return convert(html, {
    wordwrap: 80,
    preserveNewlines: true,
    selectors: [
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'h4', options: { uppercase: false } },
      { selector: 'h5', options: { uppercase: false } },
      { selector: 'h6', options: { uppercase: false } },
    ],
  });
}
