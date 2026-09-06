import React, { useState, useEffect, useMemo, useRef } from 'react';
import { marked } from 'marked';
import type { WikiPage } from '../types.js';

// Wiki content ultimately comes from `.what-is-it.bin`, which agents write to via
// `import`/the HTTP API. Treat it as untrusted: escape raw HTML tokens outright (marked
// passes inline/block HTML through verbatim by default) and restrict link/image URLs to
// safe protocols before this ever reaches dangerouslySetInnerHTML.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function sanitizeUrl(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return escapeHtml(trimmed);
  }
  try {
    const url = new URL(trimmed, 'https://placeholder.invalid');
    if (SAFE_URL_PROTOCOLS.has(url.protocol)) return escapeHtml(trimmed);
  } catch {
    // Not a parseable absolute URL — fall through to reject
  }
  return '#';
}

interface Props {
  wiki: WikiPage[];
}

export const WikiView: React.FC<Props> = ({ wiki }) => {
  const [selectedPageId, setSelectedPageId] = useState<string>(wiki[0]?.id || '');
  const [activeBookmarkId, setActiveBookmarkId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  const activePage = useMemo(() => {
    return wiki.find(p => p.id === selectedPageId) || wiki[0];
  }, [wiki, selectedPageId]);

  // Extract bookmarks dynamically from markdown if not already indexed
  const bookmarks = useMemo(() => {
    if (!activePage) return [];
    if (activePage.bookmarks && activePage.bookmarks.length > 0) {
      return activePage.bookmarks;
    }

    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: Array<{ id: string; title: string; level: number }> = [];
    let match;
    while ((match = headingRegex.exec(activePage.content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      items.push({ id, title, level });
    }
    return items;
  }, [activePage]);

  // Parse markdown with IDs attached to headings for scroll-spy
  const htmlContent = useMemo(() => {
    if (!activePage) return '';

    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }) => {
      const rawText = text.replace(/<[^>]*>/g, '');
      const id = rawText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const safeText = escapeHtml(rawText);
      return `<h${depth} id="${id}" class="scroll-mt-20 group relative flex items-center font-bold tracking-tight text-white ${
        depth === 2 ? 'text-xl mt-8 mb-4 pb-2 border-b border-slate-800' : 'text-base mt-6 mb-3'
      }">
        <span>${safeText}</span>
        <a href="#${id}" class="ml-2 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-indigo-400 text-sm transition-opacity">#</a>
      </h${depth}>`;
    };
    // Raw HTML embedded in markdown source (inline or block) is untrusted — escape it
    // instead of passing it through, which is marked's insecure default behavior.
    renderer.html = ({ text }) => escapeHtml(text);
    renderer.link = ({ href, title, text }) => {
      const safeHref = sanitizeUrl(href);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${safeHref}"${titleAttr} rel="noopener noreferrer">${escapeHtml(text)}</a>`;
    };
    renderer.image = ({ href, title, text }) => {
      const safeHref = sanitizeUrl(href);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${safeHref}" alt="${escapeHtml(text)}"${titleAttr} />`;
    };

    return marked(activePage.content, { renderer, gfm: true, breaks: true }) as string;
  }, [activePage]);

  // Scroll spy to update active bookmark
  useEffect(() => {
    const handleScroll = () => {
      if (bookmarks.length === 0) return;
      const scrollY = window.scrollY;

      for (let i = bookmarks.length - 1; i >= 0; i--) {
        const el = document.getElementById(bookmarks[i].id);
        if (el && el.offsetTop - 120 <= scrollY) {
          setActiveBookmarkId(bookmarks[i].id);
          return;
        }
      }
      setActiveBookmarkId(bookmarks[0]?.id || '');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bookmarks]);

  const scrollToBookmark = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveBookmarkId(id);
    }
  };

  if (!activePage) {
    return <div className="p-8 text-center text-slate-500">No documentation pages found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 relative items-start">
      {/* Left Navigation: Wiki Categories & Pages */}
      <aside className="w-64 shrink-0 sticky top-24 space-y-6 hidden md:block">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2">
            Documentation Index
          </div>
          <nav className="space-y-1">
            {wiki.map(page => (
              <button
                key={page.id}
                onClick={() => {
                  setSelectedPageId(page.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  selectedPageId === page.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate">{page.title}</span>
                <span className="text-[10px] opacity-60">📑</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Visual Tip Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
            <span>💡</span>
            <span>Agent-Native Wiki</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            This documentation is continuously kept in sync by agents using the{' '}
            <code className="text-indigo-300 font-mono">what-is-it</code> skill.
          </p>
        </div>
      </aside>

      {/* Center Pane: Rich Article Content */}
      <main className="flex-1 min-w-0 bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-xl">
        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activePage.category}
            </span>
            <span className="text-slate-500 text-xs font-mono">
              Last updated {new Date(activePage.lastModified).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {activePage.title}
          </h1>
        </div>

        {/* Visual Architecture Graphic Banner */}
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-lg">
              📊
            </div>
            <div>
              <div className="text-xs font-bold text-white">Visual Technical Specification</div>
              <div className="text-[11px] text-slate-400">
                Interactive architecture reference for humans and agents
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Validated
          </span>
        </div>

        {/* Markdown Rendered Content */}
        <div
          ref={contentRef}
          className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed space-y-4
            prose-headings:text-white
            prose-p:leading-relaxed
            prose-pre:bg-[#090d16] prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl
            prose-code:text-indigo-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-table:border prose-table:border-slate-800 prose-table:rounded-xl prose-table:overflow-hidden
            prose-th:bg-slate-800/60 prose-th:p-2.5 prose-th:text-xs prose-th:text-slate-200
            prose-td:p-2.5 prose-td:border-t prose-td:border-slate-800 prose-td:text-xs"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>

      {/* Right-Side Bookmarks Navigation (Table of Contents) */}
      <aside className="w-60 shrink-0 sticky top-24 hidden lg:block space-y-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span>📑</span>
            <span>On This Page</span>
          </div>

          <nav className="space-y-1 text-xs">
            {bookmarks.map(bm => {
              const isActive = activeBookmarkId === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => scrollToBookmark(bm.id)}
                  className={`w-full text-left py-1 px-2 rounded-lg text-xs transition-all truncate block ${
                    bm.level === 3 ? 'pl-4 text-[11px]' : ''
                  } ${
                    isActive
                      ? 'text-indigo-400 font-bold bg-indigo-500/10 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {bm.title}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
};
