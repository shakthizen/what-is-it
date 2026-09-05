import React, { useState } from 'react';
import type { ProjectData } from '../types.js';
import { ProgressDashboard } from './ProgressDashboard.js';
import { WikiView } from './WikiView.js';
import { UserFlowGraph } from './UserFlowGraph.js';

interface LandingPageProps {
  data: ProjectData;
  onOpenDocs?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ data, onOpenDocs }) => {
  const [demoTab, setDemoTab] = useState<'tasks' | 'wiki' | 'flows'>('tasks');
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx @shakthizen/what-is-it init');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-600 selection:text-white font-sans">
      {/* Minimalist Discovery Navbar */}
      <header className="sticky top-0 z-50 bg-[#090d16] border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
            W
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-sm">what-is-it</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('architecture')} className="hover:text-white transition-colors">
            How it Works
          </button>
          <button onClick={() => scrollToSection('interactive-demo')} className="hover:text-white transition-colors">
            Live Demo
          </button>
          <button onClick={() => scrollToSection('commands')} className="hover:text-white transition-colors">
            Slash Commands
          </button>
          {onOpenDocs && (
            <button onClick={onOpenDocs} className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Generated Docs &rarr;
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/shakthizen/what-is-it"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>

          <div
            onClick={copyCommand}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d131f] border border-slate-700 text-xs font-mono text-slate-200 hover:border-slate-500 transition-colors cursor-pointer"
            title="Click to copy CLI command"
          >
            <span className="text-emerald-400">$</span>
            <span>npx @shakthizen/what-is-it init</span>
            <span className="text-[10px] ml-1 text-slate-400">{copied ? '✓' : '⧉'}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Clean Badges (no pulse) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-slate-800 bg-[#0d131f] text-slate-300 text-xs font-mono mb-8">
          <span className="text-emerald-400 font-semibold">⚡ Zero Vibe Coding Amnesia</span>
          <span className="text-slate-600">|</span>
          <span>&lt; 4 KB Single Binary</span>
          <span className="text-slate-600">|</span>
          <span>Multi-Agent Ready</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12] mb-6">
          Never Lose Track of What Your{' '}
          <span className="text-indigo-400">AI Agent Built</span>.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
          Live project memory, auto-generated visual wikis, and token-efficient agent protocols stored in a single compressed file inside your repo.
        </p>

        {/* Command Box & CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center max-w-lg mb-12">
          <div
            onClick={copyCommand}
            className="flex-1 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#0d131f] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer w-full"
          >
            <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
              <span className="text-emerald-400">$</span>
              <span>npx @shakthizen/what-is-it init</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {copied ? 'Copied! ✓' : 'Copy'}
            </span>
          </div>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 w-full sm:w-auto"
          >
            Explore Live Demo ↓
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <button onClick={() => scrollToSection('architecture')} className="hover:text-white transition-colors">
            Two-Stage Architecture &rarr;
          </button>
          <span>•</span>
          <button onClick={() => scrollToSection('commands')} className="hover:text-white transition-colors">
            Slash Commands &rarr;
          </button>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="interactive-demo" className="pt-4 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <div className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-400">
            Live Embedded Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interact with Real Project Memory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Test the live components below: inspect AI-managed tasks, browse the architecture wiki, and explore the React Flow SVG mockup canvas.
          </p>
        </div>

        {/* Demo Window Container */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* macOS Style Window Header */}
          <div className="bg-[#131b2e] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-bold text-slate-300 ml-2 font-mono">
                what-is-it-demo.app
              </span>
            </div>

            {/* Clean Solid Demo Tabs */}
            <div className="flex items-center bg-[#090d16] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setDemoTab('tasks')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  demoTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Tasks & Progress
              </button>
              <button
                onClick={() => setDemoTab('wiki')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  demoTab === 'wiki' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Wiki Docs
              </button>
              <button
                onClick={() => setDemoTab('flows')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  demoTab === 'flows' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🕸️ Visual Graph
              </button>
            </div>

            {/* Read-only Hint */}
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              AI-Managed • Real-time View
            </div>
          </div>

          {/* Demo Content Body */}
          <div className="bg-[#090d16] min-h-[580px] overflow-hidden">
            {demoTab === 'tasks' && (
              <ProgressDashboard data={data} />
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

      {/* Two-Stage Architecture Section */}
      <section id="architecture" className="py-20 bg-[#0d131f] border-y border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <div className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
              The Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Two-Stage Symbiosis: Hands + Brain
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Terminal handles fast local scaffolding. AI Agent handles deep domain reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-indigo-950 text-indigo-300 font-mono font-bold flex items-center justify-center text-xs border border-indigo-800">
                01
              </div>
              <h3 className="text-base font-bold text-white">Terminal Scaffold (Hands)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Run <code className="text-slate-200 font-mono">npx what-is-it init</code>. It creates the compressed binary <code className="text-slate-200 font-mono">.what-is-it.bin</code> (&lt; 4 KB), generates <code className="text-slate-200 font-mono">WHAT_IS_IT.md</code>, and configures native slash commands across all agent IDEs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-purple-950 text-purple-300 font-mono font-bold flex items-center justify-center text-xs border border-purple-800">
                02
              </div>
              <h3 className="text-base font-bold text-white">Agent Synthesis (Brain)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open Antigravity, Cursor, or Claude Code and type <code className="text-slate-200 font-mono">/what-is-it-init</code>. The agent reads your code, actor roles, routes, and populates full features and tasks with Why, How, Where, When.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-emerald-950 text-emerald-300 font-mono font-bold flex items-center justify-center text-xs border border-emerald-800">
                03
              </div>
              <h3 className="text-base font-bold text-white">Live Memory Forever</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As you vibe code, the agent marks tasks done with <code className="text-slate-200 font-mono">/task-done</code>. Your second monitor dashboard updates live via Server-Sent Events with zero refresh needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Slash Commands Section */}
      <section id="commands" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-2">
          <div className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-400">
            Multi-Agent Native
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Universal IDE Slash Commands
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Native integrations for Google Antigravity, Claude Code, Cursor, Windsurf, and Copilot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-indigo-400 font-mono text-sm font-bold">/what-is-it-init</code>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Bootstrap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agent explores the entire codebase, maps routes and dependencies, and writes the foundational project memory.
            </p>
          </div>

          <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-indigo-400 font-mono text-sm font-bold">/status</code>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Context Check</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agent gets an ultra-dense telegraphic summary of active tasks and target files. 70% token savings over raw file reading.
            </p>
          </div>

          <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-indigo-400 font-mono text-sm font-bold">/task-done &lt;id&gt;</code>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Sync Memory</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Marks task completed by AI. Re-computes overall project completion percentage and broadcasts live SSE update to UI.
            </p>
          </div>

          <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-indigo-400 font-mono text-sm font-bold">/wiki</code>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Architecture</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Displays architecture topology, design tokens, and actor journeys without needing to re-parse repository files.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 bg-[#0d131f] border-t border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <div className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-400">
              Core Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered for Autonomous Development
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="text-xl">🗜️</div>
              <h3 className="font-bold text-white text-sm">Ultra-Compact Binary</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Entire architecture, tasks, and flows compress down to &lt; 4 KB on disk using native Node zlib with zero native build dependencies.
              </p>
            </div>

            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="text-xl">🤖</div>
              <h3 className="font-bold text-white text-sm">Universal Agent IDEs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native support for Antigravity, Claude Code, Cursor, Windsurf, and Copilot. Run slash commands in any chat.
              </p>
            </div>

            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="text-xl">🦴</div>
              <h3 className="font-bold text-white text-sm">Caveman Token Protocol</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Telegraphic, high-density outputs cut LLM context consumption by 70%, preventing context bloat and lost chat memory.
              </p>
            </div>

            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="text-xl">🖥️</div>
              <h3 className="font-bold text-white text-sm">SVG Mockup Frames</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Desktop browsers, mobile phones, and modal dialogs rendered in vector SVG on React Flow with design token drawers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-10 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Stop Losing Context. Start Vibe Coding with Memory.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Initialize <code className="text-slate-200 font-mono">what-is-it</code> in any project in 5 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div
              onClick={copyCommand}
              className="px-4 py-2.5 rounded-lg bg-[#090d16] border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer hover:border-slate-500 transition-colors"
            >
              npx @shakthizen/what-is-it init
            </div>
            <a
              href="https://github.com/shakthizen/what-is-it"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Star on GitHub ★
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p>Released under the MIT License • Built by Pearkoder & shakthizen</p>
        <p>
          <a
            href="https://github.com/shakthizen/what-is-it"
            className="text-slate-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
};

