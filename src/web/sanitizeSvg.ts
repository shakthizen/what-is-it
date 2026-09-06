/**
 * Sanitizes agent-generated inline SVG (`FlowNodeData.mockupSvg`) before it is rendered via
 * dangerouslySetInnerHTML. This markup ultimately comes from `.what-is-it.bin`, which is
 * written by `import`/the HTTP API — untrusted by the time it reaches the browser — so it
 * gets the same treatment as the wiki markdown in WikiView: strip anything that can execute
 * script (`<script>`, `on*` handlers, `javascript:`/`data:` URIs) while keeping the visual
 * markup (shapes, text, gradients) intact.
 */

const DISALLOWED_TAGS = new Set(['script', 'foreignobject', 'iframe', 'embed', 'object', 'style']);
const URL_ATTRS = new Set(['href', 'xlink:href', 'src']);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('#')) return true;
  return trimmed.startsWith('data:image/') || /^https?:/.test(trimmed);
}

function sanitizeElement(el: Element): void {
  if (DISALLOWED_TAGS.has(el.tagName.toLowerCase())) {
    el.remove();
    return;
  }

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (URL_ATTRS.has(name) && !isSafeUrl(attr.value)) {
      el.removeAttribute(attr.name);
    }
  }

  for (const child of Array.from(el.children)) {
    sanitizeElement(child);
  }
}

export function sanitizeSvgMarkup(svg: string): string | null {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null;
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== 'svg' || root.querySelector('parsererror')) {
      return null;
    }
    sanitizeElement(root);
    return new XMLSerializer().serializeToString(root);
  } catch {
    return null;
  }
}
