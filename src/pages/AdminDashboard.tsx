import React, { useState, useEffect, memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Shield, Settings, Users, BarChart3, ToggleLeft, ToggleRight, AlertTriangle, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import AdminAppsManagement from '../components/admin/AdminAppsManagement';
import AdminFeaturesManagement from '../components/admin/AdminFeaturesManagement';
import AdminUsersManagement from '../components/admin/AdminUsersManagement';

// Types and Interfaces
interface DashboardStats {
  totalApps: { count: number; active: number; inactive: number };
  features: { count: number; enabled: number; disabled: number };
  users: { count: number; growth: string };
}

interface TabConfig {
  id: 'apps' | 'features' | 'users';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

// Animation constants
const ANIMATION_DURATIONS = {
  FAST: 0.3,
  NORMAL: 0.6,
  SLOW: 0.8
} as const;

const ANIMATION_DELAYS = {
  STAGGER_1: 0.1,
  STAGGER_2: 0.2,
  STAGGER_3: 0.3
} as const;

// Dashboard configuration
const DASHBOARD_STATS: DashboardStats = {
  totalApps: { count: 12, active: 8, inactive: 4 },
  features: { count: 24, enabled: 18, disabled: 6 },
  users: { count: 1247, growth: '+12% from last month' }
};

const TAB_CONFIG: TabConfig[] = [
  { id: 'apps', label: 'Apps Management', icon: Settings, component: AdminAppsManagement },
  { id: 'features', label: 'Features Management', icon: ToggleLeft, component: AdminFeaturesManagement },
  { id: 'users', label: 'Users Management', icon: Users, component: AdminUsersManagement }
];

// Error Boundary Component
class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; tabId: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; tabId: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.tabId} tab:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Failed to load {this.props.tabId} management
          </h3>
          <p className="text-gray-300 mb-4">
            There was an error loading this section. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Skeleton Component
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-600 rounded mr-3"></div>
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
        <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-32"></div>
      </div>
    ))}
  </div>
);

// Custom hook for dashboard data
const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, this would be:
      // const response = await fetch('/functions/v1/admin/dashboard-stats');
      // const data = await response.json();

      setStats(DASHBOARD_STATS);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      setStats(DASHBOARD_STATS); // Fallback to static data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Memoized Stats Cards Component
const StatsCards = memo(() => {
  const { stats, loading, error } = useDashboardData();

  if (loading) {
    return <StatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATIONS.NORMAL, delay: ANIMATION_DELAYS.STAGGER_2 }}
        className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8"
      >
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          <span className="text-yellow-400">
            {error || 'Unable to load dashboard statistics. Showing cached data.'}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATIONS.NORMAL, delay: ANIMATION_DELAYS.STAGGER_2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center mb-4">
          <Settings className="h-6 w-6 text-primary-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Total Apps</h3>
        </div>
        <div className="text-3xl font-bold text-primary-400">{stats.totalApps.count.toLocaleString()}</div>
        <div className="text-sm text-gray-400">
          {stats.totalApps.active} active, {stats.totalApps.inactive} inactive
        </div>
      </div>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center mb-4">
          <ToggleLeft className="h-6 w-6 text-green-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Features</h3>
        </div>
        <div className="text-3xl font-bold text-green-400">{stats.features.count.toLocaleString()}</div>
        <div className="text-sm text-gray-400">
          {stats.features.enabled} enabled, {stats.features.disabled} disabled
        </div>
      </div>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Active Users</h3>
        </div>
        <div className="text-3xl font-bold text-blue-400">{stats.users.count.toLocaleString()}</div>
        <div className="text-sm text-gray-400">{stats.users.growth}</div>
      </div>
    </motion.div>
  );
});

StatsCards.displayName = 'StatsCards';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState<'apps' | 'features' | 'users'>('apps');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [announcements, setAnnouncements] = useState<string>('');

  // Session timeout warning (placeholder - would need backend support)
  // useEffect(() => {
  //   if (user?.sessionExpiry) {
  //     const timeUntilExpiry = user.sessionExpiry.getTime() - Date.now();
  //     const warningTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before
  //
  //     if (warningTime > 0) {
  //       const warningTimeout = setTimeout(() => {
  //         setShowTimeoutWarning(true);
  //       }, warningTime);
  //
  //       return () => clearTimeout(warningTimeout);
  //     }
  //   }
  // }, [user?.sessionExpiry]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        const tabIndex = TAB_CONFIG.findIndex(tab => tab.id === activeTab);

        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            const prevTab = TAB_CONFIG[(tabIndex - 1 + TAB_CONFIG.length) % TAB_CONFIG.length];
            setActiveTab(prevTab.id);
            setAnnouncements(`Switched to ${prevTab.label} section`);
            break;
          case 'ArrowRight':
            event.preventDefault();
            const nextTab = TAB_CONFIG[(tabIndex + 1) % TAB_CONFIG.length];
            setActiveTab(nextTab.id);
            setAnnouncements(`Switched to ${nextTab.label} section`);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Screen reader announcements for tab changes
  useEffect(() => {
    const activeTabData = TAB_CONFIG.find(tab => tab.id === activeTab);
    if (activeTabData) {
      setAnnouncements(`Now viewing ${activeTabData.label} section`);
    }
  }, [activeTab]);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
        console.warn(`AdminDashboard render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as 'apps' | 'features' | 'users');
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | VideoRemix.io</title>
        <meta
          name="description"
          content="Admin dashboard for managing VideoRemix.io applications and features."
        />
      </Helmet>

      <main className="pt-32 pb-20 min-h-screen bg-gray-900">
        {/* Admin Header */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-600/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-red-600/10 rounded-full blur-[100px] -z-10"></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATIONS.NORMAL }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-red-500 mr-3" />
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Admin <span className="text-red-400">Dashboard</span>
                  </h1>
                </div>
                <p className="text-xl text-gray-300 mb-4">
                  Manage applications and features for VideoRemix.io
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span>Logged in as: {user?.email}</span>
                  <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <StatsCards />

              {/* Tab Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION_DURATIONS.NORMAL, delay: ANIMATION_DELAYS.STAGGER_3 }}
                className="mb-8"
              >
                <nav role="tablist" aria-label="Admin dashboard sections">
                  <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
                    {TAB_CONFIG.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          aria-controls={`panel-${tab.id}`}
                          id={`tab-${tab.id}`}
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                            activeTab === tab.id
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Use Alt + ←/→ to navigate between tabs
                </div>
              </motion.div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: ANIMATION_DURATIONS.FAST }}
                style={{
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  perspective: 1000
                }}
              >
                <div
                  role="tabpanel"
                  id={`panel-${activeTab}`}
                  aria-labelledby={`tab-${activeTab}`}
                >
                  <TabErrorBoundary tabId={activeTab}>
                    {(() => {
                      const ActiveComponent = TAB_CONFIG.find(tab => tab.id === activeTab)?.component;
                      return ActiveComponent ? <ActiveComponent /> : null;
                    })()}
                  </TabErrorBoundary>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-yellow-500/50"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Session Expiring</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Your admin session will expire in 5 minutes. Would you like to extend it by staying logged in?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTimeoutWarning(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
              >
                Logout Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements}
      </div>
    </>
  );
};

export default AdminDashboard;