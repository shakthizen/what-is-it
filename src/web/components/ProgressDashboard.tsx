import React, { useState } from 'react';
import type { ProjectData, Task, TaskStatus } from '../types.js';

interface Props {
  data: ProjectData;
  onToggleTask: (taskId: string) => void;
}

export const ProgressDashboard: React.FC<Props> = ({ data, onToggleTask }) => {
  const { meta, features, tasks } = data;
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const filteredTasks = tasks.filter(t => {
    if (selectedFeature !== 'all' && t.featureId !== selectedFeature) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.where.toLowerCase().includes(q) ||
        t.why.toLowerCase().includes(q) ||
        t.how.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner & Dynamic Progress Bar */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Memory
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Updated {new Date(meta.updatedAt).toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {meta.name}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {meta.architectureSummary || meta.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {meta.frameworks.map((fw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/80"
                >
                  {fw}
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Progress Circular / Stats Display */}
          <div className="bg-[#090d16]/80 border border-slate-800 rounded-xl p-4 lg:w-80 shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {meta.overallProgress}%
              </span>
            </div>

            {/* Main Dynamic Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${meta.overallProgress}%` }}
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-900/60 rounded-lg py-1.5 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 font-medium">Done</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">{doneTasks}</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg py-1.5 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 font-medium">Active</div>
                <div className="text-sm font-bold text-amber-400 font-mono">{inProgressTasks}</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg py-1.5 border border-slate-800/60">
                <div className="text-[10px] text-slate-400 font-medium">Todo</div>
                <div className="text-sm font-bold text-slate-300 font-mono">{todoTasks}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 rounded-xl p-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks, why, how, or file paths..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#131b2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Feature Filter */}
          <select
            value={selectedFeature}
            onChange={e => setSelectedFeature(e.target.value)}
            className="bg-[#131b2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Features</option>
            {features.map(f => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-[#131b2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Feature Groups & Tasks */}
      <div className="space-y-8">
        {features.map(feature => {
          const featureTasks = filteredTasks.filter(t => t.featureId === feature.id);
          if (featureTasks.length === 0 && selectedFeature !== 'all') return null;

          const totalFeatTasks = tasks.filter(t => t.featureId === feature.id).length;
          const doneFeatTasks = tasks.filter(t => t.featureId === feature.id && t.status === 'done').length;

          return (
            <div
              key={feature.id}
              className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4"
            >
              {/* Feature Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-indigo-400 border border-slate-700">
                      {feature.category}
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight">{feature.title}</h2>
                  </div>
                  {feature.description && (
                    <p className="text-xs text-slate-400 mt-1">{feature.description}</p>
                  )}
                </div>

                {/* Feature Progress */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-300">
                      {doneFeatTasks}/{totalFeatTasks} Tasks
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{feature.progress}% completed</div>
                  </div>
                  <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              {featureTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No matching tasks under this feature.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {featureTasks.map(task => {
                    const isDone = task.status === 'done';
                    const isInProgress = task.status === 'in_progress';

                    return (
                      <div
                        key={task.id}
                        className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                          isDone
                            ? 'bg-[#090d16]/60 border-slate-800/60 opacity-80 hover:opacity-100'
                            : isInProgress
                            ? 'bg-gradient-to-r from-[#131b2e] to-[#0f172a] border-amber-500/40 shadow-md shadow-amber-500/5'
                            : 'bg-[#131b2e]/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Interactive Completion Toggle Checkbox */}
                          <button
                            onClick={() => onToggleTask(task.id)}
                            title={isDone ? 'Mark as todo' : 'Mark as completed'}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-black font-black text-xs'
                                : 'bg-[#090d16] border-slate-600 hover:border-indigo-400'
                            }`}
                          >
                            {isDone && '✓'}
                          </button>

                          {/* Task Body */}
                          <div className="flex-1 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                                  {task.id}
                                </span>
                                <h3
                                  className={`text-sm font-semibold text-white ${
                                    isDone ? 'line-through text-slate-400' : ''
                                  }`}
                                >
                                  {task.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {task.actorRole && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                                    👤 {task.actorRole}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    isDone
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : isInProgress
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* The 4 Core Pillars: Why, How, Where, When */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                              {/* Why */}
                              <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                                <span className="text-sm">🎯</span>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                    Why
                                  </div>
                                  <div className="text-slate-300 mt-0.5 leading-relaxed">{task.why}</div>
                                </div>
                              </div>

                              {/* How */}
                              <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                                <span className="text-sm">🛠️</span>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                    How
                                  </div>
                                  <div className="text-slate-300 mt-0.5 leading-relaxed">{task.how}</div>
                                </div>
                              </div>

                              {/* Where */}
                              <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                                <span className="text-sm">📍</span>
                                <div className="flex-1 truncate">
                                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                    Where
                                  </div>
                                  <div className="text-indigo-300 font-mono text-[11px] mt-0.5 truncate select-all">
                                    {task.where}
                                  </div>
                                </div>
                              </div>

                              {/* When */}
                              <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                                <span className="text-sm">⏱️</span>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                    When
                                  </div>
                                  <div className="text-slate-300 mt-0.5">{task.when}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
