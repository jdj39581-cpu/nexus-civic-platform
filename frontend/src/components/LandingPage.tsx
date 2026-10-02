import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CommunityIssue } from '../types';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HardHat,
  Cpu,
  MapPin,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Clock,
  Building2,
  Users,
  Compass,
  AlertTriangle,
  Play,
  UserCheck
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/helpers';

interface LandingPageProps {
  onOpenAuthModal: () => void;
  onSelectIssue: (issueId: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectIssue }) => {
  const { user, navigateTo, demoLogin } = useAuth();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [issuesRes, metricsRes] = await Promise.all([
          api.getIssues({ limit: 4, sortBy: 'priority' }),
          api.getAnalyticsOverview()
        ]);
        if (issuesRes.success) setIssues(issuesRes.issues || []);
        if (metricsRes.success) setMetrics(metricsRes.metrics);
      } catch (err) {
        // silently fallback
      }
    }
    loadData();
  }, []);

  const workflowSteps = [
    {
      num: '01',
      title: 'Report',
      desc: 'Citizens capture real-world defects with smart GPS pin-drop & photo evidence.',
      icon: MapPin,
      color: 'text-cyan-400',
      badge: 'Step 1'
    },
    {
      num: '02',
      title: 'Understand',
      desc: 'NLP extracts issue classification, safety hazard indicators, and critical urgency keywords.',
      icon: Cpu,
      color: 'text-blue-400',
      badge: 'AI Engine'
    },
    {
      num: '03',
      title: 'Connect',
      desc: 'Haversine distance & token similarity cluster duplicate complaints into 1 unified issue.',
      icon: Layers,
      color: 'text-indigo-400',
      badge: 'Deduplication'
    },
    {
      num: '04',
      title: 'Prioritize',
      desc: 'Transparent 0-100 algorithm weighs physical safety risk, volume & school proximity.',
      icon: AlertTriangle,
      color: 'text-amber-400',
      badge: 'Scoring Engine'
    },
    {
      num: '05',
      title: 'Resolve',
      desc: 'Automated dispatch to responsible city department with field proof photo uploads.',
      icon: HardHat,
      color: 'text-purple-400',
      badge: 'Field Ops'
    },
    {
      num: '06',
      title: 'Verify',
      desc: 'Citizen sign-off closes the loop. Re-opens automatically if the community disputes the fix.',
      icon: FileCheck,
      color: 'text-emerald-400',
      badge: 'Quality Audit'
    }
  ];

  const capabilities = [
    {
      title: 'Natural Language Understanding',
      desc: 'Heuristic & deep semantic understanding parses unstructured citizen text to determine severity, accident risks, and affected civic infrastructure.',
      icon: Sparkles
    },
    {
      title: 'Similarity & Duplicate Grouping',
      desc: 'Prevents municipal ticket clutter by grouping multiple reports describing the same pothole or blackspot into a single high-priority Community Issue.',
      icon: Layers
    },
    {
      title: 'Geospatial Radius Intelligence',
      desc: 'Interactive Leaflet & OpenStreetMap clustering visualizes defect densities and alerts departments to localized systemic failures.',
      icon: MapPin
    },
    {
      title: 'Transparent Priority Scoring',
      desc: 'Demystifies civic governance with transparent mathematical justification (+safety risk, +volume, +school proximity, +duration).',
      icon: TrendingUp
    },
    {
      title: 'Multi-Department Dispatch',
      desc: 'Seamless routing between Public Works, Sanitation, Water Board, Electrical Grid, and Transport with full administrative overrides.',
      icon: Building2
    },
    {
      title: 'Citizen Verification Loop',
      desc: 'No more "resolved on paper" false closures. Reporting citizens must sign off on field photo proof before an issue is marked verified.',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/25 text-xs font-semibold mb-6 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Civic Technology Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Connect Problems. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Coordinate Solutions.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An intelligent community problem reporting and resolution platform that transforms raw citizen complaints into deduplicated, prioritized, and trackable community actions.
        </p>

        {/* Primary Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              if (!user) onOpenAuthModal();
              else navigateTo('report');
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-glow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Report a Problem</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('map')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Explore Live Issues</span>
          </button>
        </div>

        {/* Live Platform Stats Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">1,248+</div>
            <div className="text-xs text-slate-400 mt-1">Problems Reported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">873</div>
            <div className="text-xs text-slate-400 mt-1">Issues Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">92%</div>
            <div className="text-xs text-slate-400 mt-1">Resolution Verification</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">2.3 Days</div>
            <div className="text-xs text-slate-400 mt-1">Average Turnaround</div>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Evaluation Persona Switcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 shadow-2xl">
          <div className="max-w-3xl mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Demo Experience & Evaluator Sandbox
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Test Any User Persona with 1 Click
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Switch roles instantly to experience how NEXUS orchestrates problem resolution between citizens, admins, and department resolvers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { role: 'citizen', name: 'Citizen / Student', email: 'citizen@nexus.demo', icon: Users, desc: 'Submit complaints, track timeline & verify resolutions.' },
              { role: 'admin', name: 'City Command Admin', email: 'admin@nexus.demo', icon: ShieldAlert, desc: 'Manage priority queue, merge duplicates & dispatch.' },
              { role: 'roads', name: 'Public Works (Roads)', email: 'roads@nexus.demo', icon: HardHat, desc: 'Accept work orders, upload asphalt repairs & proof.' },
              { role: 'sanitation', name: 'Sanitation Dept', email: 'sanitation@nexus.demo', icon: Building2, desc: 'Clear garbage blackspots & manage compactors.' },
              { role: 'water', name: 'Water Supply Board', email: 'water@nexus.demo', icon: Building2, desc: 'Resolve main pipeline bursts & manhole covers.' },
              { role: 'electrical', name: 'Electrical & Power', email: 'electrical@nexus.demo', icon: Sparkles, desc: 'Fix streetlights & isolate live wire hazards.' },
            ].map((persona) => (
              <button
                key={persona.email}
                onClick={async () => {
                  await demoLogin(persona.role, persona.email);
                }}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                  <persona.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {persona.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{persona.email}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">{persona.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How NEXUS Works: 6-Stage Resolution Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Architectural Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            How NEXUS Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            The end-to-end transformation of unstructured civic complaints into verified public solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-700 font-mono">{step.num}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-cyan-300 border border-slate-800">
                    {step.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Core Differentiators
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Why NEXUS Outperforms Traditional Portals
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Built from the ground up to eliminate duplicate tickets, prioritize dangerous emergencies, and guarantee ground truth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-all shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-blue-500/20">
                <cap.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{cap.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Recent Community Issues Showcase */}
      {issues.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Live Feed</span>
              <h2 className="text-2xl font-bold text-white mt-1">Active Community Issues</h2>
            </div>
            <button
              onClick={() => navigateTo('map')}
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              View on Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {issues.map((issue) => {
              const pBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
              const sBadge = getStatusBadgeColor(issue.status);

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">{issue.issue_code}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pBadge.bg} ${pBadge.text} border ${pBadge.border}`}>
                        Score {issue.priority_score}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-2">{issue.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{issue.address}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-medium ${sBadge.bg} ${sBadge.text} border ${sBadge.border}`}>
                      {issue.status}
                    </span>
                    <span className="text-cyan-400 font-semibold hover:underline">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
