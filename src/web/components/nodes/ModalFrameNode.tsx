import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '../../types.js';

interface Props {
  data: FlowNodeData;
  selected?: boolean;
}

export const ModalFrameNode: React.FC<Props> = ({ data, selected }) => {
  const { title, subtitle, actorRole, visualLayout } = data;
  const contentBlocks = visualLayout?.contentBlocks || [{ type: 'form', label: 'Input Fields' }];

  return (
    <div
      className={`group relative rounded-xl transition-all duration-200 cursor-pointer ${
        selected
          ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20'
          : 'hover:ring-1 hover:ring-indigo-400/50'
      }`}
      style={{ width: 280 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-500" />

      {/* Modal Frame with Frosted Backdrop effect */}
      <div className="bg-[#0f172a]/95 border-2 border-indigo-500/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md text-xs">
        {/* Modal Header */}
        <div className="bg-[#1e293b]/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
            <span className="font-semibold text-slate-200 text-[11px] truncate">{title}</span>
          </div>
          <span className="text-slate-400 hover:text-white text-[12px] font-mono leading-none">&times;</span>
        </div>

        {/* Modal Body */}
        <div className="p-3 bg-[#090d16]/90 flex flex-col gap-2">
          {actorRole && (
            <div className="flex justify-end">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Target: {actorRole}
              </span>
            </div>
          )}

          {/* Form input wireframes */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="w-12 h-1.5 bg-slate-400 rounded" />
              <div className="w-full h-6 bg-[#131b2e] border border-slate-700 rounded px-2 flex items-center">
                <span className="text-[9px] text-slate-500">username@example.com</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="w-16 h-1.5 bg-slate-400 rounded" />
              <div className="w-full h-6 bg-[#131b2e] border border-slate-700 rounded px-2 flex items-center justify-between">
                <span className="text-[9px] text-slate-500">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
                <span className="text-[8px] text-slate-500">👁</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-1 mt-1 border-t border-slate-800">
            <button className="px-2 py-1 rounded text-[9px] text-slate-400 bg-slate-800/80">Cancel</button>
            <button className="px-2.5 py-1 rounded text-[9px] text-white font-medium bg-indigo-600 shadow">
              Confirm
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#0f172a] px-3 py-1 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
          <span>Modal Dialog</span>
          <span className="text-indigo-400 font-medium group-hover:underline">Specs &rarr;</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  );
};
