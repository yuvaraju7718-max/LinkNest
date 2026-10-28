import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LinkModal from './components/LinkModal';
import LinkDetailModal from './components/LinkDetailModal';
import CollectionModal from './components/CollectionModal';
import ConfirmDialog from './components/ConfirmDialog';
import LandingPage from './pages/LandingPage';
import DashboardView from './pages/DashboardView';
import AllLinksView from './pages/AllLinksView';
import CollectionsView from './pages/CollectionsView';
import FavoritesView from './pages/FavoritesView';
import ReadingListView from './pages/ReadingListView';
import SettingsView from './pages/SettingsView';
import { api } from './services/api';
import { useToast } from './context/ToastContext';

export default function App() {
  const { toast } = useToast();

  // Navigation & UI state
  const [currentView, setCurrentView] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState('');

  // Data state
  const [links, setLinks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({
    total_links: 0,
    total_collections: 0,
    favorites_count: 0,
    unread_count: 0,
    reading_count: 0,
    completed_count: 0
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editLink, setEditLink] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLink, setDetailLink] = useState(null);

  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editCollection, setEditCollection] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    confirmLabel: 'Delete',
    onConfirm: () => {}
  });

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [linksRes, colRes, statsRes] = await Promise.allSettled([
        api.getLinks(),
        api.getCollections(),
        api.getStats()
      ]);

      if (linksRes.status === 'fulfilled') {
        setLinks(linksRes.value.links || []);
      }
      if (colRes.status === 'fulfilled') {
        setCollections(colRes.value.collections || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle favorite
  const handleToggleFavorite = async (id) => {
    // Optimistic UI update
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_favorite: !l.is_favorite } : l))
    );
    if (detailLink && detailLink.id === id) {
      setDetailLink((prev) => ({ ...prev, is_favorite: !prev.is_favorite }));
    }

    try {
      await api.toggleFavorite(id);
      fetchData();
    } catch (err) {
      toast.error('Failed to update favorite: ' + err.message);
      fetchData(); // Rollback
    }
  };

  // Update reading status
  const handleUpdateStatus = async (id, newStatus) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, reading_status: newStatus } : l))
    );
    if (detailLink && detailLink.id === id) {
      setDetailLink((prev) => ({ ...prev, reading_status: newStatus }));
    }

    try {
      await api.updateReadingStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
      fetchData();
    }
  };

  // Delete Link with Confirmation Dialog
  const handleDeleteLink = (link) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Resource',
      message: `Are you sure you want to delete "${link.title}"? This cannot be undone.`,
      confirmVariant: 'danger',
      confirmLabel: 'Delete Link',
      onConfirm: async () => {
        try {
          await api.deleteLink(link.id);
          toast.success('Resource deleted successfully.');
          setLinks((prev) => prev.filter((l) => l.id !== link.id));
          if (detailModalOpen && detailLink?.id === link.id) {
            setDetailModalOpen(false);
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (err) {
          toast.error('Failed to delete resource: ' + err.message);
        }
      }
    });
  };

  // Delete Collection with Confirmation Dialog
  const handleDeleteCollection = (col) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Collection',
      message: `Are you sure you want to delete the collection "${col.name}"? The resources inside will not be deleted, but will become unassigned.`,
      confirmVariant: 'danger',
      confirmLabel: 'Delete Collection',
      onConfirm: async () => {
        try {
          await api.deleteCollection(col.id);
          toast.success(`Collection "${col.name}" deleted.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (err) {
          toast.error('Failed to delete collection: ' + err.message);
        }
      }
    });
  };

  // Open existing duplicate link
  const handleOpenExisting = (linkId) => {
    const existing = links.find((l) => l.id === linkId);
    if (existing) {
      setDetailLink(existing);
      setDetailModalOpen(true);
    } else {
      api.getLink(linkId).then((res) => {
        setDetailLink(res.link);
        setDetailModalOpen(true);
      });
    }
  };

  // Select collection from dashboard or collections page
  const handleSelectCollection = (colId) => {
    setSelectedCollectionFilter(String(colId));
    setCurrentView('links');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'links' && q.trim()) {
            setCurrentView('links');
          }
        }}
        onOpenAddModal={() => {
          setEditLink(null);
          setLinkModalOpen(true);
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content Layout */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onLaunchApp={() => setCurrentView('dashboard')}
            stats={stats}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              setCurrentView(view);
              if (view !== 'links') setSelectedCollectionFilter('');
            }}
            stats={stats}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main App Container */}
          <main className="flex-1 lg:pl-72 min-w-0">
            {currentView === 'dashboard' && (
              <DashboardView
                stats={stats}
                recentLinks={links}
                collections={collections}
                onOpenAddModal={() => {
                  setEditLink(null);
                  setLinkModalOpen(true);
                }}
                onNavigate={(view) => {
                  setCurrentView(view);
                  if (view !== 'links') setSelectedCollectionFilter('');
                }}
                onEditLink={(link) => {
                  setEditLink(link);
                  setLinkModalOpen(true);
                }}
                onDeleteLink={handleDeleteLink}
                onToggleFavorite={handleToggleFavorite}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={(link) => {
                  setDetailLink(link);
                  setDetailModalOpen(true);
                }}
                onSelectCollection={handleSelectCollection}
              />
            )}

            {currentView === 'links' && (
              <AllLinksView
                links={links}
                collections={collections}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                initialCollectionId={selectedCollectionFilter}
                onOpenAddModal={() => {
                  setEditLink(null);
                  setLinkModalOpen(true);
                }}
                onEditLink={(link) => {
                  setEditLink(link);
                  setLinkModalOpen(true);
                }}
                onDeleteLink={handleDeleteLink}
                onToggleFavorite={handleToggleFavorite}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={(link) => {
                  setDetailLink(link);
                  setDetailModalOpen(true);
                }}
              />
            )}

            {currentView === 'collections' && (
              <CollectionsView
                collections={collections}
                onOpenCreateModal={() => {
                  setEditCollection(null);
                  setCollectionModalOpen(true);
                }}
                onEditCollection={(col) => {
                  setEditCollection(col);
                  setCollectionModalOpen(true);
                }}
                onDeleteCollection={handleDeleteCollection}
                onSelectCollection={handleSelectCollection}
              />
            )}

            {currentView === 'favorites' && (
              <FavoritesView
                links={links}
                onOpenAddModal={() => {
                  setEditLink(null);
                  setLinkModalOpen(true);
                }}
                onEditLink={(link) => {
                  setEditLink(link);
                  setLinkModalOpen(true);
                }}
                onDeleteLink={handleDeleteLink}
                onToggleFavorite={handleToggleFavorite}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={(link) => {
                  setDetailLink(link);
                  setDetailModalOpen(true);
                }}
              />
            )}

            {currentView === 'reading-list' && (
              <ReadingListView
                links={links}
                onOpenAddModal={() => {
                  setEditLink(null);
                  setLinkModalOpen(true);
                }}
                onEditLink={(link) => {
                  setEditLink(link);
                  setLinkModalOpen(true);
                }}
                onDeleteLink={handleDeleteLink}
                onToggleFavorite={handleToggleFavorite}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={(link) => {
                  setDetailLink(link);
                  setDetailModalOpen(true);
                }}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                links={links}
                collections={collections}
                onRefreshData={fetchData}
              />
            )}
          </main>
        </div>
      )}

      {/* Add / Edit Link Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setEditLink(null);
        }}
        onSuccess={fetchData}
        editLink={editLink}
        collections={collections}
        onOpenExisting={handleOpenExisting}
      />

      {/* Link Details Modal */}
      <LinkDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailLink(null);
        }}
        link={detailLink}
        onEdit={(link) => {
          setDetailModalOpen(false);
          setEditLink(link);
          setLinkModalOpen(true);
        }}
        onDelete={handleDeleteLink}
        onToggleFavorite={handleToggleFavorite}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Add / Edit Collection Modal */}
      <CollectionModal
        isOpen={collectionModalOpen}
        onClose={() => {
          setCollectionModalOpen(false);
          setEditCollection(null);
        }}
        onSuccess={fetchData}
        editCollection={editCollection}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
