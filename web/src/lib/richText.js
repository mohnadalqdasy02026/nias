// Render stored page content. The admin editor stores HTML; this normalizes
// stray markdown artifacts (e.g. literal **bold**) into formatted HTML.
export function renderRichText(html = '') {
  return String(html)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>');
}