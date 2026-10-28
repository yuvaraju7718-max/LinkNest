import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  Plus,
  Bookmark,
  X,
  Folder,
  Star,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import LinkCard from '../components/LinkCard';

const CATEGORIES = [
  'All',
  'YouTube',
  'Articles',
  'GitHub',
  'Documentation',
  'Tools',
  'Online Courses',
  'General'
];

export default function AllLinksView({
  links = [],
  collections = [],
  onOpenAddModal,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onUpdateStatus,
  onViewDetails,
  initialCategory = 'All',
  initialCollectionId = '',
  searchQuery = '',
  onSearchChange = () => {}
}) {
  const [category, setCategory] = useState(initialCategory);
  const [collectionId, setCollectionId] = useState(initialCollectionId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter & sort logic
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = link.title?.toLowerCase().includes(q);
        const matchesUrl = link.url?.toLowerCase().includes(q);
        const matchesDesc = link.description?.toLowerCase().includes(q);
        const matchesNotes = link.personal_notes?.toLowerCase().includes(q);
        const matchesTags = link.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesUrl && !matchesDesc && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      // Category
      if (category !== 'All' && link.category !== category) {
        return false;
      }

      // Collection
      if (collectionId && String(link.collection_id) !== String(collectionId)) {
        return false;
      }

      // Reading status
      if (statusFilter !== 'all' && link.reading_status !== statusFilter) {
        return false;
      }

      // Favorite
      if (favoriteOnly && !link.is_favorite) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [links, searchQuery, category, collectionId, statusFilter, favoriteOnly, sortBy]);

  const resetFilters = () => {
    setCategory('All');
    setCollectionId('');
    setStatusFilter('all');
    setFavoriteOnly(false);
    onSearchChange('');
  };

  const hasActiveFilters =
    category !== 'All' || collectionId !== '' || statusFilter !== 'all' || favoriteOnly || searchQuery.trim() !== '';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            All Saved Resources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredLinks.length} of {links.length} saved links
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Grid / List) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile search bar if on small screen */}
          <div className="w-full sm:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search links..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Collection Filter Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reading Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
            {['all', 'unread', 'reading', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st === 'reading' ? 'Reading' : st}
              </button>
            ))}
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              favoriteOnly
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-navy-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>Starred Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Recently Saved</option>
              <option value="oldest">Oldest Saved</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Category Pills horizontal scroller */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 shrink-0 px-2 py-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Links Container */}
      {filteredLinks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching resources found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your search keywords, clearing categories, or reset your active filters.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 hover:bg-slate-200"
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700"
            >
              Save New Link
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLinks.map((link) => (
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
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
              onToggleFavorite={onToggleFavorite}
              onUpdateStatus={onUpdateStatus}
              onViewDetails={onViewDetails}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
