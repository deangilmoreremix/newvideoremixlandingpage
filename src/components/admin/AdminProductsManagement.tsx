import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  tier?: string;
  features?: Record<string, any>;
  price_cents?: number;
  currency?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductWithMappings extends Product {
  mappings: ProductMapping[];
}

interface ProductMapping {
  id: string;
  provider: string;
  provider_product_id: string;
  product_sku: string;
  is_active: boolean;
  created_at: string;
}

const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [operationLoading, setOperationLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    tier: '',
    price_cents: 0,
    currency: 'USD',
    is_active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/functions/v1/admin-products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    try {
      setOperationLoading({ create: true });
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/functions/v1/admin-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(prev => [...prev, data.data]);
        setSuccess('Product created successfully');
        setShowAddModal(false);
        resetForm();
      } else {
        throw new Error(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setOperationLoading({});
    }
  };

  const updateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setOperationLoading({ update: true });
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/functions/v1/admin-products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? data.data : p));
        setSuccess('Product updated successfully');
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setOperationLoading({});
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setOperationLoading({ [productId]: true });
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/functions/v1/admin-products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSuccess('Product deleted successfully');
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setOperationLoading({});
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      tier: product.tier || '',
      price_cents: product.price_cents || 0,
      currency: product.currency || 'USD',
      is_active: product.is_active
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      tier: '',
      price_cents: 0,
      currency: 'USD',
      is_active: true
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'zaxaa': return '💰';
      case 'paykickstart': return '🚀';
      default: return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="text-gray-400">Manage your products and payment provider mappings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            {/* Product Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Package className="h-6 w-6 text-blue-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {product.is_active ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.is_active
                    ? 'bg-green-400/20 text-green-400'
                    : 'bg-red-400/20 text-red-400'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3 mb-4">
              {product.description && (
                <p className="text-sm text-gray-300">{product.description}</p>
              )}

              {product.price_cents && (
                <div className="flex items-center text-sm text-gray-400">
                  <span className="font-medium text-white">
                    ${(product.price_cents / 100).toFixed(2)} {product.currency}
                  </span>
                  {product.tier && (
                    <span className="ml-2 px-2 py-1 bg-gray-700 rounded text-xs">
                      {product.tier.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => openEditModal(product)}
                className="text-blue-400 hover:text-blue-300 p-2"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => deleteProduct(product.id)}
                disabled={operationLoading[product.id]}
                className="text-red-400 hover:text-red-300 p-2 disabled:opacity-50"
              >
                {operationLoading[product.id] ? (
                  <div className="w-4 h-4 border-t border-red-400 border-solid rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Add Product
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Add Product</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product SKU"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tier</label>
                <input
                  type="text"
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product tier"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (cents)</label>
                  <input
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => setFormData({...formData, price_cents: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">Active</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={createProduct}
                disabled={operationLoading.create || !formData.sku || !formData.name}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center"
              >
                {operationLoading.create ? (
                  <div className="w-4 h-4 border-t border-white border-solid rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Product</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product SKU"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tier</label>
                <input
                  type="text"
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product tier"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (cents)</label>
                  <input
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => setFormData({...formData, price_cents: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="edit_is_active" className="text-sm text-gray-300">Active</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={updateProduct}
                disabled={operationLoading.update || !formData.sku || !formData.name}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center"
              >
                {operationLoading.update ? (
                  <div className="w-4 h-4 border-t border-white border-solid rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsManagement;