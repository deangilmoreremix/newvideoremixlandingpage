import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Settings, Users, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import AdminAppsManagement from '../components/admin/AdminAppsManagement';
import AdminFeaturesManagement from '../components/admin/AdminFeaturesManagement';
import AdminUsersManagement from '../components/admin/AdminUsersManagement';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState<'apps' | 'features' | 'users'>('apps');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'apps', label: 'Apps Management', icon: Settings },
    { id: 'features', label: 'Features Management', icon: ToggleLeft },
    { id: 'users', label: 'Users Management', icon: Users },
  ];

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
                transition={{ duration: 0.6 }}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <Settings className="h-6 w-6 text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Total Apps</h3>
                  </div>
                  <div className="text-3xl font-bold text-primary-400">12</div>
                  <div className="text-sm text-gray-400">8 active, 4 inactive</div>
                </div>

                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <ToggleLeft className="h-6 w-6 text-green-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Features</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-400">24</div>
                  <div className="text-sm text-gray-400">18 enabled, 6 disabled</div>
                </div>

                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-blue-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Active Users</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">1,247</div>
                  <div className="text-sm text-gray-400">+12% from last month</div>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'apps' | 'features' | 'users')}
                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'apps' && <AdminAppsManagement />}
                {activeTab === 'features' && <AdminFeaturesManagement />}
                {activeTab === 'users' && <AdminUsersManagement />}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminDashboard;