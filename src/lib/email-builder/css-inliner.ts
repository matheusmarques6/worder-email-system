import juice from 'juice';

export function inlineCss(html: string): string {
  return juice(html, {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    removeStyleTags: false,
  });
}
