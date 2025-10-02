import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  Download,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { createPurchaseEvent, applyEntitlementFromPurchase } from '../../utils/supabaseClient';

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
}

interface PurchaseRecord {
  id: string;
  email: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  purchaseDate: string;
  productSku?: string;
}

const AdminPurchaseImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<PurchaseRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults([]);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const parseCSV = (csvText: string): PurchaseRecord[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const record: any = { id: `preview-${index}` };

      headers.forEach((header, i) => {
        const value = values[i] || '';

        // Map common CSV headers to our fields
        switch (header) {
          case 'email':
          case 'customer_email':
          case 'payer_email':
            record.email = value;
            break;
          case 'provider':
          case 'payment_provider':
            record.provider = value.toLowerCase();
            break;
          case 'amount':
          case 'amount_cents':
            record.amount = parseFloat(value) || 0;
            break;
          case 'currency':
            record.currency = value || 'USD';
            break;
          case 'status':
          case 'payment_status':
            record.status = value.toLowerCase();
            break;
          case 'transaction_id':
          case 'txn_id':
          case 'payment_id':
            record.transactionId = value;
            break;
          case 'purchase_date':
          case 'created_at':
          case 'date':
            record.purchaseDate = value;
            break;
          case 'product_sku':
          case 'sku':
          case 'product':
            record.productSku = value;
            break;
        }
      });

      return record as PurchaseRecord;
    });
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const records = parseCSV(text);
      setPreviewData(records.slice(0, 10)); // Show first 10 records
      setShowPreview(true);
    } catch (error) {
      setImportResults([{
        success: false,
        message: 'Error parsing CSV file. Please check the format.'
      }]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResults([]);

    try {
      const text = await selectedFile.text();
      const records = parseCSV(text);

      // Process records in batches
      const batchSize = 10;
      const results: ImportResult[] = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        for (const record of batch) {
          try {
            // Validate required fields
            if (!record.email || !record.provider || !record.transactionId) {
              results.push({
                success: false,
                message: `Missing required fields for record: ${record.email || 'unknown'}`
              });
              continue;
            }

            // Create purchase event
            const purchaseEventData = {
              provider: record.provider as 'stripe' | 'paypal' | 'zaxaa' | 'paykickstart',
              provider_event_id: record.transactionId,
              purchaser_email: record.email,
              amount_cents: record.amount,
              currency: record.currency,
              status: (record.status === 'paid' || record.status === 'completed' ? 'paid' : 'pending') as 'paid' | 'pending' | 'refunded' | 'chargeback' | 'cancelled' | 'trial',
              provider_order_id: record.transactionId,
              raw: record,
              processed_at: new Date().toISOString()
            };

            // Create the purchase event in database
            const createdPurchase = await createPurchaseEvent(purchaseEventData);

            if (!createdPurchase) {
              results.push({
                success: false,
                message: `Failed to create purchase event for ${record.email}`
              });
              continue;
            }

            // Apply entitlement from purchase
            const entitlementApplied = await applyEntitlementFromPurchase(createdPurchase, record.productSku);

            if (!entitlementApplied) {
              results.push({
                success: false,
                message: `Purchase created but failed to apply entitlement for ${record.email}`
              });
              continue;
            }

            results.push({
              success: true,
              message: `Successfully imported purchase and applied entitlement for ${record.email}`,
              data: record
            });

          } catch (error) {
            results.push({
              success: false,
              message: `Error importing record for ${record.email}: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportResults(results);

    } catch (error) {
      setImportResults([{
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['email', 'provider', 'amount', 'currency', 'status', 'transaction_id', 'purchase_date', 'product_sku'],
      ['user@example.com', 'stripe', '2999', 'USD', 'paid', 'ch_1234567890', '2024-01-15', 'SMARTCRM_FE'],
      ['customer@test.com', 'paypal', '4999', 'USD', 'completed', 'PAY_987654321', '2024-01-16', 'OTO1_SALES_MAX']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportResults([]);
    setPreviewData([]);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Import Purchase Data</h2>
          <p className="text-gray-400">Backfill existing purchases from Stripe, PayPal, and other providers</p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Sample CSV
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />

          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <FileText className="h-6 w-6 text-blue-400" />
                <span className="text-white font-medium">{selectedFile.name}</span>
                <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={clearFile}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={handlePreview}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Data
                </button>

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  {importing ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {importing ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg inline-block transition-colors">
                  Choose CSV File
                </div>
              </label>
              <p className="text-gray-400 text-sm mt-2">Select a CSV file containing purchase data</p>
            </div>
          )}
        </div>
      </div>

      {/* CSV Format Instructions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">CSV Format Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Required Columns:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <code className="bg-gray-700 px-1 rounded">email</code> - Customer email address</li>
              <li>• <code className="bg-gray-700 px-1 rounded">provider</code> - stripe/paypal/zaxaa/paykickstart</li>
              <li>• <code className="bg-gray-700 px-1 rounded">transaction_id</code> - Unique transaction identifier</li>
              <li>• <code className="bg-gray-700 px-1 rounded">status</code> - paid/completed/pending/refunded</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Optional Columns:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <code className="bg-gray-700 px-1 rounded">amount</code> - Purchase amount in cents</li>
              <li>• <code className="bg-gray-700 px-1 rounded">currency</code> - USD/EUR/etc (default: USD)</li>
              <li>• <code className="bg-gray-700 px-1 rounded">purchase_date</code> - ISO date string</li>
              <li>• <code className="bg-gray-700 px-1 rounded">product_sku</code> - Product identifier</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Data Preview (First 10 Records)</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-300">Email</th>
                    <th className="px-4 py-2 text-left text-gray-300">Provider</th>
                    <th className="px-4 py-2 text-left text-gray-300">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-300">Status</th>
                    <th className="px-4 py-2 text-left text-gray-300">Transaction ID</th>
                    <th className="px-4 py-2 text-left text-gray-300">Product SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((record, index) => (
                    <tr key={record.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}>
                      <td className="px-4 py-2 text-gray-300">{record.email}</td>
                      <td className="px-4 py-2 text-gray-300 capitalize">{record.provider}</td>
                      <td className="px-4 py-2 text-gray-300">
                        {record.amount ? `$${(record.amount / 100).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-300 capitalize">{record.status}</td>
                      <td className="px-4 py-2 text-gray-300 font-mono text-xs">{record.transactionId}</td>
                      <td className="px-4 py-2 text-gray-300">{record.productSku || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Import Results</h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {importResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded ${
                  result.success
                    ? 'bg-green-400/10 border border-green-400/20'
                    : 'bg-red-400/10 border border-red-400/20'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.message}
                  </p>
                  {result.data && (
                    <p className="text-xs text-gray-400 mt-1">
                      {result.data.email} - {result.data.transactionId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {importResults.filter(r => r.success).length} successful, {importResults.filter(r => !r.success).length} failed
            </div>
            <button
              onClick={() => setImportResults([])}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchaseImport;