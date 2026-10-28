import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Folder,
  Tag,
  Star,
  Check,
  Paperclip,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'YouTube',
  'Articles',
  'GitHub',
  'Documentation',
  'Tools',
  'Online Courses',
  'General'
];

export default function LinkModal({
  isOpen,
  onClose,
  onSuccess,
  editLink = null,
  collections = [],
  onOpenExisting = null
}) {
  const dialogRef = useRef(null);
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [category, setCategory] = useState('General');
  const [collectionId, setCollectionId] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [readingStatus, setReadingStatus] = useState('unread');
  const [isFavorite, setIsFavorite] = useState(false);

  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);

  // States
  const [isExtracting, setIsExtracting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [forceDuplicate, setForceDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check S3 status once
  useEffect(() => {
    api.getUploadStatus()
      .then(res => setS3Configured(res.s3_configured))
      .catch(() => setS3Configured(false));
  }, []);

  // Sync editLink or reset
  useEffect(() => {
    if (editLink) {
      setUrl(editLink.url || '');
      setTitle(editLink.title || '');
      setDescription(editLink.description || '');
      setPersonalNotes(editLink.personal_notes || '');
      setCategory(editLink.category || 'General');
      setCollectionId(editLink.collection_id ? String(editLink.collection_id) : '');
      setTags(editLink.tags || []);
      setReadingStatus(editLink.reading_status || 'unread');
      setIsFavorite(Boolean(editLink.is_favorite));
      setAttachment(editLink.attachment || null);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setPersonalNotes('');
      setCategory('General');
      setCollectionId('');
      setTags([]);
      setReadingStatus('unread');
      setIsFavorite(false);
      setAttachment(null);
    }
    setTagInput('');
    setSelectedFile(null);
    setDuplicateWarning(null);
    setForceDuplicate(false);
    setErrorMsg('');
  }, [editLink, isOpen]);

  // Dialog lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  // Auto detect category from URL
  const autoDetectCategory = (rawUrl) => {
    const lower = rawUrl.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
    if (lower.includes('github.com')) return 'GitHub';
    if (lower.includes('docs.') || lower.includes('/docs') || lower.includes('documentation')) return 'Documentation';
    if (lower.includes('medium.com') || lower.includes('dev.to') || lower.includes('blog.')) return 'Articles';
    if (lower.includes('coursera.org') || lower.includes('udemy.com') || lower.includes('edx.org')) return 'Online Courses';
    return category;
  };

  // URL change & duplicate check
  const handleUrlBlur = async () => {
    if (!url.trim() || editLink) return;

    // Check duplicate
    try {
      const res = await api.checkDuplicate(url.trim());
      if (res.is_duplicate) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // ignore
    }

    // Auto set category
    setCategory(autoDetectCategory(url.trim()));
  };

  // Auto-fetch metadata
  const handleAutoFetch = async () => {
    if (!url.trim()) {
      setErrorMsg('Please enter a URL first.');
      return;
    }
    setErrorMsg('');
    setIsExtracting(true);
    try {
      const meta = await api.extractMetadata(url.trim());
      if (meta.title && !title) setTitle(meta.title);
      if (meta.description && !description) setDescription(meta.description);
      setCategory(autoDetectCategory(url.trim()));
      if (meta.success) {
        toast.success('Resource details auto-fetched!');
      } else {
        toast.info('Could not auto-fetch all page tags; default domain title applied.');
      }
    } catch (err) {
      toast.error('Failed to auto-fetch metadata. You can enter details manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Tag management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,+|,+$/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  // Submit link
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('URL is required.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let attachmentData = attachment;

      // Handle S3 Upload if file selected and S3 configured
      if (selectedFile && s3Configured) {
        setUploadProgress(true);
        const presignRes = await api.presignUpload(selectedFile.name, selectedFile.type);
        if (presignRes.upload_url) {
          // Upload directly to S3
          const uploadRes = await fetch(presignRes.upload_url, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type || 'application/octet-stream'
            }
          });
          if (uploadRes.ok) {
            attachmentData = {
              key: presignRes.key,
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type
            };
          } else {
            toast.error('S3 direct upload failed. Saving link without attachment.');
          }
        }
        setUploadProgress(false);
      }

      const payload = {
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        personal_notes: personalNotes.trim(),
        category,
        collection_id: collectionId ? parseInt(collectionId) : null,
        tags,
        reading_status: readingStatus,
        is_favorite: isFavorite,
        attachment: attachmentData,
        force_duplicate: forceDuplicate
      };

      if (editLink) {
        await api.updateLink(editLink.id, payload);
        toast.success('Resource updated successfully!');
      } else {
        await api.createLink(payload);
        toast.success('New resource saved to your library!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.data && err.data.error === 'DUPLICATE_URL') {
        setDuplicateWarning({
          is_duplicate: true,
          existing_link: { id: err.data.existing_id, title: err.data.existing_title },
          message: err.data.message
        });
      } else {
        setErrorMsg(err.message || 'Failed to save link. Please try again.');
        toast.error(err.message || 'Failed to save link.');
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="p-0 rounded-2xl bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm m-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editLink ? 'Edit Saved Resource' : 'Save New Resource'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Keep track of what you found and why you saved it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Duplicate URL Detected</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                {duplicateWarning.message}
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                {onOpenExisting && duplicateWarning.existing_link && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenExisting(duplicateWarning.existing_link.id);
                    }}
                    className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100"
                  >
                    Open Existing Resource →
                  </button>
                )}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={forceDuplicate}
                    onChange={(e) => setForceDuplicate(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Save as duplicate anyway</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* URL Input with Auto-fetch button */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://example.com/guide-to-ec2"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={isExtracting}
                className="px-3 py-2 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 font-medium flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 text-xs"
                title="Fetch page title and description"
              >
                {isExtracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Auto-fill</span>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive resource title"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary or overview of what this resource covers..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* KEY VALUE PROP: Personal Notes ("Why I saved this") */}
          <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-100 dark:bg-brand-950/30 dark:border-brand-900/40">
            <label className="block text-xs font-bold text-brand-800 dark:text-brand-300 mb-1 flex items-center gap-1.5">
              <span>Personal Notes — Why did you save this?</span>
              <span className="text-[10px] uppercase font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900 px-1.5 py-0.2 rounded">
                Key Feature
              </span>
            </label>
            <textarea
              rows={2}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="e.g. Best explanation of systemd unit files on EC2. Use for Phase 4 deployment!"
              className="w-full px-3 py-2 rounded-lg border border-brand-200 dark:border-brand-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-xs"
            />
          </div>

          {/* Category & Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Collection
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">None (Unassigned)</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Chips Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (Press Enter or comma to add)
            </label>
            <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 flex flex-wrap gap-1.5 items-center">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <Tag className="w-2.5 h-2.5 text-brand-500" />
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'e.g. react, ec2, aws' : 'Add another tag...'}
                className="flex-1 min-w-[120px] bg-transparent border-none text-xs focus:outline-none px-1 py-0.5"
              />
            </div>
          </div>

          {/* Reading Status & Favorite */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reading Status
              </span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                {['unread', 'reading', 'completed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReadingStatus(st)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                      readingStatus === st
                        ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {st === 'reading' ? 'In Progress' : st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Favorite
              </span>
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isFavorite
                    ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-navy-950 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>{isFavorite ? 'Starred Favorite' : 'Mark as Favorite'}</span>
              </button>
            </div>
          </div>

          {/* Optional Attachment Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-brand-500" />
                <span>Optional Attachment (Amazon S3)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {s3Configured ? 'S3 Storage Active' : 'S3 Optional (Disabled locally)'}
              </span>
            </div>

            {attachment && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-2">
                <span className="text-xs truncate font-mono text-slate-700 dark:text-slate-300">
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-xs text-rose-500 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.zip"
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-950 dark:file:text-brand-300 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, images, Markdown, ZIP (max 10MB). Stored securely via presigned S3 URLs.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadProgress}
              className="px-5 py-2 text-xs font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              {(isSubmitting || uploadProgress) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editLink ? 'Save Changes' : 'Save to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
