import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNodeData } from '../../types.js';

interface Props {
  data: FlowNodeData;
  selected?: boolean;
}

export const ActorNode: React.FC<Props> = ({ data, selected }) => {
  const { title, subtitle, actorRole } = data;

  return (
    <div
      className={`group relative rounded-full px-4 py-2.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/80 border border-indigo-500/50 shadow-lg text-xs flex items-center gap-3 transition-all ${
        selected ? 'ring-2 ring-indigo-400 shadow-indigo-500/30' : 'hover:border-indigo-400'
      }`}
      style={{ minWidth: 160 }}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-sm shadow-inner shrink-0">
        👤
      </div>
      <div>
        <div className="font-bold text-white text-xs leading-tight">{title}</div>
        <div className="text-[10px] text-indigo-300">{subtitle || actorRole || 'Actor Role'}</div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-2.5 !h-2.5" />
    </div>
  );
};
