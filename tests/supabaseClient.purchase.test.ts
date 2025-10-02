import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createPurchaseEvent, applyEntitlementFromPurchase } from '../src/utils/supabaseClient';
import { supabase } from '../src/utils/supabaseClient';

vi.mock('../src/utils/supabaseClient', async () => {
  const actual = await vi.importActual('../src/utils/supabaseClient');

  // Mock Supabase client
  const supabase = {
    from: vi.fn()
  };

  return {
    ...actual,
    supabase: supabase
  };
});

describe('Supabase Client Purchase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPurchaseEvent', () => {
    it('should successfully create a purchase event', async () => {
      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        status: 'paid' as const,
        raw: { test: 'data' },
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockPurchaseEvent, error: null }))
        }))
      }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await createPurchaseEvent({
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        provider_order_id: 'ch_123',
        raw: { test: 'data' },
        processed_at: '2024-01-01T00:00:00Z'
      });

      expect(supabase.from).toHaveBeenCalledWith('purchase_events');
      expect(mockInsert).toHaveBeenCalledWith({
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        provider_order_id: 'ch_123',
        raw: { test: 'data' },
        processed_at: '2024-01-01T00:00:00Z'
      });
      expect(result).toEqual(mockPurchaseEvent);
    });

    it('should return null when purchase event creation fails', async () => {
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
        }))
      }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await createPurchaseEvent({
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        provider_order_id: 'ch_123',
        raw: {},
        processed_at: '2024-01-01T00:00:00Z'
      });

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      supabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await createPurchaseEvent({
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        provider_order_id: 'ch_123',
        raw: {},
        processed_at: '2024-01-01T00:00:00Z'
      });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error creating purchase event:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('applyEntitlementFromPurchase', () => {
    it('should successfully apply entitlement for paid purchase', async () => {
      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        raw: {},
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await applyEntitlementFromPurchase(mockPurchaseEvent, 'SMARTCRM_FE');

      expect(supabase.from).toHaveBeenCalledWith('pending_entitlements');
      expect(mockInsert).toHaveBeenCalledWith({
        purchaser_email: 'user@example.com',
        product_sku: 'SMARTCRM_FE',
        source_provider: 'stripe' as const,
        source_txn_id: 'ch_123',
        status: 'pending',
        purchase_event_id: 'purchase-1'
      });
      expect(result).toBe(true);
    });

    it('should use UNKNOWN sku when no product sku provided', async () => {
      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        raw: {},
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await applyEntitlementFromPurchase(mockPurchaseEvent);

      expect(mockInsert).toHaveBeenCalledWith({
        purchaser_email: 'user@example.com',
        product_sku: 'UNKNOWN',
        source_provider: 'stripe' as const,
        source_txn_id: 'ch_123',
        status: 'pending',
        purchase_event_id: 'purchase-1'
      });
      expect(result).toBe(true);
    });

    it('should set status to cancelled for non-paid purchases', async () => {
      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'refunded' as const,
        raw: {},
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await applyEntitlementFromPurchase(mockPurchaseEvent, 'SMARTCRM_FE');

      expect(mockInsert).toHaveBeenCalledWith({
        purchaser_email: 'user@example.com',
        product_sku: 'SMARTCRM_FE',
        source_provider: 'stripe' as const,
        source_txn_id: 'ch_123',
        status: 'cancelled',
        purchase_event_id: 'purchase-1'
      });
      expect(result).toBe(true);
    });

    it('should return false when entitlement creation fails', async () => {
      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        raw: {},
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = vi.fn(() => Promise.resolve({ error: { message: 'Insert failed' } }));

      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const result = await applyEntitlementFromPurchase(mockPurchaseEvent, 'SMARTCRM_FE');

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockPurchaseEvent = {
        id: 'purchase-1',
        provider: 'stripe' as const,
        provider_event_id: 'ch_123',
        purchaser_email: 'user@example.com',
        amount_cents: 2999,
        currency: 'USD',
        status: 'paid' as const,
        raw: {},
        created_at: '2024-01-01T00:00:00Z'
      };

      supabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await applyEntitlementFromPurchase(mockPurchaseEvent, 'SMARTCRM_FE');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error creating pending entitlement:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});