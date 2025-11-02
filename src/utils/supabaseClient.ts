import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are not set. Please check your environment variables.');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Hero section types
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  background_image_url: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Benefits/Features types
export interface BenefitFeature {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  stats: {
    label: string;
    value: string;
  }[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Testimonial types
export interface Testimonial {
  id: string;
  content: string;
  name: string;
  role: string;
  company?: string;
  image_url: string;
  rating: number;
  category?: string;
  featured: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// FAQ types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  list_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Pricing plan types
export interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  description: string;
  features: string[];
  is_popular: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Comprehensive Entitlement System Types

export interface Product {
  id: string;
  sku: string;
  display_name: string;
  tier?: string;
  description?: string;
  features: Record<string, any>;
  price_cents?: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseEvent {
  id: string;
  provider: 'stripe' | 'paypal' | 'zaxaa' | 'paykickstart';
  provider_event_id: string;
  provider_order_id?: string;
  purchaser_email: string;
  amount_cents?: number;
  currency: string;
  status: 'paid' | 'refunded' | 'chargeback' | 'cancelled' | 'trial' | 'pending';
  raw: Record<string, any>;
  processed_at?: string;
  created_at: string;
}

export interface UserEntitlement {
  id: string;
  user_id: string;
  product_sku: string;
  source_provider: string;
  source_txn_id?: string;
  status: 'active' | 'cancelled' | 'refunded' | 'chargeback' | 'expired';
  started_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PendingEntitlement {
  id: string;
  purchaser_email: string;
  product_sku: string;
  source_provider: string;
  source_txn_id?: string;
  status: string;
  purchase_event_id?: string;
  claimed_by?: string;
  claimed_at?: string;
  expires_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductMapping {
  id: string;
  provider: 'stripe' | 'paypal' | 'zaxaa' | 'paykickstart';
  provider_product_id: string;
  product_sku: string;
  is_active: boolean;
  created_at: string;
}

export interface UserEntitlementView extends UserEntitlement {
  display_name: string;
  description?: string;
  features: Record<string, any>;
  is_active: boolean;
}

export interface PendingEntitlementView extends PendingEntitlement {
  display_name: string;
  description?: string;
}

// Video types
export interface Video {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  original_filename: string;
  file_path: string;
  thumbnail_path?: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  duration?: number;
  file_size?: number;
  mime_type?: string;
  processing_started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VideoUploadData {
  file: File;
  title?: string;
  description?: string;
}

export interface VideoUpdateData {
  title?: string;
  description?: string;
}

// Data fetching functions
async function getHeroContent() {
  try {
    const { data, error } = await supabase
      .from('hero_content')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching hero content:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return null;
  }
}

async function getBenefitsFeatures() {
  const { data, error } = await supabase
    .from('benefits_features')
    .select('*')
    .eq('enabled', true)
    .order('id', { ascending: true });
  
  if (error) {
    console.error('Error fetching benefits/features:', error);
    return [];
  }
  
  return data as BenefitFeature[];
}

async function getTestimonials(featured_only = false) {
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('enabled', true);
  
  if (featured_only) {
    query = query.eq('featured', true);
  }
  
  const { data, error } = await query.order('id', { ascending: true });
  
  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
  
  return data as Testimonial[];
}

async function getFAQs(category = 'all') {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('enabled', true);
  
  if (category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('list_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
  
  return data as FAQ[];
}

async function getPricingPlans() {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('enabled', true)
    .order('price_monthly', { ascending: true });
  
  if (error) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }
  
  return data as PricingPlan[];
}

export async function getAllLandingPageContent() {
  try {
    const [hero, benefits, testimonials, faqs, pricing] = await Promise.all([
      getHeroContent(),
      getBenefitsFeatures(),
      getTestimonials(true),
      getFAQs(),
      getPricingPlans()
    ]);

    return {
      hero,
      benefits,
      testimonials,
      faqs,
      pricing
    };
  } catch (error) {
    console.error('Error fetching all landing page content:', error);
    return {
      hero: null,
      benefits: [],
      testimonials: [],
      faqs: [],
      pricing: []
    };
  }
}

// Video upload functions
async function uploadVideo(file: File, userId: string, onProgress?: (progress: number) => void): Promise<{ path: string; url: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    return null;
  }
}

async function deleteVideo(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('videos')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting video:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

async function getVideoUrl(filePath: string): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting video URL:', error);
    return null;
  }
}

// Update the Video interface to include storage path
export interface Video {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  original_filename: string;
  storage_path: string; // Add this field
  thumbnail_path?: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  duration?: number;
  file_size?: number;
  mime_type?: string;
  processing_started_at?: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Update video creation function
async function createVideoRecord(videoData: {
  userId: string;
  title?: string;
  description?: string;
  originalFilename: string;
  storagePath: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<Video | null> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        user_id: videoData.userId,
        title: videoData.title,
        description: videoData.description,
        original_filename: videoData.originalFilename,
        storage_path: videoData.storagePath,
        file_size: videoData.fileSize,
        mime_type: videoData.mimeType,
        status: 'uploaded'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video record:', error);
      return null;
    }

    return data as Video;
  } catch (error) {
    console.error('Error creating video record:', error);
    return null;
  }
}

// Complete video upload function
async function uploadUserVideo(
  file: File,
  userId: string,
  metadata?: { title?: string; description?: string },
  onProgress?: (progress: number) => void
): Promise<Video | null> {
  try {
    // Upload file to storage
    const uploadResult = await uploadVideo(file, userId, onProgress);
    if (!uploadResult) return null;

    // Create database record
    const videoRecord = await createVideoRecord({
      userId,
      title: metadata?.title,
      description: metadata?.description,
      originalFilename: file.name,
      storagePath: uploadResult.path,
      fileSize: file.size,
      mimeType: file.type
    });

    return videoRecord;
  } catch (error) {
    console.error('Error in complete video upload:', error);
    return null;
  }
}

// Video-related utility functions
async function getUserVideos(): Promise<Video[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data as Video[];
}

async function getVideoById(id: string): Promise<Video | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching video:', error);
    return null;
  }

  return data as Video;
}

// Entitlement System Functions

// Products
async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

async function getProductBySku(sku: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data as Product;
}

// User Entitlements
async function getUserEntitlements(userId: string): Promise<UserEntitlementView[]> {
  const { data, error } = await supabase
    .from('v_user_entitlements')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user entitlements:', error);
    return [];
  }

  return data as UserEntitlementView[];
}

async function checkUserEntitlement(userId: string, productSku: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('product_sku', productSku)
    .eq('status', 'active')
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

async function getUserAccessibleProducts(userId: string): Promise<string[]> {
  const entitlements = await getUserEntitlements(userId);
  return entitlements
    .filter(ent => ent.is_active)
    .map(ent => ent.product_sku);
}

// Pending Entitlements
async function getPendingEntitlements(userEmail: string): Promise<PendingEntitlementView[]> {
  const { data, error } = await supabase
    .from('v_pending_entitlements')
    .select('*')
    .eq('purchaser_email', userEmail);

  if (error) {
    console.error('Error fetching pending entitlements:', error);
    return [];
  }

  return data as PendingEntitlementView[];
}

async function claimEntitlement(pendingEntitlementId: string, userId: string): Promise<boolean> {
  // First get the pending entitlement
  const { data: pending, error: fetchError } = await supabase
    .from('pending_entitlements')
    .select('*')
    .eq('id', pendingEntitlementId)
    .single();

  if (fetchError || !pending) {
    console.error('Error fetching pending entitlement:', fetchError);
    return false;
  }

  // Create user entitlement
  const { error: insertError } = await supabase
    .from('user_entitlements')
    .insert({
      user_id: userId,
      product_sku: pending.product_sku,
      source_provider: pending.source_provider,
      source_txn_id: pending.source_txn_id,
      status: 'active',
      expires_at: pending.expires_at,
      metadata: pending.metadata
    });

  if (insertError) {
    console.error('Error creating user entitlement:', insertError);
    return false;
  }

  // Mark pending entitlement as claimed
  const { error: updateError } = await supabase
    .from('pending_entitlements')
    .update({
      status: 'claimed',
      claimed_by: userId,
      claimed_at: new Date().toISOString()
    })
    .eq('id', pendingEntitlementId);

  if (updateError) {
    console.error('Error updating pending entitlement:', updateError);
    return false;
  }

  return true;
}

// Purchase Events (Admin only)
async function createPurchaseEvent(eventData: Omit<PurchaseEvent, 'id' | 'created_at'>): Promise<PurchaseEvent | null> {
  const { data, error } = await supabase
    .from('purchase_events')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase event:', error);
    return null;
  }

  return data as PurchaseEvent;
}

async function applyEntitlementFromPurchase(purchase: PurchaseEvent, productSku?: string): Promise<boolean> {
  // For now, we'll create pending entitlements since we can't access admin APIs from client
  // In production, this would be handled by server-side webhook processing

  const sku = productSku || 'UNKNOWN'; // This should be mapped from provider data

  const { error } = await supabase
    .from('pending_entitlements')
    .insert({
      purchaser_email: purchase.purchaser_email,
      product_sku: sku,
      source_provider: purchase.provider,
      source_txn_id: purchase.provider_event_id,
      status: purchase.status === 'paid' ? 'pending' : 'cancelled',
      purchase_event_id: purchase.id
    });

  if (error) {
    console.error('Error creating pending entitlement:', error);
    return false;
  }

  return true;
}

export {
  getUserVideos,
  getVideoById,
  uploadVideo,
  deleteVideo,
  getVideoUrl,
  createVideoRecord,
  uploadUserVideo,
  getProducts,
  getProductBySku,
  getUserEntitlements,
  checkUserEntitlement,
  getUserAccessibleProducts,
  getPendingEntitlements,
  claimEntitlement,
  createPurchaseEvent,
  applyEntitlementFromPurchase
};