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
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/20">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">{meta.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                v{meta.version}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {meta.projectType}
              </span>
            </div>
          </div>
        </div>

        {/* Live SSE / Static Mode Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
          {isStaticMode ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-cyan-300 font-medium">GitHub Pages</span>
            </>
          ) : isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium">Live Sync</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-medium">Reconnecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="flex items-center bg-[#0f172a] p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <span>📊</span>
          <span>Tasks & Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('wiki')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'wiki'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <span>📖</span>
          <span>Wiki Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'flows'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <span>🕸️</span>
          <span>Visual Graph & UI</span>
        </button>
      </nav>

      {/* Right: Progress Indicator Pill */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Overall Completion
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
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
