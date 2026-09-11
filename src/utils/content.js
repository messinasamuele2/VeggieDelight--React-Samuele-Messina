export const plainTextFromHtml = (html = '') => {
  if (typeof window === 'undefined' || !html) return html;

  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('script, style, iframe, object').forEach((element) => element.remove());
  return documentFragment.body.textContent?.trim() || '';
};
