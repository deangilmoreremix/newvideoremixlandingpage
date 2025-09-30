import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Mail, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.user_metadata?.first_name || '',
    last_name: user?.user_metadata?.last_name || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please sign in to view your profile.</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile | VideoRemix.vip</title>
        <meta name="description" content="Manage your VideoRemix.vip profile settings." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-blue-500 mr-3" />
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              </div>
              <p className="text-gray-400">Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              {/* Status Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center mb-6"
                >
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-lg flex items-center mb-6"
                >
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}

              {/* Profile Information */}
              <div className="space-y-6">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-3">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-white">{user.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange('first_name')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-3">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-white">{user.user_metadata?.first_name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange('last_name')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-3">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-white">{user.user_metadata?.last_name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Account Created:</span>
                      <div className="text-white">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Sign In:</span>
                      <div className="text-white">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-8">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;