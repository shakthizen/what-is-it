import React, { useState } from 'react';
import type {
  ProjectData,
  Feature,
  SubFeature,
  RoleBasedAction,
  UserStory,
  ImplementationStatus
} from '../types.js';

interface Props {
  data: ProjectData;
  onToggleTask?: (taskId: string) => void;
}

export const ProgressDashboard: React.FC<Props> = ({ data, onToggleTask }) => {
  const { meta, features = [], tasks = [] } = data;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Collect all sub-features across features
  const allSubFeatures: SubFeature[] = features.flatMap(f => f.subFeatures || []);
  const hasSubFeatures = allSubFeatures.length > 0;

  const totalSpecs = hasSubFeatures ? allSubFeatures.length : tasks.length;
  const implementedCount = hasSubFeatures
    ? allSubFeatures.filter(s => s.status === 'implemented').length
    : tasks.filter(t => t.status === 'done').length;
  const inProgressCount = hasSubFeatures
    ? allSubFeatures.filter(s => s.status === 'in_progress').length
    : tasks.filter(t => t.status === 'in_progress').length;
  const missingCount = hasSubFeatures
    ? allSubFeatures.filter(s => s.status === 'missing').length
    : tasks.filter(t => t.status === 'todo').length;

  const categories = Array.from(new Set(features.map(f => f.category).filter(Boolean)));

  // Filter features & sub-features
  const filteredFeatures = features.filter(feature => {
    if (selectedCategory !== 'all' && feature.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner & Overall Progress */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                Live Memory
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                v{meta.version}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Synced {new Date(meta.updatedAt).toLocaleTimeString()}
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
          <div className="bg-[#090d16]/90 border border-slate-800 rounded-xl p-5 lg:w-88 shrink-0 space-y-3.5 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Feature Completion
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {meta.overallProgress}%
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${meta.overallProgress}%` }}
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-slate-900/70 rounded-lg py-1.5 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Features</div>
                <div className="text-sm font-bold text-white font-mono">{features.length}</div>
              </div>
              <div className="bg-slate-900/70 rounded-lg py-1.5 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Done</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">{implementedCount}</div>
              </div>
              <div className="bg-slate-900/70 rounded-lg py-1.5 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Active</div>
                <div className="text-sm font-bold text-amber-400 font-mono">{inProgressCount}</div>
              </div>
              <div className="bg-slate-900/70 rounded-lg py-1.5 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">Gaps</div>
                <div className="text-sm font-bold text-rose-400 font-mono">{missingCount}</div>
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
            placeholder="Search sub-features, capability (what), why, how, or target files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#131b2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#131b2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
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
            <option value="implemented">Implemented</option>
            <option value="in_progress">In Progress</option>
            <option value="missing">Missing Gaps</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-[#131b2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Guest">Guest</option>
          </select>
        </div>
      </div>

      {/* Feature Groups & Sub-Features */}
      <div className="space-y-8">
        {filteredFeatures.map(feature => {
          const subFeatures = feature.subFeatures || [];

          // Filter sub-features by search and status
          const filteredSubFeatures = subFeatures.filter(sf => {
            if (selectedStatus !== 'all' && sf.status !== selectedStatus) return false;
            if (selectedRole !== 'all') {
              const hasRole = sf.roleActions?.some(ra => ra.actorRole === selectedRole);
              if (!hasRole && selectedRole !== 'Developer') return false;
            }
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              return (
                sf.title.toLowerCase().includes(q) ||
                sf.what.toLowerCase().includes(q) ||
                sf.why.toLowerCase().includes(q) ||
                sf.how.toLowerCase().includes(q) ||
                sf.where.toLowerCase().includes(q) ||
                sf.id.toLowerCase().includes(q)
              );
            }
            return true;
          });

          // Filter role actions and user stories
          const featureRoleActions = (feature.roleActions || []).filter(ra => {
            if (selectedRole !== 'all' && ra.actorRole !== selectedRole) return false;
            if (selectedStatus !== 'all' && ra.status !== selectedStatus) return false;
            return true;
          });

          const featureUserStories = (feature.userStories || []).filter(us => {
            if (selectedRole !== 'all' && us.actorRole !== selectedRole) return false;
            if (selectedStatus !== 'all' && us.status !== selectedStatus) return false;
            return true;
          });

          const totalSubs = subFeatures.length;
          const doneSubs = subFeatures.filter(s => s.status === 'implemented').length;

          return (
            <div
              key={feature.id}
              className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6"
            >
              {/* Feature Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-indigo-400 border border-slate-700">
                      {feature.category}
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">{feature.title}</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        feature.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : feature.status === 'in_progress'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {feature.status}
                    </span>
                  </div>
                  {feature.description && (
                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                      {feature.description}
                    </p>
                  )}
                </div>

                {/* Feature Progress */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-300">
                      {doneSubs}/{totalSubs} Specs Done
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{feature.progress}% completed</div>
                  </div>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Features List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>📦</span> Sub-Features & Capabilities ({filteredSubFeatures.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Managed by AI Agent
                  </span>
                </div>

                {filteredSubFeatures.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-[#090d16]/50 rounded-xl border border-slate-800/60">
                    No matching sub-features under this feature.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {filteredSubFeatures.map(sf => {
                      const isDone = sf.status === 'implemented';
                      const isInProgress = sf.status === 'in_progress';
                      const isMissing = sf.status === 'missing';
                      const isExpanded = expandedDetails[sf.id] !== false; // expanded by default

                      return (
                        <div
                          key={sf.id}
                          className={`rounded-xl border p-4.5 transition-all ${
                            isDone
                              ? 'bg-[#090d16]/80 border-slate-800/90'
                              : isInProgress
                              ? 'bg-[#0d131f] border-amber-500/50 shadow-md shadow-amber-500/5'
                              : 'bg-[#0d131f] border-rose-500/40 shadow-md shadow-rose-500/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* AI-Managed Read-Only Status Glyph */}
                            <div
                              title={
                                isDone
                                  ? 'Implemented capability'
                                  : isInProgress
                                  ? 'Active in-progress implementation'
                                  : 'Missing architectural capability / gap'
                              }
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs mt-0.5 shrink-0 select-none ${
                                isDone
                                  ? 'bg-emerald-950 border-emerald-600/70 text-emerald-400'
                                  : isInProgress
                                  ? 'bg-amber-950 border-amber-600/70 text-amber-400 animate-pulse'
                                  : 'bg-rose-950 border-rose-600/70 text-rose-400'
                              }`}
                            >
                              {isDone ? '✓' : isInProgress ? '•' : '!'}
                            </div>

                            {/* Sub-Feature Body */}
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    {sf.id}
                                  </span>
                                  <h4 className="text-sm font-semibold text-white tracking-tight">
                                    {sf.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                                      isDone
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                        : isInProgress
                                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                                    }`}
                                  >
                                    {sf.status.replace('_', ' ')}
                                  </span>
                                  <button
                                    onClick={() => toggleExpand(sf.id)}
                                    className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700"
                                  >
                                    {isExpanded ? 'Hide 4 Ws ▲' : 'Show 4 Ws ▼'}
                                  </button>
                                </div>
                              </div>

                              {/* What: Capability Summary */}
                              <div className="text-xs text-slate-300 leading-relaxed bg-[#090d16]/50 p-2.5 rounded-lg border border-slate-800/80">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mr-1.5">
                                  WHAT:
                                </span>
                                {sf.what}
                              </div>

                              {/* The 4 W's Detailed Grid */}
                              {isExpanded && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs pt-1">
                                  {/* Why */}
                                  <div className="bg-[#090d16]/70 border border-slate-800/90 rounded-lg p-3 flex items-start gap-2.5">
                                    <span className="text-base">🎯</span>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                        Why (Rationale)
                                      </div>
                                      <div className="text-slate-300 mt-0.5 leading-relaxed">{sf.why}</div>
                                    </div>
                                  </div>

                                  {/* How */}
                                  <div className="bg-[#090d16]/70 border border-slate-800/90 rounded-lg p-3 flex items-start gap-2.5">
                                    <span className="text-base">🛠️</span>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                        How (Approach)
                                      </div>
                                      <div className="text-slate-300 mt-0.5 leading-relaxed">{sf.how}</div>
                                    </div>
                                  </div>

                                  {/* Where */}
                                  <div className="bg-[#090d16]/70 border border-slate-800/90 rounded-lg p-3 flex items-start gap-2.5">
                                    <span className="text-base">📍</span>
                                    <div className="flex-1 truncate">
                                      <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                        Where (Target Files)
                                      </div>
                                      <div className="text-indigo-300 font-mono text-[11px] mt-0.5 truncate select-all">
                                        {sf.where}
                                      </div>
                                    </div>
                                  </div>

                                  {/* When */}
                                  <div className="bg-[#090d16]/70 border border-slate-800/90 rounded-lg p-3 flex items-start gap-2.5">
                                    <span className="text-base">⏱️</span>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                        When (Phase / Milestone)
                                      </div>
                                      <div className="text-slate-300 mt-0.5">{sf.when}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actionable Task Checklist (mirrors sub-features 1:1; check one off here or via
                  `npx what-is-it task done <id>` and the linked sub-feature/progress updates) */}
              {onToggleTask && tasks.filter(t => t.featureId === feature.id).length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>✅</span> Tasks ({tasks.filter(t => t.featureId === feature.id).length})
                  </h3>
                  <div className="space-y-1.5">
                    {tasks
                      .filter(t => t.featureId === feature.id)
                      .map(t => (
                        <label
                          key={t.id}
                          className="flex items-center gap-2.5 bg-[#090d16]/60 border border-slate-800/80 rounded-lg px-3 py-2 text-xs cursor-pointer hover:border-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={t.status === 'done'}
                            onChange={() => onToggleTask(t.id)}
                            className="w-3.5 h-3.5 accent-emerald-500 shrink-0"
                          />
                          <span className={`flex-1 ${t.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {t.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">{t.id}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* What's Missing & Planned Gaps Callout */}
              {feature.missingDetails && feature.missingDetails.whatsMissing?.length > 0 && (
                <div className="bg-[#18111e]/90 border border-rose-500/40 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-base">⚠️</span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      What's Missing & Planned Gaps
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800">
                      Planned Milestone: {feature.missingDetails.when}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-200">
                    {feature.missingDetails.whatsMissing.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-rose-900/30 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                        Planned Approach (How)
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{feature.missingDetails.how}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                        Target Files (Where)
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {feature.missingDetails.where.map((file, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono text-[11px] border border-slate-800 select-all"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Role-Based Actions & User Stories Tabs */}
              {(featureRoleActions.length > 0 || featureUserStories.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* Role-Based Actions */}
                  {featureRoleActions.length > 0 && (
                    <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span>👤</span> Role-Based Actions ({featureRoleActions.length})
                      </h4>
                      <div className="space-y-2">
                        {featureRoleActions.map(ra => (
                          <div
                            key={ra.id}
                            className="bg-[#0d131f] border border-slate-800/90 rounded-lg p-2.5 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                                  {ra.actorRole}
                                </span>
                                <span className="font-medium text-white">{ra.action}</span>
                              </div>
                              {ra.targetScreenOrEndpoint && (
                                <div className="text-[11px] font-mono text-slate-400">
                                  Target: {ra.targetScreenOrEndpoint}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold shrink-0 ${
                                ra.status === 'implemented'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {ra.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Stories */}
                  {featureUserStories.length > 0 && (
                    <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span>📖</span> User Stories & Acceptance Criteria ({featureUserStories.length})
                      </h4>
                      <div className="space-y-2">
                        {featureUserStories.map(us => (
                          <div
                            key={us.id}
                            className="bg-[#0d131f] border border-slate-800/90 rounded-lg p-3 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {us.actorRole} Story
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                  us.status === 'implemented'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {us.status}
                              </span>
                            </div>
                            <p className="text-slate-200 font-medium leading-relaxed italic">
                              "{us.story}"
                            </p>
                            {us.acceptanceCriteria && us.acceptanceCriteria.length > 0 && (
                              <div className="pt-1 border-t border-slate-800/80 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Acceptance Criteria:
                                </span>
                                <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-0.5">
                                  {us.acceptanceCriteria.map((ac, idx) => (
                                    <li key={idx}>{ac}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
