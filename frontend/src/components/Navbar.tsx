import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Bell,
  MapPin,
  BarChart3,
  PlusCircle,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  Building2,
  HardHat,
  User as UserIcon
} from 'lucide-react';
import { timeAgo } from '../utils/helpers';

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const {
    user,
    activeTab,
    navigateTo,
    logout,
    demoLogin,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const demoAccounts = [
    { role: 'citizen', name: 'Aarav Sharma (Citizen)', email: 'citizen@nexus.demo', icon: UserIcon, desc: 'Citizen / Student Reporter' },
    { role: 'admin', name: 'Dr. Rajesh Kumar (Admin)', email: 'admin@nexus.demo', icon: ShieldAlert, desc: 'City Command Administrator' },
    { role: 'roads', name: 'Er. Ramesh Patil (Roads)', email: 'roads@nexus.demo', icon: HardHat, desc: 'Public Works & Roads Resolver' },
    { role: 'sanitation', name: 'Priya Sundaram (Sanitation)', email: 'sanitation@nexus.demo', icon: Building2, desc: 'Solid Waste & Sanitation Resolver' },
    { role: 'water', name: 'Anand Murthy (Water)', email: 'water@nexus.demo', icon: Building2, desc: 'Water Supply & Sewerage Resolver' },
    { role: 'electrical', name: 'Vikram Rao (Electrical)', email: 'electrical@nexus.demo', icon: Building2, desc: 'Electrical & Streetlights Resolver' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-glow-sm">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  NEXUS<span className="text-cyan-400">.</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                  AI Civics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Connect Problems. Coordinate Solutions.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigateTo('landing')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'landing' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>

            {/* Role-specific Portal Tab */}
            {user?.role === 'admin' ? (
              <button
                onClick={() => navigateTo('admin')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Command Center
              </button>
            ) : user?.role === 'resolver' ? (
              <button
                onClick={() => navigateTo('resolver')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'resolver' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <HardHat className="w-4 h-4 text-amber-400" />
                Department Portal
              </button>
            ) : (
              <button
                onClick={() => navigateTo('citizen')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'citizen' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Community Portal
              </button>
            )}

            <button
              onClick={() => navigateTo('map')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'map' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Live Map
            </button>

            <button
              onClick={() => navigateTo('analytics')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDemoMenu(!showDemoMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-cyan-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all shadow-sm"
                title="Switch demo persona instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant 1-Click Demo Profiles
                  </div>
                  <div className="divide-y divide-slate-800/50 my-1 max-h-80 overflow-y-auto">
                    {demoAccounts.map((item) => (
                      <button
                        key={item.email}
                        onClick={async () => {
                          await demoLogin(item.role, item.email);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 hover:bg-slate-800/70 transition-colors ${
                          user?.email === item.email ? 'bg-blue-900/30 border border-blue-500/30' : ''
                        }`}
                      >
                        <item.icon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowDemoMenu(false);
                  }}
                  className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link_url && n.link_url.includes('/issues/')) {
                                const parts = n.link_url.split('/issues/');
                                if (parts[1]) navigateTo('issue-detail', parts[1]);
                              }
                              setShowNotifMenu(false);
                            }}
                            className={`p-3 text-left hover:bg-slate-800/60 transition-colors cursor-pointer ${
                              !n.is_read ? 'bg-blue-950/20 border-l-2 border-cyan-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-500">{timeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action: Report Problem */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else {
                  navigateTo('report');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-glow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Problem</span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono capitalize">
                    {user.role} {user.department_code ? `(${user.department_code})` : ''}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          <button
            onClick={() => {
              navigateTo('landing');
              setShowMobileMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            Overview
          </button>
          {user?.role === 'admin' ? (
            <button
              onClick={() => {
                navigateTo('admin');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-800 rounded-lg"
            >
              Command Center
            </button>
          ) : user?.role === 'resolver' ? (
            <button
              onClick={() => {
                navigateTo('resolver');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-800 rounded-lg"
            >
              Department Resolver
            </button>
          ) : (
            <button
              onClick={() => {
                navigateTo('citizen');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Community Portal
            </button>
          )}
          <button
            onClick={() => {
              navigateTo('map');
              setShowMobileMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            Live Map
          </button>
          <button
            onClick={() => {
              navigateTo('analytics');
              setShowMobileMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            Analytics & Impact
          </button>
        </div>
      )}
    </header>
  );
};
