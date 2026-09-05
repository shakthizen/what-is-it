import React from 'react';
import type { ProjectMeta } from '../types.js';

export type TabType = 'tasks' | 'wiki' | 'flows';

interface NavbarProps {
  meta: ProjectMeta;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isConnected: boolean;
  isStaticMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  meta,
  activeTab,
  setActiveTab,
  isConnected,
  isStaticMode = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">{meta.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                v{meta.version}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wider">
                {meta.projectType}
              </span>
            </div>
          </div>
        </div>

        {/* Live SSE Status (only if connected or reconnecting) */}
        {!isStaticMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-400 font-medium">Live Sync</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-400 font-medium">Reconnecting</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="flex items-center bg-[#0d131f] p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📋</span>
          <span className="hidden sm:inline">Feature Specs & Gaps</span>
          <span className="sm:hidden">Specs</span>
        </button>

        <button
          onClick={() => setActiveTab('wiki')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'wiki'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📖</span>
          <span className="hidden sm:inline">Wiki Docs</span>
          <span className="sm:hidden">Wiki</span>
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'flows'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🕸️</span>
          <span className="hidden sm:inline">Visual Graph</span>
          <span className="sm:hidden">Graph</span>
        </button>
      </nav>

      {/* Right: Progress Indicator Pill */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
            Overall Completion
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${meta.overallProgress}%` }}
              />
            </div>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              {meta.overallProgress}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
