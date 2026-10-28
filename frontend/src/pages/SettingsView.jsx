import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Cloud,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Terminal,
  FileCode2,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SettingsView({ links = [], collections = [], onRefreshData }) {
  const { toast } = useToast();
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const checkApiHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.getHealth();
      setHealth(res);
      toast.success('Backend API is healthy and reachable!');
    } catch (err) {
      setHealth({ status: 'unreachable', error: err.message });
      toast.error('Unable to reach backend API. Is Flask running on port 5000?');
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  // Export Library JSON
  const handleExportData = () => {
    const data = {
      export_date: new Date().toISOString(),
      app: 'LinkNest',
      version: '1.0.0',
      total_links: links.length,
      total_collections: collections.length,
      collections,
      links
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linknest_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Library successfully exported as JSON!');
  };

  // Restore Sample Data
  const handleResetSampleData = async () => {
    setIsResetting(true);
    try {
      await api.resetSampleData();
      toast.success('Sample demonstration data restored!');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error('Failed to reset sample data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Cloud Architecture
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your local and cloud infrastructure, manage backup exports, and inspect deployment status
        </p>
      </div>

      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Flask Backend</h3>
            </div>
            <button
              onClick={checkApiHealth}
              disabled={checkingHealth}
              className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 p-1"
              title="Refresh health check"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {health?.status === 'healthy' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Online (HTTP 200)
                </span>
              </>
            ) : health?.status === 'unreachable' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-rose-600 dark:text-rose-400">Offline / Unreachable</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-600">Connecting...</span>
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
            {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
          </p>
        </div>

        {/* Database */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Database Engine</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              SQLite (SQLAlchemy)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Local persistent file: <code className="font-mono">backend/linknest.db</code>.
          </p>
        </div>

        {/* Amazon S3 */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Amazon S3 Storage</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {health?.s3_configured ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-600">S3 Connected</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-medium text-slate-500">Optional / Local Fallback</span>
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Private bucket attachments via presigned URLs. Core link-saving works without S3.
          </p>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Data Management & Backup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your entire library of links, tags, and collections to JSON for offline backup or migration.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-semibold text-xs flex items-center gap-2 shadow-sm transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Library as JSON</span>
          </button>

          <button
            onClick={handleResetSampleData}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Restore Demo Sample Data</span>
          </button>
        </div>
      </div>

      {/* AWS Deployment Blueprint */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
            <Cloud className="w-5 h-5" />
            <span>AWS Deployment Blueprint</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reference guide for deploying LinkNest to Amazon Web Services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Frontend Amplify */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>1. AWS Amplify (Frontend)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your GitHub repository (<code className="text-brand-600 dark:text-brand-400">yuvaraju7718-max/LinkNest</code>) to AWS Amplify Hosting.
            </p>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              baseDirectory: frontend/dist<br/>
              buildCommand: npm run build
            </div>
          </div>

          {/* Backend EC2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>2. Amazon EC2 (Flask API)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Deploy Flask on an Ubuntu t2.micro / t3.micro Free Tier instance using Gunicorn WSGI and Nginx reverse proxy.
            </p>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              gunicorn -w 2 -b 127.0.0.1:5000 app:app
            </div>
          </div>

          {/* S3 Storage */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>3. Amazon S3 (Attachments)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Keep bucket completely private. The Flask backend issues temporary 5-minute pre-signed upload & download URLs.
            </p>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Presigned PUT / GET URLs
            </div>
          </div>
        </div>

        {/* AWS Cost Alert Notice */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">AWS Cost & Free Tier Guardrails</p>
            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
              Always set up an <strong>AWS Zero Spend Budget Alert</strong> in the AWS Billing console ($0 threshold alert) before launching resources.
              EC2 t2.micro/t3.micro is included in AWS Free Tier (750 hours/month for 12 months). Stop EC2 instances when not testing to avoid unexpected charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
