import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Report, CommunityIssue } from '../types';
import { MapComponent } from './MapComponent';
import {
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor, formatDate, timeAgo } from '../utils/helpers';

interface CitizenDashboardProps {
  onSelectIssue: (issueId: number) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onSelectIssue }) => {
  const { user, navigateTo } = useAuth();

  const [myReports, setMyReports] = useState<Report[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<CommunityIssue[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my_reports' | 'nearby_issues'>('nearby_issues');
  const [loading, setLoading] = useState<boolean>(true);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    loadCitizenData();
  }, [user]);

  const loadCitizenData = async () => {
    setLoading(true);
    try {
      const [reportsRes, issuesRes, overviewRes] = await Promise.all([
        api.getReports({ mine: 'true' }),
        api.getIssues({ limit: 20 }),
        api.getAnalyticsOverview()
      ]);

      if (reportsRes.success) setMyReports(reportsRes.reports || []);
      if (issuesRes.success) setNearbyIssues(issuesRes.issues || []);
      if (overviewRes.success) setMetrics(overviewRes.metrics);
    } catch (err) {
      console.error('Failed to load citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeReportsCount = myReports.filter((r) => r.status !== 'Resolved' && r.status !== 'Citizen Verified').length;
  const resolvedReportsCount = myReports.filter((r) => r.status === 'Resolved' || r.status === 'Citizen Verified').length;
  const underReviewCount = myReports.filter((r) => r.status === 'Reported').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Civic Engagement Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your submitted civic issues, discover nearby community concerns, and verify resolved work orders.
          </p>
        </div>

        {/* Quick Report CTA */}
        <button
          onClick={() => navigateTo('report')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-glow-sm transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report a Problem</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>My Active Reports</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{activeReportsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Currently in resolution pipeline</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Resolved Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{resolvedReportsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully fixed by departments</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Under AI Review</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">{underReviewCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting department dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Community Impact</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400 font-mono">{metrics?.verificationRate || 92}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Citizen verification rate</p>
        </div>
      </div>

      {/* Main Area: Quick Actions & Nearby Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions & Community Impact Box */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => navigateTo('report')}
                className="w-full p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-left flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-300">Report a New Defect</div>
                  <div className="text-[11px] text-slate-400">Pothole, garbage, dark street, leakage</div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigateTo('map')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">View Live Radius Map</div>
                  <div className="text-[11px] text-slate-400">Explore reported problems near you</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('my_reports')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">Track My Reports</div>
                  <div className="text-[11px] text-slate-400">View progress logs & evidence</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Community Impact Statistics */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Real-World Community Impact</span>
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Community Reports:</span>
                <span className="font-bold text-white font-mono">1,248 problems reported</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Successfully Resolved:</span>
                <span className="font-bold text-emerald-400 font-mono">873 issues resolved</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Resolution Verification:</span>
                <span className="font-bold text-cyan-300 font-mono">92% verified by citizens</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Average Turnaround:</span>
                <span className="font-bold text-indigo-300 font-mono">2.3 days to resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 cols: Nearby Issues Map Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Nearby Reported Issues in Your Area</span>
              </h3>
              <p className="text-xs text-slate-400">Click any pin to inspect the problem summary and status</p>
            </div>
            <button
              onClick={() => navigateTo('map')}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapComponent
            issues={nearbyIssues}
            height="320px"
            zoom={13}
            onSelectIssue={onSelectIssue}
          />
        </div>
      </div>

      {/* Tabs: Recent Community Issues vs My Reports */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('nearby_issues')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nearby_issues'
                ? 'bg-blue-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Community Issues ({nearbyIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('my_reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_reports'
                ? 'bg-blue-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Submitted Reports ({myReports.length})
          </button>
        </div>

        {/* Content Table / Cards */}
        {activeTab === 'nearby_issues' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Problem / ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nearbyIssues.map((issue) => {
                  const pBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
                  const sBadge = getStatusBadgeColor(issue.status);

                  return (
                    <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-mono text-cyan-400 font-semibold text-[11px] mb-0.5">{issue.issue_code}</div>
                        <div className="font-bold text-slate-200 line-clamp-1">{issue.title}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">{issue.category_name}</td>
                      <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{issue.address}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${pBadge.bg} ${pBadge.text} border ${pBadge.border}`}>
                          {issue.priority_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${sBadge.bg} ${sBadge.text} border ${sBadge.border}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectIssue(issue.id)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                You haven't submitted any reports yet. Use the "Report a Problem" button to create one!
              </div>
            ) : (
              myReports.map((report) => {
                const sBadge = getStatusBadgeColor(report.status);

                return (
                  <div key={report.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-cyan-400 font-bold text-xs">{report.report_code}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${sBadge.bg} ${sBadge.text} border ${sBadge.border}`}>
                          {report.status}
                        </span>
                        <span className="text-[10px] text-slate-500">{formatDate(report.created_at)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">{report.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{report.address}</p>
                    </div>

                    {report.issue_id && (
                      <button
                        onClick={() => onSelectIssue(report.issue_id!)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 whitespace-nowrap"
                      >
                        Track Issue
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
