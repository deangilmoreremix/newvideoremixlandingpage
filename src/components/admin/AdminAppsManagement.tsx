import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, ChevronDown } from 'lucide-react';

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon_url: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AdminAppsManagement: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [allApps, setAllApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [showAppDropdown, setShowAppDropdown] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    // Filter apps based on selection
    if (selectedApp === 'all') {
      setApps(allApps);
    } else {
      setApps(allApps.filter(app => app.slug === selectedApp));
    }
  }, [selectedApp, allApps]);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/functions/v1/admin-apps', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAllApps(data.data);
        setApps(data.data); // Initially show all apps
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = async (appId: string, currentStatus: boolean) => {
    setToggling(appId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/functions/v1/admin-apps/${appId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setApps(apps.map(app =>
          app.id === appId ? { ...app, is_active: !currentStatus } : app
        ));
      }
    } catch (error) {
      console.error('Error toggling app:', error);
    } finally {
      setToggling(null);
    }
  };

  const deleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/functions/v1/admin-apps/${appId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setApps(apps.filter(app => app.id !== appId));
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Applications Management</h2>
          <p className="text-gray-400">Manage and configure your deployed applications</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* App Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAppDropdown(!showAppDropdown)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors border border-gray-600"
            >
              <span className="mr-2">
                {selectedApp === 'all' ? 'All Apps' : allApps.find(app => app.slug === selectedApp)?.name || 'Select App'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showAppDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedApp('all');
                      setShowAppDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  >
                    All Apps
                  </button>
                  {allApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app.slug);
                        setShowAppDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{app.name}</span>
                        {app.is_active ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add App
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            {/* App Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} className="w-8 h-8 rounded" />
                  ) : (
                    <Settings className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  <p className="text-sm text-gray-400">{app.category}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                app.is_active
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {app.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {app.description || 'No description available'}
            </p>

            {/* Features */}
            <div className="flex items-center space-x-2 mb-4">
              {app.is_featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Featured
                </span>
              )}
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Order: {app.sort_order}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteApp(app.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleApp(app.id, app.is_active)}
                disabled={toggling === app.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  app.is_active ? 'bg-green-600' : 'bg-gray-600'
                } ${toggling === app.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    app.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {toggling === app.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border-t border-white border-solid rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-20">
          <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
          <p className="text-gray-400">Get started by adding your first application.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAppsManagement;