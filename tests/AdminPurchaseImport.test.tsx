import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPurchaseImport from '../src/components/admin/AdminPurchaseImport';
import { createPurchaseEvent, applyEntitlementFromPurchase } from '../src/utils/supabaseClient';

// Mock File API
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  content: string;

  constructor(parts: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = parts[0]?.length || 0;
    this.type = options.type || '';
    this.content = parts[0] || '';
  }

  text() {
    return Promise.resolve(this.content);
  }
} as any;

// Mock the supabase functions
vi.mock('../src/utils/supabaseClient', () => ({
  createPurchaseEvent: vi.fn(),
  applyEntitlementFromPurchase: vi.fn(),
}));

describe('AdminPurchaseImport Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with initial state', () => {
    render(<AdminPurchaseImport />);

    expect(screen.getByText('Import Purchase Data')).toBeTruthy();
    expect(screen.getByText('Backfill existing purchases from Stripe, PayPal, and other providers')).toBeTruthy();
    expect(screen.getByText('Choose CSV File')).toBeTruthy();
    expect(screen.getByText('Sample CSV')).toBeTruthy();
  });

  it('should handle file selection', async () => {
    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(['email,provider,amount,status,transaction_id\nuser@example.com,stripe,2999,paid,ch_123'], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
      expect(screen.getByText('Preview Data')).toBeTruthy();
      expect(screen.getByText('Import Data')).toBeTruthy();
    });
  });

  it('should parse CSV correctly', async () => {
    const csvContent = `email,provider,amount,currency,status,transaction_id,purchase_date,product_sku
user1@example.com,stripe,2999,USD,paid,ch_123,2024-01-15,SMARTCRM_FE
user2@example.com,paypal,4999,USD,completed,txn_456,2024-01-16,OTO1_SALES_MAX`;

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    // Click preview
    const previewButton = screen.getByText('Preview Data');
    fireEvent.click(previewButton);

    // Note: Preview modal functionality would be tested separately
    // For now, just verify the button exists and file is loaded
    expect(previewButton).toBeTruthy();
  });

  it('should import purchases successfully', async () => {
    const csvContent = `email,provider,amount,status,transaction_id,product_sku
user@example.com,stripe,2999,paid,ch_123,SMARTCRM_FE`;

    // Mock successful responses
    const mockPurchaseEvent = {
      id: 'purchase-1',
      provider: 'stripe',
      provider_event_id: 'ch_123',
      purchaser_email: 'user@example.com',
      amount_cents: 2999,
      status: 'paid',
      raw: {},
      created_at: '2024-01-01T00:00:00Z'
    };

    (createPurchaseEvent as any).mockResolvedValue(mockPurchaseEvent);
    (applyEntitlementFromPurchase as any).mockResolvedValue(true);

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    const importButton = screen.getByText('Import Data');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Results')).toBeTruthy();
      expect(screen.getByText('Successfully imported purchase and applied entitlement for user@example.com')).toBeTruthy();
    });

    expect(createPurchaseEvent).toHaveBeenCalledWith({
      provider: 'stripe',
      provider_event_id: 'ch_123',
      purchaser_email: 'user@example.com',
      amount_cents: 2999,
      currency: undefined,
      status: 'paid',
      provider_order_id: 'ch_123',
      raw: {
        id: 'preview-0',
        email: 'user@example.com',
        provider: 'stripe',
        amount: 2999,
        status: 'paid',
        transactionId: 'ch_123',
        productSku: 'SMARTCRM_FE'
      },
      processed_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    });

    expect(applyEntitlementFromPurchase).toHaveBeenCalledWith(mockPurchaseEvent, 'SMARTCRM_FE');
  });

  it('should handle import errors when purchase creation fails', async () => {
    const csvContent = `email,provider,amount,status,transaction_id
user@example.com,stripe,2999,paid,ch_123`;

    (createPurchaseEvent as any).mockResolvedValue(null);

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    const importButton = screen.getByText('Import Data');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create purchase event for user@example.com')).toBeTruthy();
    });
  });

  it('should handle import errors when entitlement application fails', async () => {
    const csvContent = `email,provider,amount,status,transaction_id,product_sku
user@example.com,stripe,2999,paid,ch_123,SMARTCRM_FE`;

    const mockPurchaseEvent = {
      id: 'purchase-1',
      provider: 'stripe',
      provider_event_id: 'ch_123',
      purchaser_email: 'user@example.com',
      amount_cents: 2999,
      status: 'paid',
      raw: {},
      created_at: '2024-01-01T00:00:00Z'
    };

    (createPurchaseEvent as any).mockResolvedValue(mockPurchaseEvent);
    (applyEntitlementFromPurchase as any).mockResolvedValue(false);

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    const importButton = screen.getByText('Import Data');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Purchase created but failed to apply entitlement for user@example.com')).toBeTruthy();
    });
  });

  it('should validate required fields and skip invalid records', async () => {
    const csvContent = `email,provider,amount,status,transaction_id
,stripe,2999,paid,ch_123
user@example.com,,2999,paid,ch_124
user2@example.com,stripe,2999,paid,`;

    (createPurchaseEvent as any).mockResolvedValue(null);

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    const importButton = screen.getByText('Import Data');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Missing required fields/)).toHaveLength(3);
    });
  });

  it('should call import functions with correct parameters', async () => {
    const csvContent = `email,provider,amount,status,transaction_id,product_sku
user@example.com,stripe,2999,paid,ch_123,SMARTCRM_FE`;

    const mockPurchaseEvent = {
      id: 'purchase-1',
      provider: 'stripe',
      provider_event_id: 'ch_123',
      purchaser_email: 'user@example.com',
      amount_cents: 2999,
      status: 'paid',
      raw: {},
      created_at: '2024-01-01T00:00:00Z'
    };

    (createPurchaseEvent as any).mockResolvedValue(mockPurchaseEvent);
    (applyEntitlementFromPurchase as any).mockResolvedValue(true);

    render(<AdminPurchaseImport />);

    const fileInput = screen.getByText('Choose CSV File').closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeTruthy();
    });

    const importButton = screen.getByText('Import Data');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(createPurchaseEvent).toHaveBeenCalledWith({
        provider: 'stripe',
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: undefined,
        status: 'paid',
        provider_order_id: 'ch_123',
        raw: {
          id: 'preview-0',
          email: 'user@example.com',
          provider: 'stripe',
          amount: 2999,
          status: 'paid',
          transactionId: 'ch_123',
          productSku: 'SMARTCRM_FE'
        },
        processed_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });

      expect(applyEntitlementFromPurchase).toHaveBeenCalledWith(mockPurchaseEvent, 'SMARTCRM_FE');
    });
  });
});