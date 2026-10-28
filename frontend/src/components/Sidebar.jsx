import React from 'react';
import {
  LayoutDashboard,
  Bookmark,
  Folder,
  Star,
  BookOpen,
  Settings,
  Cloud,
  Layers,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

export default function Sidebar({
  currentView,
  onNavigate,
  stats = {},
  isOpen,
  onClose
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'links',
      label: 'All Links',
      icon: Bookmark,
      count: stats.total_links || 0
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Folder,
      count: stats.total_collections || 0
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      count: stats.favorites_count || 0,
      activeColor: 'text-amber-500'
    },
    {
      id: 'reading-list',
      label: 'Reading List',
      icon: BookOpen,
      count: stats.unread_count || 0
    },
    {
      id: 'settings',
      label: 'Settings & Cloud',
      icon: Settings,
      count: null
    }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Library
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : item.activeColor || 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== null && item.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-brand-200/70 text-brand-800 dark:bg-brand-900/80 dark:text-brand-200'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* AWS Deployment & Cloud Info Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-navy-900 dark:to-brand-950/40 border border-brand-200/60 dark:border-brand-900/40">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-brand-900 dark:text-brand-200">
            <Cloud className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>AWS Deployment</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">
            Architecture ready for AWS Amplify, EC2 Ubuntu, and S3 Storage.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Local Host
            </span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline" onClick={() => handleNavClick('settings')}>
              View Guide →
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
