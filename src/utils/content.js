export const plainTextFromHtml = (html = '') => {
  if (!html || typeof html !== 'string') return '';
  const spacedHtml = html
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n');
  if (typeof window === 'undefined') {
    return spacedHtml.replace(/<[^>]*>/g, ' ').split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');
  }

  const documentFragment = new DOMParser().parseFromString(spacedHtml, 'text/html');
  documentFragment.querySelectorAll('script, style, iframe, object, embed, noscript').forEach((element) => element.remove());
  return (documentFragment.body.textContent || '').split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};
