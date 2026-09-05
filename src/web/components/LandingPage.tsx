import React, { useState } from 'react';
import type { ProjectData } from '../types.js';
import { ProgressDashboard } from './ProgressDashboard.js';
import { WikiView } from './WikiView.js';
import { UserFlowGraph } from './UserFlowGraph.js';

interface LandingPageProps {
  data: ProjectData;
  onToggleTask: (taskId: string) => void;
  onLaunchFullApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  data,
  onToggleTask,
  onLaunchFullApp
}) => {
  const [demoTab, setDemoTab] = useState<'tasks' | 'wiki' | 'flows'>('tasks');
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx @shakthizen/what-is-it init');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToDemo = () => {
    document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner animate-pulse">
          <span>⚡</span>
          <span>Zero Vibe Coding Amnesia</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">Single &lt; 4 KB Binary</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Never Lose Track of What Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            AI Agent Built.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
          Live project memory, auto-generated visual wikis, and token-efficient agent protocols stored in a single compressed file inside your repo.
        </p>

        {/* Copy Command & CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mb-12">
          {/* CLI Terminal Pill */}
          <div
            onClick={copyCommand}
            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700/80 hover:border-indigo-500/80 transition-all cursor-pointer shadow-xl w-full sm:w-auto"
          >
            <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
              <span className="text-indigo-400">$</span>
              <span>npx @shakthizen/what-is-it init</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {copied ? 'Copied! ✓' : 'Copy'}
            </span>
          </div>

          {/* Launch Full App CTA */}
          <button
            onClick={onLaunchFullApp}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Secondary links */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <button onClick={scrollToDemo} className="hover:text-white transition-colors flex items-center gap-1">
            <span>Try Live Demo</span>
            <span>↓</span>
          </button>
          <span>•</span>
          <a
            href="https://github.com/shakthizen/what-is-it"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>GitHub Repository</span>
            <span>↗</span>
          </a>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="interactive-demo" className="pt-8 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <div className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
            Live Embedded Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interact with Real Project Memory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Test the live components below: check off tasks, browse the right-side bookmarks wiki, and explore the React Flow SVG mockup canvas.
          </p>
        </div>

        {/* Demo Window Container */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* macOS Style Window Header */}
          <div className="bg-[#1e293b]/90 px-4 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-bold text-slate-300 ml-2 font-mono">
                what-is-it-demo.app
              </span>
            </div>

            {/* Demo Navigation Tabs */}
            <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDemoTab('tasks')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  demoTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Tasks & Progress
              </button>
              <button
                onClick={() => setDemoTab('wiki')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  demoTab === 'wiki' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Wiki Docs
              </button>
              <button
                onClick={() => setDemoTab('flows')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  demoTab === 'flows' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🕸️ Visual Graph
              </button>
            </div>

            {/* Launch Full View Button */}
            <button
              onClick={onLaunchFullApp}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Full Screen View</span>
              <span>↗</span>
            </button>
          </div>

          {/* Demo Content View */}
          <div className="bg-[#090d16] min-h-[600px] overflow-hidden">
            {demoTab === 'tasks' && (
              <ProgressDashboard data={data} onToggleTask={onToggleTask} />
            )}
            {demoTab === 'wiki' && (
              <WikiView wiki={data.wiki} />
            )}
            {demoTab === 'flows' && (
              <div className="h-[650px] w-full">
                <UserFlowGraph flows={data.flows} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The 2-Stage Agent Architecture Section */}
      <section className="py-20 bg-[#0f172a]/60 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <div className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
              The Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Two-Stage Symbiosis: Hands + Brain
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Your terminal handles the fast local scaffolding. Your AI agent handles the deep domain reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm font-mono border border-indigo-500/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Terminal Scaffold (Hands)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Run <code className="text-indigo-300 font-mono">npx what-is-it init</code>. It creates the compressed binary <code className="text-slate-300 font-mono">.what-is-it.bin</code> (&lt; 4 KB), generates <code className="text-slate-300 font-mono">WHAT_IS_IT.md</code>, and installs native slash commands across all IDEs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm font-mono border border-purple-500/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Agent Synthesis (Brain)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch to your agent chat (Antigravity, Cursor, Claude Code) and type <code className="text-purple-300 font-mono">/what-is-it-init</code>. The agent reads your code, actor roles, routes, and populates full features and tasks with Why, How, Where, When.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm font-mono border border-emerald-500/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Live Memory Forever</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As you vibe code, the agent marks tasks done with <code className="text-emerald-300 font-mono">/task-done</code>. Your second monitor dashboard updates live via Server-Sent Events with zero refresh needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-2">
          <div className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
            Features
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Modern Autonomous Development
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="text-2xl">🗜️</div>
            <h3 className="font-bold text-white text-sm">Ultra-Compact Binary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Entire architecture, tasks, and flows compress down to &lt; 4 KB on disk using native Node zlib with zero native compilation dependencies.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="text-2xl">🤖</div>
            <h3 className="font-bold text-white text-sm">Universal Slash Commands</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native support for Antigravity, Claude Code, Cursor, Windsurf, and Copilot. Type <code className="text-indigo-300 font-mono">/status</code> or <code className="text-indigo-300 font-mono">/task-done</code> in any chat.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="text-2xl">🦴</div>
            <h3 className="font-bold text-white text-sm">Caveman Token Protocol</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Telegraphic, high-density outputs cut LLM context consumption by 70%, preventing context bloat and lost chat memory.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="text-2xl">🖥️</div>
            <h3 className="font-bold text-white text-sm">SVG Mockup Frames</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Desktop browsers, mobile phones, and modal dialogs rendered in vector SVG on React Flow with interactive design token drawers.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-indigo-950/60 via-[#0f172a] to-slate-900 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl space-y-6">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Stop Losing Context. Start Vibe Coding with Memory.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Initialize <code className="text-indigo-300 font-mono">what-is-it</code> in any project in 5 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div
              onClick={copyCommand}
              className="px-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
            >
              npx @shakthizen/what-is-it init
            </div>
            <button
              onClick={onLaunchFullApp}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Open Full Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p>Released under the MIT License • Built by Pearkoder & shakthizen</p>
        <p>
          <a
            href="https://github.com/shakthizen/what-is-it"
            className="text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>{' '}
          •{' '}
          <a
            href="https://shakthizen.github.io/what-is-it/"
            className="text-indigo-400 hover:underline"
          >
            GitHub Pages Live Wiki
          </a>
        </p>
      </footer>
    </div>
  );
};
