import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Image as ImageIcon,
  Sparkles,
  Palette,
  UserCircle,
  Package,
  Layers,
  FileText,
  Mic,
  Search,
  ArrowRight,
  Filter,
  Play,
  Star,
  PanelTop,
  Zap,
  Camera,
  Share,
  Megaphone,
  Database,
  Monitor,
  DollarSign,
  FileSignature,
  LayoutTemplate,
  ShoppingBag,
  Store,
  UserCheck,
  Rocket,
  Settings,
  BarChart2,
  Briefcase,
  MessageSquare
} from 'lucide-react';

interface DatabaseApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon_url?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  deployment_url?: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

interface ComponentApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  image: string;
  popular?: boolean;
  new?: boolean;
  comingSoon?: boolean;
  url?: string;
}

// Icon mapping based on category or app slug
const getIconForApp = (app: DatabaseApp): React.ReactNode => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    // Categories
    'video': Video,
    'lead-gen': Users,
    'ai-image': ImageIcon,
    'branding': Palette,
    'personalizer': UserCircle,
    'creative': Package,
    'content': Sparkles,
    'visual': ImageIcon,
    'sales': BarChart2,
    'page': PanelTop,
    'client': UserCheck,
    'communication': MessageSquare,
    'ai': Sparkles,

    // Specific apps
    'ai-personalized-content': Sparkles,
    'ai-referral-maximizer': Megaphone,
    'ai-sales-maximizer': BarChart2,
    'ai-screen-recorder': Monitor,
    'smart-crm-closer': Database,
    'video-ai-editor': Video,
    'ai-video-image': ImageIcon,
    'ai-skills-monetizer': DollarSign,
    'ai-signature': FileSignature,
    'ai-template-generator': LayoutTemplate,
    'funnelcraft-ai': BarChart2,
    'interactive-shopping': ShoppingBag,
    'personalizer-ai-profile-generator': UserCircle,
    'personalizer-ai-video-image-transformer': Sparkles,
    'personalizer-url-video-generation': Video,
    'ai-proposal': FileText,
    'sales-assistant-app': Briefcase,
    'sales-page-builder': PanelTop
  };

  const IconComponent = iconMap[app.slug] || iconMap[app.category] || Sparkles;
  return React.createElement(IconComponent, { className: "h-6 w-6" });
};

// Transform database app to component app
const transformApp = (dbApp: DatabaseApp): ComponentApp => {
  return {
    id: dbApp.slug, // Use slug as id for consistency
    name: dbApp.name,
    description: dbApp.description || '',
    category: dbApp.category,
    icon: getIconForApp(dbApp),
    image: dbApp.icon_url || 'https://images.unsplash.com/photo-1616469829941-c7200edec809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: dbApp.is_featured,
    new: false, // Could be determined by created_at date
    comingSoon: false,
    url: dbApp.deployment_url || `/app/${dbApp.slug}`
  };
};

export const useApps = () => {
  const [apps, setApps] = useState<ComponentApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/functions/v1/admin-apps');

      if (!response.ok) {
        throw new Error(`Failed to fetch apps: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Filter out inactive apps, transform, and sort by sort_order
        const activeApps = data.data
          .filter((app: DatabaseApp) => app.is_active)
          .map(transformApp)
          .sort((a: ComponentApp, b: ComponentApp) => {
            // Sort by some logic - could be enhanced
            return a.name.localeCompare(b.name);
          });

        setApps(activeApps);
      } else {
        throw new Error(data.error || 'Failed to fetch apps');
      }
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return {
    apps,
    loading,
    error,
    refetch: fetchApps
  };
};