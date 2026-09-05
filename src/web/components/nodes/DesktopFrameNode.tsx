import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '../../types.js';

interface Props {
  data: FlowNodeData;
  selected?: boolean;
}

export const DesktopFrameNode: React.FC<Props> = ({ data, selected }) => {
  const { title, subtitle, actorRole, uiGuidelines, visualLayout } = data;
  const navItems = visualLayout?.navItems || ['Home', 'Docs', 'Settings'];
  const sidebarItems = visualLayout?.sidebarItems || ['Dashboard', 'Projects', 'Analytics'];
  const contentBlocks = visualLayout?.contentBlocks || [
    { type: 'stat', label: 'Metrics Card' },
    { type: 'card', label: 'Primary Content Canvas' }
  ];

  return (
    <div
      className={`group relative rounded-xl transition-all duration-200 cursor-pointer ${
        selected
          ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20'
          : 'hover:ring-1 hover:ring-indigo-400/50'
      }`}
      style={{ width: 340 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-500" />

      {/* SVG Desktop Browser Frame */}
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl text-xs">
        {/* Browser Top Bar */}
        <div className="bg-[#1e293b] px-3 py-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          {/* Address Bar */}
          <div className="bg-[#0f172a] text-slate-400 px-3 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 border border-slate-800 max-w-[170px] truncate">
            <span className="text-emerald-400">🔒</span>
            <span className="truncate">{subtitle || 'localhost:3000/app'}</span>
          </div>
          {/* Actor Role Badge */}
          {actorRole && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {actorRole}
            </span>
          )}
        </div>

        {/* Wireframe Canvas */}
        <div className="p-2.5 bg-[#090d16] flex gap-2 h-[180px]">
          {/* Wireframe Sidebar */}
          <div className="w-16 bg-[#131b2e] border border-slate-800 rounded p-1.5 flex flex-col gap-1.5 shrink-0">
            <div className="w-full h-3 bg-indigo-500/30 rounded mb-1" />
            {sidebarItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-[8px] text-slate-400 truncate">{item}</span>
              </div>
            ))}
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {/* Header bar wireframe */}
            <div className="bg-[#131b2e] border border-slate-800 rounded p-1.5 flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-[11px] truncate">{title}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-[9px] text-white font-medium">Action</span>
            </div>

            {/* Content Blocks */}
            <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
              <div className="grid grid-cols-2 gap-1.5">
                {contentBlocks.slice(0, 2).map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-[#131b2e]/80 border border-slate-800/80 rounded p-1.5 flex flex-col justify-between"
                  >
                    <span className="text-[8px] text-slate-400 truncate">{block.label}</span>
                    <div className="w-8 h-2 bg-emerald-500/20 rounded mt-1" />
                  </div>
                ))}
              </div>

              {/* Data Table / List Placeholder */}
              <div className="flex-1 bg-[#131b2e]/60 border border-slate-800/60 rounded p-1.5 flex flex-col gap-1">
                <div className="w-3/4 h-2 bg-slate-700/50 rounded" />
                <div className="w-full h-1.5 bg-slate-800 rounded" />
                <div className="w-5/6 h-1.5 bg-slate-800 rounded" />
                <div className="w-2/3 h-1.5 bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="bg-[#0f172a] px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Desktop UI Frame
          </span>
          <span className="text-indigo-400 font-medium group-hover:underline">View Specs &rarr;</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  );
};
