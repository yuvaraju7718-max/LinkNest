import React from 'react';
import {
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Cloud,
  FileText,
  Youtube,
  Github,
  CheckCircle2,
  Folder,
  Layers,
  Zap,
  Tag
} from 'lucide-react';

export default function LandingPage({ onLaunchApp, stats = {} }) {
  const features = [
    {
      icon: Sparkles,
      title: 'Remember "Why" You Saved It',
      description: 'Never stare at a saved URL wondering what was useful about it. Every link includes dedicated personal notes.'
    },
    {
      icon: ShieldCheck,
      title: 'Smart Duplicate Detection',
      description: 'Avoid clutter. Normalized URL analysis detects duplicate saves and offers to open the existing resource.'
    },
    {
      icon: Layers,
      title: 'Collections & Categorization',
      description: 'Group links into custom themed collections, add multi-tag chips, and track reading status from Unread to Completed.'
    },
    {
      icon: Cloud,
      title: 'AWS Production Ready',
      description: 'Built for single-click deployment: AWS Amplify for React, Amazon EC2 for Flask REST API, and Amazon S3 for attachments.'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
          <div className="w-[500px] h-[500px] bg-brand-500 rounded-full blur-[140px]" />
          <div className="w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[120px] -ml-40 mt-32" />
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>LinkNest 1.0 — Full-Stack Personal Internet Library</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Save the web with <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              the context that matters.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Organize YouTube tutorials, technical blogs, GitHub repos, and official documentation in one place.
            Remember both <strong>what you saved</strong> and <strong>why you saved it</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Launch Library Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://github.com/yuvaraju7718-max/LinkNest"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Repo</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 flex items-center justify-center gap-6 sm:gap-12 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 max-w-lg mx-auto">
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white block">
                {stats.total_links || 6}
              </span>
              <span>Saved Links</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white block">
                {stats.total_collections || 4}
              </span>
              <span>Collections</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white block">
                100%
              </span>
              <span>Local Persistent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed for curious developers & students
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            A production-minded productivity tool crafted to replace browser bookmarks with actionable knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/50 transition-all duration-200"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-12 bg-slate-100/60 dark:bg-navy-900/40 border-t border-slate-200/80 dark:border-slate-800/80 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Full-Stack & AWS Architecture
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> React + Vite
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Tailwind CSS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Python Flask
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> SQLite / SQLAlchemy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> AWS Amplify & EC2
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Amazon S3
          </span>
        </div>
      </section>
    </div>
  );
}
