import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge
} from '@xyflow/react';
import type { UserFlow, FlowNode } from '../types.js';
import { DesktopFrameNode } from './nodes/DesktopFrameNode.js';
import { MobileFrameNode } from './nodes/MobileFrameNode.js';
import { ModalFrameNode } from './nodes/ModalFrameNode.js';
import { ActorNode } from './nodes/ActorNode.js';
import { DecisionNode } from './nodes/DecisionNode.js';
import { Drawer } from './Drawer.js';

interface Props {
  flows: UserFlow[];
}

const nodeTypes = {
  desktopFrame: DesktopFrameNode,
  mobileFrame: MobileFrameNode,
  modalFrame: ModalFrameNode,
  actorNode: ActorNode,
  decisionNode: DecisionNode
};

export const UserFlowGraph: React.FC<Props> = ({ flows }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeInspectorNode, setActiveInspectorNode] = useState<FlowNode | null>(null);

  const activeFlow = useMemo(() => {
    return flows.find(f => f.id === selectedFlowId) || flows[0];
  }, [flows, selectedFlowId]);

  // Distinct roles in the active flow
  const distinctRoles = useMemo(() => {
    if (!activeFlow) return [];
    const roles = new Set<string>();
    for (const node of activeFlow.nodes) {
      if (node.data.actorRole) roles.add(node.data.actorRole);
    }
    return Array.from(roles);
  }, [activeFlow]);

  // Filter nodes & edges by role if selected
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!activeFlow) return { initialNodes: [], initialEdges: [] };

    let nodes = activeFlow.nodes;
    let edges = activeFlow.edges;

    if (selectedRole !== 'all') {
      const allowedNodeIds = new Set<string>();
      nodes = nodes.filter(n => {
        const matches = !n.data.actorRole || n.data.actorRole === selectedRole;
        if (matches) allowedNodeIds.add(n.id);
        return matches;
      });
      edges = edges.filter(e => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target));
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [activeFlow, selectedRole]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

  // Update nodes when initialNodes changes
  React.useEffect(() => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges as Edge[]);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveInspectorNode(node as unknown as FlowNode);
  }, []);

  if (!activeFlow) {
    return <div className="p-8 text-center text-slate-500">No user flows defined.</div>;
  }

  return (
    <div className="relative w-full h-[calc(100vh-65px)] flex flex-col bg-[#090d16]">
      {/* Top Toolbar */}
      <div className="z-10 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Flow selector dropdown */}
          <select
            value={selectedFlowId}
            onChange={e => setSelectedFlowId(e.target.value)}
            className="bg-[#131b2e] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          >
            {flows.map(f => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>

          <p className="hidden md:block text-xs text-slate-400 truncate max-w-md">
            {activeFlow.description}
          </p>
        </div>

        {/* Role Filter & Visual Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Actor Filter:</span>
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Roles
            </button>
            {distinctRoles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
              Desktop Frame
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
              Mobile Frame
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              Modal Frame
            </span>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-[#090d16]"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#1e293b" />
          <Controls position="bottom-right" />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#1e293b"
            maskColor="rgba(9, 13, 22, 0.75)"
            position="bottom-left"
            className="!bg-[#0f172a] !border !border-slate-800 !rounded-xl !overflow-hidden"
          />
        </ReactFlow>

        {/* Slide-over Specs & UI Guidelines Drawer */}
        <Drawer
          node={activeInspectorNode}
          onClose={() => setActiveInspectorNode(null)}
        />
      </div>
    </div>
  );
};
