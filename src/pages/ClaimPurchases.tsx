import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Receipt, CheckCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { getPendingEntitlements, claimEntitlement } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import MagicSparkles from '../components/MagicSparkles';

interface PendingEntitlement {
  id: string;
  purchaser_email: string;
  product_sku: string;
  source_provider: string;
  source_txn_id?: string;
  status: string;
  display_name: string;
  description?: string;
}

const ClaimPurchases: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'receipt'>('email');
  const [email, setEmail] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [pendingEntitlements, setPendingEntitlements] = useState<PendingEntitlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // If user is logged in, pre-fill their email
    if (user?.email) {
      setEmail(user.email);
      handleEmailSearch(user.email);
    }
  }, [user]);

  const handleEmailSearch = async (searchEmail: string = email) => {
    if (!searchEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const entitlements = await getPendingEntitlements(searchEmail);
      setPendingEntitlements(entitlements);

      if (entitlements.length === 0) {
        setMessage({ type: 'error', text: 'No pending purchases found for this email address' });
      }
    } catch (error) {
      console.error('Error searching for entitlements:', error);
      setMessage({ type: 'error', text: 'Error searching for purchases. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimEntitlement = async (entitlementId: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to claim purchases' });
      return;
    }

    setClaiming(entitlementId);
    setMessage(null);

    try {
      const success = await claimEntitlement(entitlementId, user.id);

      if (success) {
        setMessage({ type: 'success', text: 'Purchase claimed successfully! You now have access to this feature.' });
        // Remove the claimed entitlement from the list
        setPendingEntitlements(prev => prev.filter(e => e.id !== entitlementId));
        // Refresh the list
        if (email) {
          handleEmailSearch(email);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to claim purchase. Please try again.' });
      }
    } catch (error) {
      console.error('Error claiming entitlement:', error);
      setMessage({ type: 'error', text: 'Error claiming purchase. Please try again.' });
    } finally {
      setClaiming(null);
    }
  };

  const handleReceiptClaim = async () => {
    if (!receiptId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a receipt ID' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to claim purchases' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // For receipt ID claiming, we'd need to implement a different lookup
      // For now, we'll show a message that this feature is coming soon
      setMessage({ type: 'error', text: 'Receipt ID claiming is not yet implemented. Please use email search instead.' });
    } catch (error) {
      console.error('Error claiming by receipt:', error);
      setMessage({ type: 'error', text: 'Error claiming purchase. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'zaxaa': return '💰';
      case 'paykickstart': return '🚀';
      default: return '🔗';
    }
  };

  return (
    <>
      <Helmet>
        <title>Claim Your Purchases | VideoRemix.vip</title>
        <meta name="description" content="Claim access to your purchased features and tools" />
      </Helmet>

      <main className="pt-32 pb-20">
        <section className="py-16 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <MagicSparkles minSparkles={3} maxSparkles={6}>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Claim Your <span className="text-primary-400">Purchases</span>
                    </h1>
                  </MagicSparkles>

                  <p className="text-xl text-gray-300 mb-8">
                    Link your account to access all the features you've purchased
                  </p>
                </motion.div>
              </div>

              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Search by Email
                  </button>
                  <button
                    onClick={() => setActiveTab('receipt')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'receipt'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Receipt className="h-4 w-4 inline mr-2" />
                    Receipt ID
                  </button>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-center ${
                    message.type === 'success'
                      ? 'bg-green-400/20 border border-green-400/30 text-green-400'
                      : 'bg-red-400/20 border border-red-400/30 text-red-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  )}
                  {message.text}
                </motion.div>
              )}

              {/* Email Search Tab */}
              {activeTab === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-8 border border-gray-700"
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address Used for Purchase
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleEmailSearch()}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center"
                      >
                        {loading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Search
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pending Entitlements */}
                  {pendingEntitlements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Found Purchases</h3>
                      <div className="space-y-4">
                        {pendingEntitlements.map((entitlement) => (
                          <div key={entitlement.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="text-2xl mr-3">{getProviderIcon(entitlement.source_provider)}</span>
                                  <div>
                                    <h4 className="text-lg font-semibold text-white">{entitlement.display_name}</h4>
                                    <p className="text-sm text-gray-400 capitalize">{entitlement.source_provider} Purchase</p>
                                  </div>
                                </div>
                                {entitlement.description && (
                                  <p className="text-gray-300 text-sm mb-3">{entitlement.description}</p>
                                )}
                                <p className="text-xs text-gray-500">SKU: {entitlement.product_sku}</p>
                              </div>
                              <button
                                onClick={() => handleClaimEntitlement(entitlement.id)}
                                disabled={claiming === entitlement.id}
                                className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center"
                              >
                                {claiming === entitlement.id ? (
                                  <Loader className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Claim
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Receipt ID Tab */}
              {activeTab === 'receipt' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-8 border border-gray-700"
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Receipt ID or Transaction ID
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={receiptId}
                        onChange={(e) => setReceiptId(e.target.value)}
                        placeholder="Enter your receipt or transaction ID"
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleReceiptClaim}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center"
                      >
                        {loading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Claim
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      This feature is coming soon. For now, please use the email search above.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Help Text */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 mb-4">
                  Don't see your purchase? Make sure you're using the same email address you used when purchasing.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/contact"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Contact Support
                  </Link>
                  <span className="text-gray-600">|</span>
                  <Link
                    to="/dashboard"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ClaimPurchases;