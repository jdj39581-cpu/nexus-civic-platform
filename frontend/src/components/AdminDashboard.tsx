import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CommunityIssue, Department } from '../types';
import { MapComponent } from './MapComponent';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Layers,
  HardHat,
  Shuffle,
  RefreshCw,
  TrendingUp,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor, formatDate, timeAgo } from '../utils/helpers';

interface AdminDashboardProps {
  onSelectIssue: (issueId: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectIssue }) => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('priority');

  // Assign modal state
  const [selectedAssignIssue, setSelectedAssignIssue] = useState<CommunityIssue | null>(null);
  const [assignDeptId, setAssignDeptId] = useState<number>(1);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, deptFilter, sortBy]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, issuesRes, deptRes, insightsRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getIssues({ status: statusFilter, departmentId: deptFilter, sortBy }),
        api.getDepartments(),
        api.getAiInsights()
      ]);

      if (overviewRes.success) setMetrics(overviewRes.metrics);
      if (issuesRes.success) setIssues(issuesRes.issues || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (insightsRes.success) setAiInsights(insightsRes.insights || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignIssue) return;
    setAssignSubmitting(true);
    try {
      await api.assignIssue(selectedAssignIssue.id, { departmentId: assignDeptId });
      setSelectedAssignIssue(null);
      loadDashboardData();
    } catch (err) {
      console.error('Assign failed:', err);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const filteredIssues = issues.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.issue_code.toLowerCase().includes(q) ||
      (i.address && i.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Municipal & Campus Operations Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NEXUS Admin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-source problem aggregation, AI similarity clustering, and departmental dispatch control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Top 5 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Reports</div>
          <div className="text-2xl font-black text-white font-mono">{metrics?.totalReports || 20}</div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% vs last week
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Issues</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics?.activeIssues || 4}</div>
          <div className="text-[10px] text-slate-400 mt-1">Under investigation</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">High / Critical</div>
          <div className="text-2xl font-black text-rose-400 font-mono">{metrics?.criticalIssues || 3}</div>
          <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Score &ge; 80 / 100
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Resolved</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics?.resolvedIssues || 2}</div>
          <div className="text-[10px] text-slate-400 mt-1">Completed by crews</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Citizen Verified</div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{metrics?.verificationRate || 92}%</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> High confidence audit
          </div>
        </div>
      </div>

      {/* AI Strategic Insights Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Autonomous AI Strategic Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      insight.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : insight.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                    }`}
                  >
                    {insight.type.replace('_', ' ')}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 leading-snug mb-1">{insight.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{insight.description}</p>
              </div>
              <div className="text-[10px] font-semibold text-cyan-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Action: {insight.suggestedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Map & Department Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Issue Map */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Municipal Issue Map & Clusters</span>
              </h3>
              <p className="text-xs text-slate-400">Markers sized and color-coded by AI priority risk</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {issues.length} Issues Plotted
            </span>
          </div>

          <MapComponent
            issues={issues}
            height="360px"
            zoom={12}
            onSelectIssue={onSelectIssue}
          />
        </div>

        {/* Department Workload Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Department Workload & Staffing</span>
          </h3>

          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span>{dept.name}</span>
                  <span className="text-cyan-400 font-mono">{dept.active_issues_count || 0} Active</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((dept.active_issues_count || 0) / 6) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Resolvers: {dept.active_resolvers_count || 10}</span>
                  <span>Resolved: {dept.resolved_issues_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Section: Priority Queue */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Municipal Priority Queue</span>
            </h3>
            <p className="text-xs text-slate-400">Issues sorted by composite AI risk score</p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, code, road..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Citizen Verified">Citizen Verified</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Issue ID / Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority Score</th>
                <th className="py-3 px-3">Reports</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No community issues match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const pBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
                  const sBadge = getStatusBadgeColor(issue.status);

                  return (
                    <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-mono text-cyan-400 font-semibold text-[11px] mb-0.5">
                          {issue.issue_code}
                        </div>
                        <div className="font-bold text-slate-200 line-clamp-1">{issue.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{issue.address}</div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 font-medium whitespace-nowrap">
                        {issue.category_name}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${pBadge.bg} ${pBadge.text} border ${pBadge.border}`}>
                          {issue.priority_score} / 100 ({issue.priority_level})
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{issue.affected_reports_count}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        <div className="font-medium">{issue.department_name || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-500">
                          {issue.assigned_resolver_name ? `Eng. ${issue.assigned_resolver_name}` : 'Pool'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${sBadge.bg} ${sBadge.text} border ${sBadge.border}`}>
                          {issue.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAssignIssue(issue)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                            title="Re-assign department"
                          >
                            Re-assign
                          </button>
                          <button
                            onClick={() => onSelectIssue(issue.id)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                          >
                            View Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-Assign Modal */}
      {selectedAssignIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Override Department Assignment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Re-routing issue <strong className="text-cyan-400">{selectedAssignIssue.issue_code}</strong>: {selectedAssignIssue.title}
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Department
                </label>
                <select
                  value={assignDeptId}
                  onChange={(e) => setAssignDeptId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignIssue(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-glow-sm disabled:opacity-50"
                >
                  {assignSubmitting ? 'Updating...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
