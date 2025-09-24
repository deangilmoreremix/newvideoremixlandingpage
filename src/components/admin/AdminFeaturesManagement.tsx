import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Plus, Edit, Trash2, Settings, ChevronDown } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_enabled: boolean;
  app_slug?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const AdminFeaturesManagement: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [showAppDropdown, setShowAppDropdown] = useState(false);

  useEffect(() => {
    fetchFeatures();
    fetchApps();
  }, []);

  useEffect(() => {
    // Filter features based on selected app
    if (selectedApp === 'all') {
      setFeatures(allFeatures);
    } else {
      setFeatures(allFeatures.filter(feature => feature.app_slug === selectedApp || !feature.app_slug));
    }
  }, [selectedApp, allFeatures]);

  const fetchFeatures = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/functions/v1/admin-features', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAllFeatures(data.data);
        setFeatures(data.data); // Initially show all features
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

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
        setApps(data.data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const toggleFeature = async (featureId: string, currentStatus: boolean) => {
    setToggling(featureId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/functions/v1/admin-features/${featureId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setFeatures(features.map(feature =>
          feature.id === featureId ? { ...feature, is_enabled: !currentStatus } : feature
        ));
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
    } finally {
      setToggling(null);
    }
  };

  const deleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/functions/v1/admin-features/${featureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFeatures(features.filter(feature => feature.id !== featureId));
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
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
          <h2 className="text-2xl font-bold text-white mb-2">Features Management</h2>
          <p className="text-gray-400">Control which features are available for each app</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* App Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAppDropdown(!showAppDropdown)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors border border-gray-600"
            >
              <span className="mr-2">
                {selectedApp === 'all' ? 'All Features' : apps.find(app => app.slug === selectedApp)?.name || 'Select App'}
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
                    All Features
                  </button>
                  {apps.map((app) => (
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
            Add Feature
          </button>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Feature Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                    <p className="text-sm text-gray-400">{feature.slug}</p>
                  </div>
                </div>

                {feature.description && (
                  <p className="text-gray-300 text-sm mb-3">{feature.description}</p>
                )}

                {/* Config Preview */}
                {feature.config && Object.keys(feature.config).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Configuration:</p>
                    <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-400 font-mono">
                      {JSON.stringify(feature.config, null, 2).slice(0, 100)}
                      {JSON.stringify(feature.config).length > 100 && '...'}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.is_enabled
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {feature.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {new Date(feature.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 ml-6">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteFeature(feature.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleFeature(feature.id, feature.is_enabled)}
                  disabled={toggling === feature.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    feature.is_enabled ? 'bg-green-600' : 'bg-gray-600'
                  } ${toggling === feature.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feature.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  {toggling === feature.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border-t border-white border-solid rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {features.length === 0 && (
        <div className="text-center py-20">
          <ToggleLeft className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No features found</h3>
          <p className="text-gray-400">Get started by adding your first feature.</p>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturesManagement;