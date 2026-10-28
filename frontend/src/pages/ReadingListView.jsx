import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import LinkCard from '../components/LinkCard';

export default function ReadingListView({
  links = [],
  onOpenAddModal,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onUpdateStatus,
  onViewDetails
}) {
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' | 'reading' | 'completed'

  const unreadLinks = links.filter((l) => l.reading_status === 'unread');
  const readingLinks = links.filter((l) => l.reading_status === 'reading');
  const completedLinks = links.filter((l) => l.reading_status === 'completed');

  const currentLinks =
    activeTab === 'unread'
      ? unreadLinks
      : activeTab === 'reading'
      ? readingLinks
      : completedLinks;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reading & Learning Pipeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track what you want to read, what you are currently studying, and what you have finished
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'unread'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>To Read ({unreadLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'reading'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>In Progress ({readingLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'completed'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed ({completedLinks.length})</span>
        </button>
      </div>

      {/* List */}
      {currentLinks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No resources in this tab
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            {activeTab === 'unread'
              ? 'You have caught up with all your saved links!'
              : activeTab === 'reading'
              ? 'No resources currently in progress. Mark a link as reading to start studying!'
              : 'No completed resources yet. Mark links as completed as you finish reading them!'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            Add New Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
              onToggleFavorite={onToggleFavorite}
              onUpdateStatus={onUpdateStatus}
              onViewDetails={onViewDetails}
              viewMode="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
