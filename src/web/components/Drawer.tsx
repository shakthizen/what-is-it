import React from 'react';
import type { FlowNode } from '../types.js';

interface DrawerProps {
  node: FlowNode | null;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ node, onClose }) => {
  if (!node) return null;

  const { data } = node;
  const guidelines = data.uiGuidelines;
  const layout = data.visualLayout;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131b2e]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              UI Specs & Guidelines
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-0.5 truncate">{data.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Meta details */}
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Actor Role</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {data.actorRole || 'All Roles'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Frame Layout</span>
            <span className="text-slate-200 font-medium capitalize">{data.frameType || 'Default'}</span>
          </div>
          {data.subtitle && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Path</span>
              <span className="text-indigo-400 font-mono text-[11px] truncate max-w-[180px]">
                {data.subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Design Tokens: Colors */}
        {guidelines?.colors && guidelines.colors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>🎨</span> Color Palette Tokens
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {guidelines.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="bg-[#131b2e] border border-slate-800 rounded-lg p-2 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full h-6 rounded border border-white/10 shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-[10px] text-slate-300">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout & Typography */}
        {(guidelines?.layout || guidelines?.typography || guidelines?.responsive) && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>📐</span> Layout & Typography Specs
            </h3>
            <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3 space-y-2.5">
              {guidelines.layout && (
                <div>
                  <div className="text-[10px] text-slate-400">Layout Pattern</div>
                  <div className="text-slate-200 font-medium mt-0.5">{guidelines.layout}</div>
                </div>
              )}
              {guidelines.typography && (
                <div>
                  <div className="text-[10px] text-slate-400">Typography Scale</div>
                  <div className="text-slate-200 font-mono text-[11px] mt-0.5">{guidelines.typography}</div>
                </div>
              )}
              {guidelines.responsive && (
                <div>
                  <div className="text-[10px] text-slate-400">Responsive Rules</div>
                  <div className="text-slate-200 mt-0.5">{guidelines.responsive}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wireframe Blueprint Elements */}
        {layout?.contentBlocks && layout.contentBlocks.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>🧩</span> Wireframe Blueprint Components
            </h3>
            <div className="space-y-1.5">
              {layout.contentBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bg-[#131b2e] border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-slate-200 font-medium">{block.label}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    {block.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines / Acceptance Checklist */}
        {guidelines?.specs && guidelines.specs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>✔</span> UI Guidelines Checklist
            </h3>
            <ul className="space-y-1.5">
              {guidelines.specs.map((spec, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#131b2e]/60 border border-slate-800/80 rounded-lg p-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="text-slate-300 leading-relaxed">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions & Triggers */}
        {data.actions && data.actions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>⚡</span> Triggers & Outgoing Actions
            </h3>
            <div className="space-y-1.5">
              {data.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-indigo-200 font-medium">{act.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">&rarr; {act.targetNodeId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#090d16] text-[10px] text-slate-500 flex justify-between items-center">
        <span>what-is-it live inspector</span>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
