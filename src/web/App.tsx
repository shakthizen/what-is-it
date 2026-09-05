import React, { useState, useEffect } from 'react';
import type { ProjectData } from './types.js';
import { Navbar, TabType } from './components/Navbar.js';
import { ProgressDashboard } from './components/ProgressDashboard.js';
import { WikiView } from './components/WikiView.js';
import { UserFlowGraph } from './components/UserFlowGraph.js';

export const App: React.FC = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch('/api/project');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Failed to load project data:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    // SSE Connection for Live Real-time Sync
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = () => {
        // State changed externally (e.g. from agent CLI task done) -> refresh data live!
        fetchProjectData();
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
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
    setData(prev => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.map(t => {
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

      return {
        ...prev,
        tasks: updatedTasks,
        meta: {
          ...prev.meta,
          overallProgress: newProgress,
          updatedAt: new Date().toISOString()
        }
      };
    });

    // Sync to backend
    try {
      await fetch('/api/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      // Re-fetch on error
      fetchProjectData();
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        meta={data.meta}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
      />

      {/* Main Content Pane */}
      <main className="flex-1">
        {activeTab === 'tasks' && (
          <ProgressDashboard data={data} onToggleTask={handleToggleTask} />
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
