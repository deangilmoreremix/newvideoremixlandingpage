import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Package,
  Filter
} from 'lucide-react';
interface UserSubscription {
  id: string;
  user_id: string;
  product_id: string;
  product_type: string;
  purchase_date: string;
  expiry_date: string | null;
  status: string;
  payment_method: string;
  transaction_id: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  app_access_count?: number;
}

interface UserWithEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminSubscriptionsManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/functions/v1/admin-subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load subscriptions');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      // Fallback to empty array on error
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = !searchQuery ||
      sub.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'expired': return 'text-red-400 bg-red-400/20';
      case 'cancelled': return 'text-yellow-400 bg-yellow-400/20';
      case 'refunded': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
          <p className="text-gray-400">Manage user subscriptions and purchases</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user ID, product, or transaction..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
              <p className="text-gray-400 text-sm">Active Subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                ${subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0).toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                {new Set(subscriptions.map(s => s.user_id)).size}
              </p>
              <p className="text-gray-400 text-sm">Unique Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                {subscriptions.filter(s => {
                  const expiry = new Date(s.expiry_date || '');
                  return expiry > new Date() && s.status === 'active';
                }).length}
              </p>
              <p className="text-gray-400 text-sm">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-medium">
                      {subscription.user_id}
                    </div>
                    <div className="text-sm text-gray-400">
                      {subscription.transaction_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {subscription.product_id}
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {subscription.product_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1 capitalize">{subscription.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {subscription.amount ? formatCurrency(subscription.amount, subscription.currency || 'USD') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(subscription.purchase_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {subscription.expiry_date ? formatDate(subscription.expiry_date) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSubscription(subscription)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No subscriptions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsManagement;