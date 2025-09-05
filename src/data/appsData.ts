import React from 'react';
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
  Share
} from 'lucide-react';

// App data structure
interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  image: string;
  popular?: boolean;
  new?: boolean;
  comingSoon?: boolean;
}

// All apps data
export const appsData: App[] = [
  {
    id: 'video-creator',
    name: 'AI Video Creator',
    description: 'Create professional videos from keywords and prompts',
    category: 'video',
    icon: React.createElement(Video),
    image: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'promo-generator',
    name: 'Promo Generator',
    description: 'Generate promotional videos for your products and services',
    category: 'video',
    icon: React.createElement(Video),
    image: 'https://images.unsplash.com/photo-1532456745301-b2c645adce21?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'landing-page',
    name: 'Landing Page Creator',
    description: 'Create full-blown landing pages in 60 seconds',
    category: 'lead-gen',
    icon: React.createElement(Layers),
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'ai-image-tools',
    name: 'AI Image Tools Collection',
    description: 'Access our impressive collection of AI image creation tools',
    category: 'ai-image',
    icon: React.createElement(ImageIcon),
    image: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    new: true
  },
  {
    id: 'rebrander-ai',
    name: 'RE-BRANDER AI',
    description: 'The ultimate AI re-branding system',
    category: 'branding',
    icon: React.createElement(Palette),
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    new: true
  },
  {
    id: 'business-brander',
    name: 'Business Brander Enterprise',
    description: 'Comprehensive branding solution for enterprises',
    category: 'branding',
    icon: React.createElement(Palette),
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'branding-analyzer',
    name: 'Business Branding Analyzer',
    description: 'Analyze and improve your brand presence',
    category: 'branding',
    icon: React.createElement(Palette),
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ai-branding',
    name: 'AI Branding Accelerator',
    description: 'Speed up your branding process with AI assistance',
    category: 'branding',
    icon: React.createElement(Sparkles),
    image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ai-sales',
    name: 'AI Sales Maximizer',
    description: 'Optimize your sales strategy with AI insights',
    category: 'branding',
    icon: React.createElement(Sparkles),
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'voice-coach',
    name: 'AI Voice Coach Pro',
    description: 'Perfect your speaking skills with AI feedback',
    category: 'personalizer',
    icon: React.createElement(Mic),
    image: 'https://images.unsplash.com/photo-1590602846028-08e9d0a40b94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'resume-amplifier',
    name: 'AI Resume Amplifier',
    description: 'Enhance your resume with AI optimization',
    category: 'personalizer',
    icon: React.createElement(FileText),
    image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'storyboard',
    name: 'Storyboard AI',
    description: 'Create professional storyboards with AI assistance',
    category: 'creative',
    icon: React.createElement(Layers),
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'sales-monetizer',
    name: 'AI Sales Monetizer',
    description: 'Convert leads into sales with AI strategies',
    category: 'lead-gen',
    icon: React.createElement(Sparkles),
    image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'smart-presentations',
    name: 'Smart Presentations',
    description: 'Create engaging presentations with minimal effort',
    category: 'creative',
    icon: React.createElement(Layers),
    image: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'personalizer-recorder',
    name: 'AI Screen Recorder',
    description: 'Record and enhance screen captures automatically',
    category: 'personalizer',
    icon: React.createElement(Video),
    image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'personalizer-profile',
    name: 'AI Profile Generator',
    description: 'Create optimized profiles for any platform',
    category: 'personalizer',
    icon: React.createElement(UserCircle),
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'thumbnail-generator',
    name: 'AI Thumbnail Generator',
    description: 'Create eye-catching thumbnails that drive clicks',
    category: 'personalizer',
    icon: React.createElement(ImageIcon),
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'interactive-outros',
    name: 'Interactive Video Outros',
    description: 'Engage viewers at the end of your videos',
    category: 'creative',
    icon: React.createElement(Video),
    image: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'social-pack',
    name: 'Social Media Pack',
    description: 'Everything you need for social media success',
    category: 'creative',
    icon: React.createElement(Package),
    image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ai-art',
    name: 'AI Art Generator',
    description: 'Create stunning artwork with artificial intelligence',
    category: 'ai-image',
    icon: React.createElement(Sparkles),
    image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    new: true
  },
  {
    id: 'bg-remover',
    name: 'AI Background Remover',
    description: 'Remove backgrounds with a single click',
    category: 'ai-image',
    icon: React.createElement(ImageIcon),
    image: 'https://images.unsplash.com/photo-1635942071564-bc6acda3ac20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to natural-sounding speech',
    category: 'video',
    icon: React.createElement(Mic),
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'niche-script',
    name: 'AI Niche Script Creator',
    description: 'Generate niche-specific scripts for your videos',
    category: 'video',
    icon: React.createElement(FileText),
    image: 'https://images.unsplash.com/photo-1455390528084-8b85e4bcd271?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];