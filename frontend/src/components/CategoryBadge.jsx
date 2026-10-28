import React from 'react';
import { Youtube, FileText, Github, BookOpen, Wrench, GraduationCap, Globe } from 'lucide-react';

const categoryConfig = {
  YouTube: {
    icon: Youtube,
    bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  },
  Articles: {
    icon: FileText,
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  },
  GitHub: {
    icon: Github,
    bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  Documentation: {
    icon: BookOpen,
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  },
  Tools: {
    icon: Wrench,
    bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
  },
  'Online Courses': {
    icon: GraduationCap,
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  },
  General: {
    icon: Globe,
    bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const config = categoryConfig[category] || categoryConfig.General;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      <span>{category || 'General'}</span>
    </span>
  );
}
