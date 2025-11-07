// Added TypeScript strict types and better error handling interfaces
import React, { useState, useCallback } from 'react';
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
  RefreshCw,
  Info
} from 'lucide-react';
import { createPurchaseEvent, applyEntitlementFromPurchase } from '../../utils/supabaseClient';

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
  errorCode?: string;
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

// Enhanced error types for better categorization
interface ParsingError {
  line: number;
  field: string;
  value: string;
  error: string;
}

interface ValidationError {
  record: Partial<PurchaseRecord>;
  field: string;
  error: string;
}

const AdminPurchaseImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<PurchaseRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [parsingErrors, setParsingErrors] = useState<ParsingError[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateTransactions, setDuplicateTransactions] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Enhanced file validation and selection handler
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset all state
    setSelectedFile(null);
    setImportResults([]);
    setPreviewData([]);
    setShowPreview(false);
    setParsingErrors([]);
    setValidationErrors([]);
    setDuplicateTransactions([]);
    setTotalRecords(0);
    setProcessedRecords(0);

    if (!file) return;

    // Enhanced file validation
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/csv',
      'text/plain'
    ];
    
    const validExtensions = ['.csv', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setImportResults([{
        success: false,
        message: 'Invalid file type. Please select a CSV file.',
        errorCode: 'INVALID_FILE_TYPE'
      }]);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setImportResults([{
        success: false,
        message: 'File too large. Please select a file smaller than 10MB.',
        errorCode: 'FILE_TOO_LARGE'
      }]);
      return;
    }

    if (file.size < 10) { // Minimum file size
      setImportResults([{
        success: false,
        message: 'File appears to be empty or corrupted.',
        errorCode: 'FILE_EMPTY'
      }]);
      return;
    }

    setSelectedFile(file);
  }, []);

  // Enhanced CSV parsing with robust error handling
  const parseCSV = useCallback((csvText: string): { records: PurchaseRecord[], errors: ParsingError[] } => {
    const errors: ParsingError[] = [];
    
    if (!csvText || csvText.trim().length === 0) {
      errors.push({ line: 0, field: 'file', value: '', error: 'Empty file content' });
      return { records: [], errors };
    }

    // Handle different line endings and normalize
    const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      errors.push({ line: 0, field: 'file', value: '', error: 'No data rows found' });
      return { records: [], errors };
    }

    if (lines.length === 1) {
      errors.push({ line: 1, field: 'headers', value: lines[0], error: 'Only headers found, no data rows' });
      return { records: [], errors };
    }

    // Parse headers with better error handling
    const headerLine = lines[0];
    let headers: string[];
    
    try {
      headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
      
      // Validate required headers
      const requiredHeaders = ['email', 'provider', 'transaction_id'];
      const missingHeaders = requiredHeaders.filter(req => !headers.includes(req));
      
      if (missingHeaders.length > 0) {
        errors.push({
          line: 1,
          field: 'headers',
          value: headerLine,
          error: `Missing required columns: ${missingHeaders.join(', ')}`
        });
      }
      
    } catch (error) {
      errors.push({
        line: 1,
        field: 'headers',
        value: headerLine,
        error: 'Failed to parse headers'
      });
      return { records: [], errors };
    }

    const records: PurchaseRecord[] = [];

    // Parse data lines
    for (let lineNum = 2; lineNum <= lines.length; lineNum++) {
      const line = lines[lineNum - 1];
      
      if (!line.trim()) continue; // Skip empty lines

      try {
        // Handle quoted CSV fields
        const values = line.split(',').map(v => {
          const trimmed = v.trim().replace(/^["']|["']$/g, '');
          return trimmed;
        });

        const record: any = { id: `record-${lineNum - 2}` };

        headers.forEach((header, i) => {
          const value = values[i] || '';
          
          try {
            // Enhanced field mapping with validation
            switch (header) {
              case 'email':
              case 'customer_email':
              case 'payer_email':
                record.email = value;
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  errors.push({ line: lineNum, field: 'email', value, error: 'Invalid email format' });
                }
                break;
                
              case 'provider':
              case 'payment_provider':
                record.provider = value.toLowerCase();
                const validProviders = ['stripe', 'paypal', 'zaxaa', 'paykickstart'];
                if (value && !validProviders.includes(record.provider)) {
                  errors.push({
                    line: lineNum,
                    field: 'provider',
                    value,
                    error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
                  });
                }
                break;
                
              case 'amount':
              case 'amount_cents':
                const amount = parseFloat(value);
                record.amount = isNaN(amount) ? 0 : amount;
                if (value && (amount < 0 || amount > 999999999)) {
                  errors.push({
                    line: lineNum,
                    field: 'amount',
                    value,
                    error: 'Amount must be between 0 and 999,999,999'
                  });
                }
                break;
                
              case 'currency':
                record.currency = value || 'USD';
                if (value && !/^[A-Z]{3}$/.test(value)) {
                  errors.push({
                    line: lineNum,
                    field: 'currency',
                    value,
                    error: 'Currency must be a 3-letter code (e.g., USD, EUR)'
                  });
                }
                break;
                
              case 'status':
              case 'payment_status':
                record.status = value.toLowerCase();
                const validStatuses = ['paid', 'completed', 'pending', 'refunded', 'chargeback', 'cancelled', 'trial'];
                if (value && !validStatuses.includes(record.status)) {
                  errors.push({
                    line: lineNum,
                    field: 'status',
                    value,
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                  });
                }
                break;
                
              case 'transaction_id':
              case 'txn_id':
              case 'payment_id':
                record.transactionId = value;
                if (value && value.length > 255) {
                  errors.push({
                    line: lineNum,
                    field: 'transaction_id',
                    value,
                    error: 'Transaction ID too long (max 255 characters)'
                  });
                }
                break;
                
              case 'purchase_date':
              case 'created_at':
              case 'date':
                record.purchaseDate = value;
                if (value) {
                  const date = new Date(value);
                  if (isNaN(date.getTime())) {
                    errors.push({
                      line: lineNum,
                      field: 'purchase_date',
                      value,
                      error: 'Invalid date format'
                    });
                  } else if (date > new Date()) {
                    errors.push({
                      line: lineNum,
                      field: 'purchase_date',
                      value,
                      error: 'Purchase date cannot be in the future'
                    });
                  }
                }
                break;
                
              case 'product_sku':
              case 'sku':
              case 'product':
                record.productSku = value;
                if (value && value.length > 100) {
                  errors.push({
                    line: lineNum,
                    field: 'product_sku',
                    value,
                    error: 'Product SKU too long (max 100 characters)'
                  });
                }
                break;
            }
          } catch (fieldError) {
            errors.push({
              line: lineNum,
              field: header,
              value,
              error: `Failed to process field: ${fieldError instanceof Error ? fieldError.message : 'Unknown error'}`
            });
          }
        });

        records.push(record as PurchaseRecord);
        
      } catch (lineError) {
        errors.push({
          line: lineNum,
          field: 'line',
          value: line,
          error: `Failed to parse line: ${lineError instanceof Error ? lineError.message : 'Unknown error'}`
        });
      }
    }

    return { records, errors };
  }, []);

  // Enhanced preview with error reporting
  const handlePreview = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const { records, errors } = parseCSV(text);
      
      setParsingErrors(errors);
      setPreviewData(records.slice(0, 10)); // Show first 10 records
      setTotalRecords(records.length);
      setShowPreview(true);
      
      if (errors.length > 0) {
        setImportResults([{
          success: false,
          message: `Found ${errors.length} parsing errors in CSV file.`,
          errorCode: 'PARSING_ERRORS'
        }]);
      }
    } catch (error) {
      setImportResults([{
        success: false,
        message: `Error reading CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'FILE_READ_ERROR'
      }]);
    }
  }, [selectedFile, parseCSV]);

  // Enhanced import with comprehensive error handling and duplicate detection
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    // Create new abort controller for this import
    const controller = new AbortController();
    setAbortController(controller);
    
    setImporting(true);
    setImportResults([]);
    setValidationErrors([]);
    setDuplicateTransactions([]);
    setTotalRecords(0);
    setProcessedRecords(0);

    try {
      const text = await selectedFile.text();
      const { records, errors } = parseCSV(text);
      
      // Check for parsing errors
      if (errors.length > 0) {
        setImportResults([{
          success: false,
          message: `Cannot import: ${errors.length} parsing errors found. Please fix the CSV format.`,
          errorCode: 'PARSING_ERRORS'
        }]);
        setParsingErrors(errors);
        return;
      }

      // Reset error states
      setParsingErrors([]);
      setValidationErrors([]);
      
      // Validate records
      const validRecords: PurchaseRecord[] = [];
      const seenTransactions = new Set<string>();
      const duplicates: string[] = [];
      const validationErrors: ValidationError[] = [];

      for (const record of records) {
        // Check for duplicates
        if (seenTransactions.has(record.transactionId)) {
          duplicates.push(record.transactionId);
          continue;
        }
        seenTransactions.add(record.transactionId);

        // Validate required fields
        const missingFields: string[] = [];
        if (!record.email) missingFields.push('email');
        if (!record.provider) missingFields.push('provider');
        if (!record.transactionId) missingFields.push('transaction_id');

        if (missingFields.length > 0) {
          validationErrors.push({
            record,
            field: 'required_fields',
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
          validationErrors.push({
            record,
            field: 'email',
            error: 'Invalid email format'
          });
          continue;
        }

        // Validate provider
        const validProviders = ['stripe', 'paypal', 'zaxaa', 'paykickstart'];
        if (!validProviders.includes(record.provider)) {
          validationErrors.push({
            record,
            field: 'provider',
            error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
          });
          continue;
        }

        validRecords.push(record);
      }

      if (validationErrors.length > 0) {
        setValidationErrors(validationErrors);
        setImportResults([{
          success: false,
          message: `Cannot import: ${validationErrors.length} validation errors found.`,
          errorCode: 'VALIDATION_ERRORS'
        }]);
        return;
      }

      if (duplicates.length > 0) {
        setDuplicateTransactions(duplicates);
        setImportResults([{
          success: false,
          message: `Cannot import: ${duplicates.length} duplicate transactions found.`,
          errorCode: 'DUPLICATE_TRANSACTIONS'
        }]);
        return;
      }

      setTotalRecords(validRecords.length);

      // Process records in batches with enhanced error handling
      const batchSize = 5; // Reduced batch size for better error handling
      const results: ImportResult[] = [];
      const processedIds = new Set<string>();

      for (let i = 0; i < validRecords.length; i += batchSize) {
        if (controller.signal.aborted) {
          results.push({
            success: false,
            message: 'Import cancelled by user',
            errorCode: 'CANCELLED'
          });
          break;
        }

        const batch = validRecords.slice(i, i + batchSize);

        for (const record of batch) {
          try {
            // Skip if already processed
            if (processedIds.has(record.transactionId)) {
              results.push({
                success: false,
                message: `Transaction already processed: ${record.transactionId}`,
                errorCode: 'ALREADY_PROCESSED'
              });
              continue;
            }

            // Create purchase event with enhanced error handling
            const purchaseEventData = {
              provider: record.provider as 'stripe' | 'paypal' | 'zaxaa' | 'paykickstart',
              provider_event_id: record.transactionId,
              purchaser_email: record.email,
              amount_cents: Math.round(record.amount), // Ensure integer
              currency: record.currency || 'USD',
              status: (['paid', 'completed'].includes(record.status) ? 'paid' :
                      ['refunded', 'chargeback', 'cancelled'].includes(record.status) ? record.status :
                      'pending') as 'paid' | 'pending' | 'refunded' | 'chargeback' | 'cancelled' | 'trial',
              provider_order_id: record.transactionId,
              raw: record,
              processed_at: new Date().toISOString()
            };

            // Create the purchase event in database
            const createdPurchase = await createPurchaseEvent(purchaseEventData);

            if (!createdPurchase) {
              results.push({
                success: false,
                message: `Database error: Failed to create purchase event for ${record.email}`,
                errorCode: 'DATABASE_CREATE_ERROR'
              });
              continue;
            }

            // Apply entitlement from purchase
            const entitlementApplied = await applyEntitlementFromPurchase(createdPurchase, record.productSku);

            if (!entitlementApplied) {
              results.push({
                success: false,
                message: `Partial success: Purchase created but failed to apply entitlement for ${record.email}`,
                errorCode: 'ENTITLEMENT_ERROR',
                data: record
              });
              continue;
            }

            processedIds.add(record.transactionId);
            results.push({
              success: true,
              message: `Successfully imported purchase and applied entitlement for ${record.email}`,
              data: record
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Categorize errors
            let errorCode = 'UNKNOWN_ERROR';
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
              errorCode = 'NETWORK_ERROR';
            } else if (errorMessage.includes('database') || errorMessage.includes('supabase')) {
              errorCode = 'DATABASE_ERROR';
            } else if (errorMessage.includes('auth') || errorMessage.includes('permission')) {
              errorCode = 'AUTH_ERROR';
            }

            results.push({
              success: false,
              message: `Error importing record for ${record.email}: ${errorMessage}`,
              errorCode
            });
          }
          
          setProcessedRecords(prev => prev + 1);
        }

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < validRecords.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setImportResults(results);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorCode = 'NETWORK_ERROR';
      } else if (errorMessage.includes('file') || errorMessage.includes('read')) {
        errorCode = 'FILE_ERROR';
      }
      
      setImportResults([{
        success: false,
        message: `Import failed: ${errorMessage}`,
        errorCode
      }]);
    } finally {
      setImporting(false);
      setAbortController(null);
    }
  }, [selectedFile, parseCSV]);

  // Abort current import
  const abortImport = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

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

  // Enhanced file clearing with state reset
  const clearFile = useCallback(() => {
    if (importing && abortController) {
      abortController.abort();
    }
    
    setSelectedFile(null);
    setImportResults([]);
    setPreviewData([]);
    setShowPreview(false);
    setParsingErrors([]);
    setValidationErrors([]);
    setDuplicateTransactions([]);
    setTotalRecords(0);
    setProcessedRecords(0);
    setAbortController(null);
  }, [importing, abortController]);

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

                {importing && (
                  <button
                    onClick={abortImport}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                )}
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
              {totalRecords > 0 && ` (${processedRecords}/${totalRecords} processed)`}
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

      {/* Enhanced Error Display */}
      {(parsingErrors.length > 0 || validationErrors.length > 0 || duplicateTransactions.length > 0) && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Error Details</h3>

          {/* Parsing Errors */}
          {parsingErrors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-red-400 font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Parsing Errors ({parsingErrors.length})
              </h4>
              <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                {parsingErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-red-300 text-sm">
                    Line {error.line}: {error.error}
                    {error.field !== 'file' && (
                      <span className="text-gray-400"> (Field: {error.field})</span>
                    )}
                  </div>
                ))}
                {parsingErrors.length > 10 && (
                  <div className="text-gray-400 text-sm mt-2">
                    ... and {parsingErrors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-yellow-400 font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Validation Errors ({validationErrors.length})
              </h4>
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-yellow-300 text-sm">
                    {error.error}
                    {error.record.email && (
                      <span className="text-gray-400"> ({error.record.email})</span>
                    )}
                  </div>
                ))}
                {validationErrors.length > 10 && (
                  <div className="text-gray-400 text-sm mt-2">
                    ... and {validationErrors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duplicate Transactions */}
          {duplicateTransactions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-orange-400 font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Duplicate Transactions ({duplicateTransactions.length})
              </h4>
              <div className="bg-orange-400/10 border border-orange-400/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                {duplicateTransactions.slice(0, 10).map((txId, index) => (
                  <div key={index} className="text-orange-300 text-sm font-mono">
                    {txId}
                  </div>
                ))}
                {duplicateTransactions.length > 10 && (
                  <div className="text-gray-400 text-sm mt-2">
                    ... and {duplicateTransactions.length - 10} more duplicates
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Progress */}
      {importing && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Import Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">
                Processing {processedRecords} of {totalRecords} records
              </span>
              <span className="text-gray-400">
                {totalRecords > 0 ? Math.round((processedRecords / totalRecords) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalRecords > 0 ? (processedRecords / totalRecords) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchaseImport;