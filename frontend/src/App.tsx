import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { InteractiveMapPage } from './components/InteractiveMapPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { ReportWizard } from './components/ReportWizard';
import { IssueDetailsModal } from './components/IssueDetailsModal';
import { AuthModal } from './components/AuthModal';
import { Layers, Heart, ShieldAlert, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, selectedIssueId, navigateTo, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalIssueId, setModalIssueId] = useState<number | string | null>(null);

  // If selectedIssueId is set via navigation
  const activeIssueId = modalIssueId || selectedIssueId;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onSelectIssue={(id) => setModalIssueId(id)}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenDashboard onSelectIssue={(id) => setModalIssueId(id)} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onSelectIssue={(id) => setModalIssueId(id)} />
        )}

        {activeTab === 'resolver' && (
          <DepartmentDashboard onSelectIssue={(id) => setModalIssueId(id)} />
        )}

        {activeTab === 'map' && (
          <InteractiveMapPage onSelectIssue={(id) => setModalIssueId(id)} />
        )}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'report' && <ReportWizard />}
      </main>

      {/* Detailed Issue Dossier Modal */}
      {activeIssueId && (
        <IssueDetailsModal
          issueId={activeIssueId}
          onClose={() => {
            setModalIssueId(null);
            navigateTo(activeTab === 'issue-detail' ? 'map' : activeTab, null);
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Modern SaaS Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 px-4 sm:px-6 lg:px-8 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight font-mono text-sm">
                NEXUS<span className="text-cyan-400">.</span>
              </span>
              <p className="text-[11px] text-slate-500">Connect Problems. Coordinate Solutions.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={() => navigateTo('landing')} className="hover:text-cyan-400 transition-colors">
              Platform Overview
            </button>
            <button onClick={() => navigateTo('map')} className="hover:text-cyan-400 transition-colors">
              Geospatial Map
            </button>
            <button onClick={() => navigateTo('analytics')} className="hover:text-cyan-400 transition-colors">
              Analytics & KPIs
            </button>
            <button onClick={() => navigateTo('report')} className="hover:text-cyan-400 transition-colors">
              Report Defect
            </button>
          </div>

          <div className="text-slate-500 text-[11px] text-center md:text-right">
            <span>Intelligent Community Problem Reporting, Analysis & Resolution Platform</span>
            <br />
            <span>Built with React 19 • Leaflet OSM • Node.js • Recharts • Local AI NLP Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
