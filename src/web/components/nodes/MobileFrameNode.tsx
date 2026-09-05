import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '../../types.js';

interface Props {
  data: FlowNodeData;
  selected?: boolean;
}

export const MobileFrameNode: React.FC<Props> = ({ data, selected }) => {
  const { title, subtitle, actorRole, visualLayout } = data;
  const bottomNav = visualLayout?.bottomNav || ['Home', 'Explore', 'Profile'];

  return (
    <div
      className={`group relative transition-all duration-200 cursor-pointer ${
        selected
          ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20'
          : 'hover:ring-1 hover:ring-indigo-400/50'
      } rounded-[28px]`}
      style={{ width: 220 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-500" />

      {/* Outer Phone Bezel */}
      <div className="bg-[#0f172a] border-4 border-slate-700/80 rounded-[28px] overflow-hidden shadow-2xl text-xs flex flex-col">
        {/* Dynamic Island / Status Bar */}
        <div className="bg-[#090d16] px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-slate-800">
          <span className="text-[9px] font-mono text-slate-400">9:41</span>
          <div className="w-16 h-3 bg-black rounded-full flex items-center justify-center border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <span>5G</span>
            <span>⚡</span>
          </div>
        </div>

        {/* Screen Canvas */}
        <div className="bg-[#090d16] p-2.5 flex flex-col gap-2 h-[220px] overflow-hidden justify-between">
          {/* Top Title Bar */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <span className="font-bold text-slate-200 text-[10px] truncate">{title}</span>
            {actorRole && (
              <span className="px-1 py-0.2 rounded text-[8px] font-medium bg-indigo-500/20 text-indigo-300">
                {actorRole}
              </span>
            )}
          </div>

          {/* Wireframe Mobile Cards */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="bg-[#131b2e] border border-slate-800 rounded-lg p-2">
              <div className="w-3/4 h-2 bg-indigo-400/30 rounded mb-1.5" />
              <div className="w-full h-1.5 bg-slate-700/40 rounded mb-1" />
              <div className="w-1/2 h-1.5 bg-slate-800 rounded" />
            </div>

            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#131b2e]/60 border border-slate-800/60 rounded p-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-800 shrink-0" />
                  <div className="flex-1">
                    <div className="w-3/4 h-1.5 bg-slate-700/60 rounded mb-0.5" />
                    <div className="w-1/2 h-1 bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Mobile Tab Bar */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-lg py-1 px-2 flex justify-around items-center">
            {bottomNav.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-slate-600 mb-0.5" />
                <span className="text-[7px] text-slate-400 truncate">{item}</span>
              </div>
            ))}
          </div>

          {/* Home Indicator Bar */}
          <div className="flex justify-center pt-0.5">
            <div className="w-16 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#0f172a] px-2.5 py-1 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
          <span>Mobile Frame</span>
          <span className="text-indigo-400 font-medium group-hover:underline">Specs &rarr;</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  );
};
