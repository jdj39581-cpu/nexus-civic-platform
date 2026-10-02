import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CommunityIssue } from '../types';
import {
  HardHat,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Play,
  UploadCloud,
  FileCheck,
  Send,
  Eye,
  RefreshCw,
  Building2,
  Sparkles,
  Users
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor, timeAgo } from '../utils/helpers';

interface DepartmentDashboardProps {
  onSelectIssue: (issueId: number) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ onSelectIssue }) => {
  const { user } = useAuth();

  const [tab, setTab] = useState<string>('all');
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [counts, setCounts] = useState<any>({ new: 0, inProgress: 0, overdue: 0, resolved: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Resolution modal state
  const [resolvingIssue, setResolvingIssue] = useState<CommunityIssue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  useEffect(() => {
    loadMyCases();
  }, [tab]);

  const loadMyCases = async () => {
    setLoading(true);
    try {
      const res = await api.getMyCases(tab);
      if (res.success) {
        setIssues(res.issues || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load department cases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Accept & Start Work
  const handleQuickStatusChange = async (issueId: number, newStatus: string) => {
    try {
      await api.updateIssueStatus(issueId, {
        status: newStatus,
        notes: `Engineer ${user?.name} updated status to ${newStatus}`
      });
      loadMyCases();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Resolve with Proof Handler
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue || !resolutionNotes.trim()) return;

    setResolveSubmitting(true);
    try {
      let proofUrl = null;
      if (resolutionFile) {
        // Upload proof as a progress update
        const formData = new FormData();
        formData.append('status', 'Resolved');
        formData.append('message', `Field Work Completed: ${resolutionNotes}`);
        formData.append('evidence', resolutionFile);
        const upRes = await api.addProgressUpdate(resolvingIssue.id, formData);
        proofUrl = upRes.evidenceUrl;
      }

      await api.updateIssueStatus(resolvingIssue.id, {
        status: 'Resolved',
        resolutionNotes,
        resolutionProofUrl: proofUrl || undefined
      });

      setResolvingIssue(null);
      setResolutionNotes('');
      setResolutionFile(null);
      loadMyCases();
    } catch (err) {
      console.error('Failed to mark resolved:', err);
    } finally {
      setResolveSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardHat className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Field Engineering & Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Department Resolver Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage field work orders, upload repair proofs, and mark civic defects resolved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Active Resolver: <strong className="text-cyan-400">{user?.name}</strong>
          </div>
          <button
            onClick={loadMyCases}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Cases', count: issues.length },
          { id: 'new', label: 'New Assignments', count: counts.new },
          { id: 'in_progress', label: 'In Progress', count: counts.inProgress },
          { id: 'overdue', label: 'Overdue / Critical', count: counts.overdue, alert: true },
          { id: 'resolved', label: 'Completed', count: counts.resolved }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow-glow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                t.alert && t.count > 0 ? 'bg-rose-500 text-white' : 'bg-slate-950/70 text-slate-300'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      {issues.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <HardHat className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No work orders in this view</h3>
          <p className="text-xs text-slate-500 mt-1">All assigned issues have been processed or moved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => {
            const pBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
            const sBadge = getStatusBadgeColor(issue.status);

            return (
              <div
                key={issue.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {issue.issue_code}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${pBadge.bg} ${pBadge.text} border ${pBadge.border}`}>
                      Priority {issue.priority_score}/100
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-sm font-bold text-white leading-snug mb-2">{issue.title}</h3>
                  <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                    <span className="text-slate-300 font-medium">{issue.category_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Users className="w-3 h-3" />
                      {issue.affected_reports_count} reports linked
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-slate-400 flex items-start gap-1.5 mb-4 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{issue.address}</span>
                  </p>

                  {/* Current Status Pill */}
                  <div className="flex items-center justify-between text-xs mb-4 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Current Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${sBadge.bg} ${sBadge.text} border ${sBadge.border}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {issue.status === 'Reported' || issue.status === 'Assigned' ? (
                      <button
                        onClick={() => handleQuickStatusChange(issue.id, 'In Progress')}
                        className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-glow-amber transition-all"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Work</span>
                      </button>
                    ) : issue.status === 'In Progress' ? (
                      <button
                        onClick={() => setResolvingIssue(issue)}
                        className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-950 text-slate-500 text-center text-xs font-semibold">
                        Resolved
                      </div>
                    )}

                    <button
                      onClick={() => onSelectIssue(issue.id)}
                      className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Resolved Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Mark Issue Work Completed</h3>
              </div>
              <button
                onClick={() => setResolvingIssue(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Submit completion notes and photo evidence for issue <strong className="text-cyan-400">{resolvingIssue.issue_code}</strong> ({resolvingIssue.title}).
              This will notify citizens for their quality verification sign-off.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Resolution Work Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Asphalting completed; 4.2 metric tons of cold mix poured and roller compacted; surface inspected and open to traffic."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Attach Resolution Proof Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setResolutionFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-sm disabled:opacity-50"
                >
                  {resolveSubmitting ? 'Submitting Proof...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
