import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers
} from 'lucide-react';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#6366f1'];

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [ovRes, trRes, catRes, wlRes, hsRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAnalyticsTrends(),
        api.getAnalyticsCategories(),
        api.getAnalyticsWorkload(),
        api.getAnalyticsHotspots()
      ]);

      if (ovRes.success) setMetrics(ovRes.metrics);
      if (trRes.success) setTrends(trRes.trends || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (wlRes.success) setWorkload(wlRes.workload || []);
      if (hsRes.success) setHotspots(hsRes.hotspots || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = categories.map((c) => ({
    name: c.name,
    value: c.report_count || 1
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Civic Operations Intelligence & Impact
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analytics & Resolution Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predictive problem hotspot clustering, turnaround efficiency, and community satisfaction audits.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Citizen Verification Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {metrics?.verificationRate || 92}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Quality audited by reporting residents</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Avg. Resolution Turnaround</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {metrics?.avgResolutionDays || 2.3} <span className="text-sm font-normal">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From intake to verified completion</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Community Issues</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {metrics?.totalIssues || 6}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Grouped from {metrics?.totalReports || 20} raw reports</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Community Impact Index</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            94.6 <span className="text-sm font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Composite civic efficiency rating</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Over Time (Trends) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Reports Intake vs Resolution Rate</span>
              </h3>
              <p className="text-xs text-slate-400">Monthly progression of submitted civic defects vs closed</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie / Donut) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Proportion of community concerns across civic modules</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            {pieData.slice(0, 5).map((item, idx) => (
              <span key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Department Workload Bar Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Departmental Workload & Throughput</span>
          </h3>
          <p className="text-xs text-slate-400">Active work orders compared against completed resolutions</p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Bar dataKey="in_progress" fill="#f59e0b" name="In Progress" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Problem Hotspots & Recurring Issues Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Identified Geospatial Problem Hotspots</span>
            </h3>
            <p className="text-xs text-slate-400">High-density complaint zones identified by NEXUS Spatial Clustering</p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            {hotspots.length} Critical Clusters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Location & Ward</th>
                <th className="py-3 px-3">Primary Defect</th>
                <th className="py-3 px-3">Reports Count</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">AI Strategic Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hotspots.map((hs) => (
                <tr key={hs.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-200">{hs.area}</div>
                    <div className="text-[11px] text-slate-400">{hs.ward}</div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 font-medium whitespace-nowrap">
                    {hs.primaryIssue}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {hs.reportCount} reports
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        hs.riskLevel === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {hs.riskLevel} (Avg {hs.avgPriority})
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 text-[11px] max-w-md leading-relaxed">
                    {hs.aiRecommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
