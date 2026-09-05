import React, { useState, useEffect } from 'react';
import type { ProjectData } from './types.js';
import { Navbar, TabType } from './components/Navbar.js';
import { ProgressDashboard } from './components/ProgressDashboard.js';
import { WikiView } from './components/WikiView.js';
import { UserFlowGraph } from './components/UserFlowGraph.js';
import { LandingPage } from './components/LandingPage.js';

export const App: React.FC = () => {
  const getInitialTab = (): TabType => {
    try {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (['landing', 'tasks', 'wiki', 'flows'].includes(hash)) {
        return hash;
      }
      if (typeof window !== 'undefined' && (
        window.location.hostname.includes('github.io') ||
        window.location.protocol === 'file:'
      )) {
        return 'landing';
      }
    } catch {
      // ignore
    }
    return 'tasks';
  };

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<TabType>(getInitialTab);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isStaticMode, setIsStaticMode] = useState<boolean>(false);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (['landing', 'tasks', 'wiki', 'flows'].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const applyLocalOverrides = (projectData: ProjectData): ProjectData => {
    try {
      const localOverrides = localStorage.getItem('what-is-it-local-tasks');
      if (localOverrides) {
        const overrides = JSON.parse(localOverrides) as Record<string, string>;
        const updatedTasks = projectData.tasks.map(t => {
          if (overrides[t.id]) {
            return {
              ...t,
              status: overrides[t.id] as any,
              completedAt: overrides[t.id] === 'done' ? (t.completedAt || new Date().toISOString()) : undefined
            };
          }
          return t;
        });
        const doneCount = updatedTasks.filter(t => t.status === 'done').length;
        const newProgress = Math.round((doneCount / updatedTasks.length) * 100);
        return {
          ...projectData,
          tasks: updatedTasks,
          meta: {
            ...projectData.meta,
            overallProgress: newProgress
          }
        };
      }
    } catch {
      // Ignore localStorage errors
    }
    return projectData;
  };

  const fetchProjectData = async () => {
    try {
      // 1. Try local micro-server API
      try {
        const res = await fetch('/api/project');
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setError(null);
          setIsStaticMode(false);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to static file
      }

      // 2. Fallback to static data.json (for GitHub Pages / static export)
      try {
        const staticRes = await fetch('./data.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          setData(applyLocalOverrides(staticJson));
          setError(null);
          setIsStaticMode(true);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to window embed
      }

      // 3. Fallback to embedded window object if pre-injected
      if ((window as any).__WHAT_IS_IT_DATA__) {
        setData(applyLocalOverrides((window as any).__WHAT_IS_IT_DATA__));
        setError(null);
        setIsStaticMode(true);
        setLoading(false);
        return;
      }

      throw new Error('Project state unavailable from /api/project or ./data.json');
    } catch (err) {
      console.error('Failed to load project data:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    // SSE Connection for Live Real-time Sync (when server is present)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsStaticMode(false);
      };

      eventSource.onmessage = () => {
        fetchProjectData();
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleToggleTask = async (taskId: string) => {
    if (!data) return;

    // Optimistic UI update
    const updatedTasks = data.tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'done' ? 'todo' : 'done';
        return {
          ...t,
          status: newStatus as any,
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
        };
      }
      return t;
    });

    const doneCount = updatedTasks.filter(t => t.status === 'done').length;
    const newProgress = Math.round((doneCount / updatedTasks.length) * 100);

    const updatedData: ProjectData = {
      ...data,
      tasks: updatedTasks,
      meta: {
        ...data.meta,
        overallProgress: newProgress,
        updatedAt: new Date().toISOString()
      }
    };

    setData(updatedData);

    // If static mode, persist to localStorage
    if (isStaticMode) {
      try {
        const localOverrides = JSON.parse(localStorage.getItem('what-is-it-local-tasks') || '{}');
        const currentTask = updatedTasks.find(t => t.id === taskId);
        if (currentTask) {
          localOverrides[taskId] = currentTask.status;
          localStorage.setItem('what-is-it-local-tasks', JSON.stringify(localOverrides));
        }
      } catch {
        // Ignore
      }
      return;
    }

    // Otherwise, sync to micro-server
    try {
      await fetch('/api/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      console.warn('Failed to sync toggle to server, falling back to local storage:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-mono">Loading live project state...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-white">Project State Unavailable</h2>
        <p className="text-slate-400 text-xs max-w-md">
          {error || 'No project state could be loaded. Make sure `npx what-is-it init` has been executed.'}
        </p>
        <button
          onClick={fetchProjectData}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const isDocsHash = typeof window !== 'undefined' && window.location.hash.startsWith('#docs');
  const isLandingMode = (isStaticMode || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) && !isDocsHash;

  if (isLandingMode) {
    return (
      <LandingPage
        data={data}
        onOpenDocs={() => {
          window.location.hash = '#docs';
          setActiveTab('tasks');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* Top Generated Docs Navigation */}
      <Navbar
        meta={data.meta}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        isStaticMode={isStaticMode}
      />

      {/* Main Content Pane */}
      <main className="flex-1">
        {activeTab === 'tasks' && (
          <ProgressDashboard data={data} />
        )}
        {activeTab === 'wiki' && (
          <WikiView wiki={data.wiki} />
        )}
        {activeTab === 'flows' && (
          <UserFlowGraph flows={data.flows} />
        )}
      </main>
    </div>
  );
};

export default App;
