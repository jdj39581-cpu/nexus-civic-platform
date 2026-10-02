import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CommunityIssue, Category } from '../types';
import { MapComponent } from './MapComponent';
import {
  MapPin,
  Filter,
  Search,
  Layers,
  Sparkles,
  Users,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/helpers';

interface InteractiveMapPageProps {
  onSelectIssue: (issueId: number) => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({ onSelectIssue }) => {
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected issue preview on map sidebar
  const [previewIssue, setPreviewIssue] = useState<CommunityIssue | null>(null);

  useEffect(() => {
    loadMapData();
  }, [categoryFilter, statusFilter, priorityFilter]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [issuesRes, catsRes] = await Promise.all([
        api.getIssues({
          category: categoryFilter,
          status: statusFilter,
          priority: priorityFilter,
          limit: 100
        }),
        api.getCategories()
      ]);

      if (issuesRes.success) {
        setIssues(issuesRes.issues || []);
        if (issuesRes.issues && issuesRes.issues.length > 0 && !previewIssue) {
          setPreviewIssue(issuesRes.issues[0]);
        }
      }
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Geospatial Problem Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive Community Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore live issues, inspect severity clusters, and monitor field resolution progress across wards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            {filteredIssues.length} Problems Visible
          </span>
          <button
            onClick={loadMapData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reload map markers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by street, landmark, defect..."
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical (&ge; 80)</option>
          <option value="High">High (65 - 79)</option>
          <option value="Medium">Medium (45 - 64)</option>
          <option value="Low">Low (&lt; 45)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Statuses</option>
          <option value="Reported">Reported</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Citizen Verified">Citizen Verified</option>
        </select>
      </div>

      {/* Main Map + Sidebar Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Full Interactive Leaflet Map */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <MapComponent
            issues={filteredIssues}
            height="560px"
            zoom={13}
            onSelectIssue={(id) => {
              const found = issues.find((i) => i.id === id);
              if (found) setPreviewIssue(found);
            }}
          />

          {/* Map Legend Floating Bar */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 flex items-center gap-4 text-[11px] shadow-lg">
            <span className="text-slate-400 font-semibold">Priority Pins:</span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose" /> Critical (&ge; 80)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High (65-79)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Medium (45-64)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
            </span>
          </div>
        </div>

        {/* Right 1 col: Selected Issue Preview Drawer */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          {previewIssue ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {previewIssue.issue_code}
                  </span>
                  {(() => {
                    const pb = getPriorityBadgeColor(previewIssue.priority_level, previewIssue.priority_score);
                    return (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pb.bg} ${pb.text} border ${pb.border}`}>
                        Score {previewIssue.priority_score}/100
                      </span>
                    );
                  })()}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{previewIssue.title}</h3>
                <div className="text-xs text-slate-400 mt-1">{previewIssue.category_name}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="text-slate-200">{previewIssue.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Responsible Dept</span>
                  <span className="font-semibold text-cyan-300">{previewIssue.department_name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Grouped Reports</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {previewIssue.affected_reports_count} Citizen Reports
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Status</span>
                  {(() => {
                    const sb = getStatusBadgeColor(previewIssue.status);
                    return (
                      <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] mt-0.5 ${sb.bg} ${sb.text} border ${sb.border}`}>
                        {previewIssue.status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {previewIssue.description}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click any pin on the map to preview issue dossier.
            </div>
          )}

          {previewIssue && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onSelectIssue(previewIssue.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-sm transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Full Dossier</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
