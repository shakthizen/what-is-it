import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '../../types.js';

interface Props {
  data: FlowNodeData;
  selected?: boolean;
}

export const DecisionNode: React.FC<Props> = ({ data, selected }) => {
  const { title } = data;

  return (
    <div
      className={`relative px-4 py-3 bg-[#131b2e] border border-amber-500/60 rounded-xl shadow-lg text-center transition-all ${
        selected ? 'ring-2 ring-amber-400 shadow-amber-500/20' : 'hover:border-amber-400'
      }`}
      style={{ minWidth: 150 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-amber-400" />

      <div className="flex items-center justify-center gap-1.5 mb-0.5">
        <span className="text-amber-400 text-xs">◆</span>
        <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300">Decision</span>
      </div>
      <div className="font-semibold text-slate-200 text-xs">{title}</div>

      <Handle type="source" position={Position.Right} id="yes" className="!bg-emerald-400" style={{ top: '35%' }} />
      <Handle type="source" position={Position.Bottom} id="no" className="!bg-rose-400" />
    </div>
  );
};
