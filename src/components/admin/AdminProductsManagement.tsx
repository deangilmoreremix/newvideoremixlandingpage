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
  AlertTriangle
} from 'lucide-react';
import { Product, ProductMapping, getProducts } from '../../utils/supabaseClient';

interface ProductWithMappings extends Product {
  mappings: ProductMapping[];
}

const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<ProductWithMappings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithMappings | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // For now, we'll create mock data since the functions aren't fully implemented
      // In production, this would fetch from the database
      const mockProducts: ProductWithMappings[] = [
        {
          id: '1',
          sku: 'SMARTCRM_FE',
          display_name: 'SmartCRM Frontend Edition',
          description: 'Complete CRM solution for small businesses',
          tier: 'fe',
          features: { crm: true, contacts: true, deals: true },
          price_cents: 2999,
          currency: 'USD',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          mappings: [
            {
              id: '1',
              provider: 'stripe',
              provider_product_id: 'price_1234567890',
              product_sku: 'SMARTCRM_FE',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        },
        {
          id: '2',
          sku: 'OTO1_SALES_MAX',
          display_name: 'OTO1 Sales Maximizer',
          description: 'Advanced sales automation tools',
          tier: 'oto1',
          features: { automation: true, analytics: true },
          price_cents: 4999,
          currency: 'USD',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          mappings: []
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="text-gray-400">Manage your products and payment provider mappings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
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
                  <h3 className="text-lg font-semibold text-white">{product.display_name}</h3>
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
              <p className="text-sm text-gray-300">{product.description}</p>

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

            {/* Provider Mappings */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Provider Mappings</span>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowMappingModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Manage
                </button>
              </div>

              {product.mappings.length > 0 ? (
                <div className="space-y-2">
                  {product.mappings.map((mapping) => (
                    <div key={mapping.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getProviderIcon(mapping.provider)}</span>
                        <span className="text-sm text-gray-300 capitalize">{mapping.provider}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {mapping.provider_product_id.substring(0, 12)}...
                        </span>
                        {mapping.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No mappings configured</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedProduct(product)}
                className="text-blue-400 hover:text-blue-300 p-2"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button className="text-red-400 hover:text-red-300 p-2">
                <Trash2 className="h-4 w-4" />
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
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Add Product
          </button>
        </div>
      )}

      {/* Add Product Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Product</h3>
            <p className="text-gray-400 mb-4">Product creation form would go here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Modal Placeholder */}
      {showMappingModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Manage Mappings: {selectedProduct.display_name}
            </h3>
            <p className="text-gray-400 mb-4">Provider mapping management would go here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsManagement;