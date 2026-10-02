import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CommunityIssue } from '../types';
import { MapComponent } from './MapComponent';
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  HardHat,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Send,
  UploadCloud,
  FileCheck,
  Building2,
  Calendar,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor, formatDate, timeAgo } from '../utils/helpers';

interface IssueDetailsModalProps {
  issueId: number | string;
  onClose: () => void;
  onRefresh?: () => void;
}

const TIMELINE_STEPS = [
  'Reported',
  'AI Analyzed',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Citizen Verified'
];

export const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({ issueId, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [issue, setIssue] = useState<CommunityIssue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verification form state
  const [verifyComments, setVerifyComments] = useState('');
  const [disputeFile, setDisputeFile] = useState<File | null>(null);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  // Resolver progress state
  const [progressMsg, setProgressMsg] = useState('');
  const [progressStatus, setProgressStatus] = useState('In Progress');
  const [progressFile, setProgressFile] = useState<File | null>(null);
  const [progressSubmitting, setProgressSubmitting] = useState(false);

  useEffect(() => {
    loadIssueDetails();
  }, [issueId]);

  const loadIssueDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIssueById(issueId);
      if (res.success && res.issue) {
        setIssue(res.issue);
      } else {
        setError('Issue not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  // Citizen verification handler
  const handleVerify = async (confirmed: boolean) => {
    setVerifySubmitting(true);
    try {
      const formData = new FormData();
      formData.append('isResolvedConfirmed', confirmed ? 'true' : 'false');
      formData.append('comments', verifyComments || (confirmed ? 'Citizen verified resolution' : 'Problem still persists'));
      if (disputeFile) {
        formData.append('disputeEvidence', disputeFile);
      }

      const res = await api.verifyIssue(issueId, formData);
      if (res.success) {
        setVerifySuccessMsg(res.message);
        loadIssueDetails();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Resolver update handler
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressMsg.trim()) return;

    setProgressSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', progressStatus);
      formData.append('message', progressMsg);
      if (progressFile) {
        formData.append('evidence', progressFile);
      }

      const res = await api.addProgressUpdate(issueId, formData);
      if (res.success) {
        setProgressMsg('');
        setProgressFile(null);
        loadIssueDetails();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add progress update');
    } finally {
      setProgressSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300">Retrieving Community Issue dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 mb-4">{error || 'Could not load issue'}</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const priorityBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
  const statusBadge = getStatusBadgeColor(issue.status);

  // Calculate current timeline index
  let currentStepIdx = 0;
  if (issue.status === 'Reported') currentStepIdx = 1;
  else if (issue.status === 'Verified') currentStepIdx = 2;
  else if (issue.status === 'Assigned') currentStepIdx = 3;
  else if (issue.status === 'In Progress') currentStepIdx = 4;
  else if (issue.status === 'Resolved') currentStepIdx = 5;
  else if (issue.status === 'Citizen Verified' || issue.status === 'Closed') currentStepIdx = 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                {issue.issue_code}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${priorityBadge.bg} ${priorityBadge.text} border ${priorityBadge.border}`}>
                Priority {issue.priority_score}/100 ({issue.priority_level})
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
                {issue.status}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {issue.affected_reports_count} {issue.affected_reports_count === 1 ? 'Report' : 'Grouped Reports'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{issue.title}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{issue.address}</span>
              {issue.landmark && <span className="text-slate-500">• {issue.landmark}</span>}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. 7-Step Visual Timeline */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Resolution Lifecycle Pipeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 relative">
              {TIMELINE_STEPS.map((sName, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={sName} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                        isPassed
                          ? 'bg-cyan-500 text-slate-950 shadow-glow-sm'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        isCurrent ? 'text-cyan-400' : isPassed ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {sName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CITIZEN VERIFICATION BANNER (When issue is Resolved) */}
          {issue.status === 'Resolved' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-slate-900 border border-purple-500/40 shadow-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Citizen Resolution Verification Required</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    The department has marked this problem as resolved. As a community participant, does this defect actually appear fixed in reality?
                  </p>
                </div>
              </div>

              {issue.resolution_notes && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 mb-4">
                  <span className="font-semibold text-purple-300">Resolver Note:</span> {issue.resolution_notes}
                </div>
              )}

              {verifySuccessMsg ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {verifySuccessMsg}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={verifyComments}
                    onChange={(e) => setVerifyComments(e.target.value)}
                    placeholder="Add verification notes or dispute comments..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={verifySubmitting}
                      onClick={() => handleVerify(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-sm disabled:opacity-50 transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>✓ Yes, Resolved Properly</span>
                    </button>
                    <button
                      type="button"
                      disabled={verifySubmitting}
                      onClick={() => handleVerify(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-glow-sm disabled:opacity-50 transition-all"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>✕ No, Problem Still Exists</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Main Grid: Location & Details + AI Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Map, Description, Grouped Reports */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{issue.description || 'No description provided'}</p>
              </div>

              {/* Map */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Exact Geographic Coordinates
                </h4>
                <MapComponent
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  issues={[issue]}
                  height="260px"
                />
              </div>

              {/* Grouped Citizen Reports */}
              {issue.reports && issue.reports.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      Grouped Citizen Reports ({issue.reports.length})
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">Auto-clustered by AI</span>
                  </h4>

                  <div className="divide-y divide-slate-800/80 space-y-2">
                    {issue.reports.map((rep) => (
                      <div key={rep.id} className="pt-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-mono text-cyan-400 font-semibold">{rep.report_code}</span>
                          <span className="text-slate-500">{timeAgo(rep.created_at)}</span>
                        </div>
                        <p className="text-slate-200 font-medium">{rep.title}</p>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{rep.description}</p>
                        <div className="text-[10px] text-slate-500 mt-1">Reported by: {rep.reporter_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Updates Log */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Department Progress Updates & Field Evidence
                </h4>

                {/* Form to add progress (if resolver or admin) */}
                {(user?.role === 'resolver' || user?.role === 'admin') && (
                  <form onSubmit={handleAddProgress} className="mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Add Field Progress Note</span>
                      <select
                        value={progressStatus}
                        onChange={(e) => setProgressStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Mark Resolved</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      value={progressMsg}
                      onChange={(e) => setProgressMsg(e.target.value)}
                      placeholder="Describe field actions taken (e.g. dispatched crew, excavated pipe, poured asphalt)..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center justify-between">
                      <label className="cursor-pointer text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{progressFile ? progressFile.name : 'Upload proof photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && setProgressFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={progressSubmitting || !progressMsg.trim()}
                        className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-sm disabled:opacity-50"
                      >
                        {progressSubmitting ? 'Posting...' : 'Submit Update'}
                      </button>
                    </div>
                  </form>
                )}

                {issue.progressUpdates && issue.progressUpdates.length > 0 ? (
                  <div className="space-y-3">
                    {issue.progressUpdates.map((pu) => (
                      <div key={pu.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-cyan-300">{pu.author_name} ({pu.author_role})</span>
                          <span className="text-[10px] text-slate-500">{timeAgo(pu.created_at)}</span>
                        </div>
                        <p className="text-slate-200">{pu.message}</p>
                        {pu.evidence_url && (
                          <div className="mt-2">
                            <span className="text-[10px] text-slate-400 font-semibold block mb-1">Proof Attached:</span>
                            <img src={pu.evidence_url} alt="Evidence" className="h-28 rounded-lg border border-slate-700 object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No progress logs recorded yet.</div>
                )}
              </div>
            </div>

            {/* Right col: AI Dossier & Department Assignment */}
            <div className="space-y-6">
              {/* AI Understanding Dossier */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4" />
                  AI Intelligence Dossier
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Issue Classification</span>
                    <span className="font-semibold text-slate-200">{issue.aiAnalysis?.issue_type || issue.category_name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">AI Confidence Rating</span>
                    <span className="font-mono font-bold text-cyan-300">{issue.aiAnalysis?.confidence || 88}% Confidence</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Priority Breakdown</span>
                    <div className="mt-1 space-y-1">
                      {issue.aiAnalysis?.priority_reasons && Array.isArray(issue.aiAnalysis.priority_reasons) ? (
                        issue.aiAnalysis.priority_reasons.map((r, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400">Score based on safety risk, school proximity & volume.</div>
                      )}
                    </div>
                  </div>

                  {issue.aiAnalysis?.keywords && (
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Extracted Keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(issue.aiAnalysis.keywords) && issue.aiAnalysis.keywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Assignment */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Department Assignment
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Department</span>
                    <span className="font-semibold text-white">{issue.department_name || 'Pending Assignment'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department Contact</span>
                    <span className="text-slate-300">{issue.department_contact || 'contact@nexus.demo'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Field Resolver</span>
                    <span className="font-semibold text-cyan-300">
                      {issue.assigned_resolver_name ? `${issue.assigned_resolver_name}` : 'Unassigned (General Pool)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Verification Status */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  Citizen Quality Audit
                </h4>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Citizen Verification:</span>
                    <span className={`font-semibold ${issue.verified_by_citizen ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {issue.verified_by_citizen ? 'Verified ✓' : 'Pending Citizen Sign-off'}
                    </span>
                  </div>
                  {issue.verification_notes && (
                    <div className="text-[11px] text-slate-300 italic pt-1">"{issue.verification_notes}"</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
