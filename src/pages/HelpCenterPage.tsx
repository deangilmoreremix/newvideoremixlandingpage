import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Book, 
  CreditCard, 
  Video, 
  Sparkles, 
  HelpCircle, 
  Users, 
  Code, 
  Zap,
  ArrowRight,
  Star,
  Video as VideoIcon,
  FilePlus,
  Settings,
  LayoutTemplate,
  Laptop,
  PencilRuler,
  ArrowUpRight
} from 'lucide-react';
import MagicSparkles from '../components/MagicSparkles';

// Define the help content structure
interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content?: string;
  popular?: boolean;
  related?: string[];
  tags?: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

// Create the help center data
const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to VideoRemix.vip? Start here to learn the basics and get up and running quickly.',
    icon: <Book className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'what-is-videoremix',
        title: 'What is VideoRemix.vip?',
        excerpt: 'An introduction to VideoRemix.vip and how it can transform your video creation process.',
        category: 'getting-started',
        popular: true,
        tags: ['basics', 'introduction']
      },
      {
        id: 'create-first-video',
        title: 'Creating Your First Video',
        excerpt: 'A step-by-step guide to creating your first video with VideoRemix.vip in under 15 minutes.',
        category: 'getting-started',
        popular: true,
        tags: ['tutorial', 'basics']
      },
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        excerpt: 'Learn how to set up your account, create your profile, and configure your preferences.',
        category: 'getting-started',
        tags: ['account', 'setup']
      },
      {
        id: 'navigating-dashboard',
        title: 'Navigating the Dashboard',
        excerpt: 'Understand the different sections of your dashboard and how to find what you need.',
        category: 'getting-started',
        tags: ['interface', 'navigation']
      },
      {
        id: 'importing-media',
        title: 'Importing Your Media',
        excerpt: 'Learn how to upload and import your videos, images, and audio files into VideoRemix.vip.',
        category: 'getting-started',
        tags: ['upload', 'media', 'import']
      }
    ]
  },
  {
    id: 'account-billing',
    name: 'Account & Billing',
    description: 'Manage your subscription, billing information, and account settings.',
    icon: <CreditCard className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'subscription-plans',
        title: 'Subscription Plans Explained',
        excerpt: 'A detailed breakdown of all subscription plans, features, and pricing.',
        category: 'account-billing',
        popular: true,
        tags: ['billing', 'plans', 'pricing']
      },
      {
        id: 'manage-subscription',
        title: 'Managing Your Subscription',
        excerpt: 'How to upgrade, downgrade, or cancel your subscription with VideoRemix.vip.',
        category: 'account-billing',
        tags: ['billing', 'subscription', 'cancel']
      },
      {
        id: 'payment-methods',
        title: 'Payment Methods & Billing Cycles',
        excerpt: 'Information about accepted payment methods and how billing cycles work.',
        category: 'account-billing',
        tags: ['payment', 'billing']
      },
      {
        id: 'invoices-receipts',
        title: 'Invoices & Receipts',
        excerpt: 'How to view and download your invoices and receipts for your records.',
        category: 'account-billing',
        tags: ['invoices', 'receipts', 'taxes']
      },
      {
        id: 'team-billing',
        title: 'Team & Enterprise Billing',
        excerpt: 'Learn about team billing, user seats, and enterprise invoicing options.',
        category: 'account-billing',
        tags: ['teams', 'enterprise', 'seats']
      }
    ]
  },
  {
    id: 'platform-usage',
    name: 'Using the Platform',
    description: 'Learn how to use the core functionality of VideoRemix.vip effectively.',
    icon: <Video className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'video-editor-interface',
        title: 'Video Editor Interface Overview',
        excerpt: 'A comprehensive guide to the video editor interface and its components.',
        category: 'platform-usage',
        popular: true,
        tags: ['editor', 'interface']
      },
      {
        id: 'timeline-editing',
        title: 'Timeline Editing Basics',
        excerpt: 'Understanding how to use the timeline to arrange and edit your video content.',
        category: 'platform-usage',
        tags: ['timeline', 'editing', 'basics']
      },
      {
        id: 'adding-media',
        title: 'Adding & Managing Media',
        excerpt: 'How to add, organize, and manage your media assets within projects.',
        category: 'platform-usage',
        tags: ['media', 'assets', 'organization']
      },
      {
        id: 'export-options',
        title: 'Export Options & Settings',
        excerpt: 'Learn about different export options, formats, resolutions, and optimization settings.',
        category: 'platform-usage',
        tags: ['export', 'formats', 'resolution']
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts & Productivity Tips',
        excerpt: 'Boost your productivity with keyboard shortcuts and efficiency tips.',
        category: 'platform-usage',
        tags: ['shortcuts', 'productivity', 'efficiency']
      }
    ]
  },
  {
    id: 'features-tools',
    name: 'Features & Tools',
    description: 'Detailed guides for specific features and tools available in VideoRemix.vip.',
    icon: <Sparkles className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'ai-editing-guide',
        title: 'AI Editing: Complete Guide',
        excerpt: 'Everything you need to know about using our AI editing capabilities.',
        category: 'features-tools',
        popular: true,
        tags: ['AI', 'editing', 'automation']
      },
      {
        id: 'templates-usage',
        title: 'Using Video Templates',
        excerpt: 'How to select, customize, and save templates for faster video creation.',
        category: 'features-tools',
        tags: ['templates', 'customization']
      },
      {
        id: 'text-effects',
        title: 'Text & Typography Effects',
        excerpt: 'Create stunning text animations and typography effects for your videos.',
        category: 'features-tools',
        tags: ['text', 'typography', 'effects']
      },
      {
        id: 'transitions-effects',
        title: 'Transitions & Visual Effects',
        excerpt: 'Learn about all available transitions and visual effects to enhance your videos.',
        category: 'features-tools',
        tags: ['transitions', 'effects', 'visual']
      },
      {
        id: 'audio-tools',
        title: 'Audio Editing Tools',
        excerpt: 'Master audio editing, voice overs, music, and sound effects in your videos.',
        category: 'features-tools',
        tags: ['audio', 'music', 'voiceover']
      }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Solutions to common issues and technical problems you might encounter.',
    icon: <HelpCircle className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'common-issues',
        title: 'Common Issues & Solutions',
        excerpt: 'Fixes for the most frequently encountered problems on VideoRemix.vip.',
        category: 'troubleshooting',
        popular: true,
        tags: ['problems', 'fixes', 'solutions']
      },
      {
        id: 'upload-issues',
        title: 'Upload & Import Problems',
        excerpt: 'Troubleshooting guide for media upload and import issues.',
        category: 'troubleshooting',
        tags: ['upload', 'import', 'media']
      },
      {
        id: 'export-issues',
        title: 'Export & Rendering Problems',
        excerpt: 'Solutions for issues with exporting, rendering, and downloading videos.',
        category: 'troubleshooting',
        tags: ['export', 'render', 'download']
      },
      {
        id: 'performance-optimization',
        title: 'Performance Optimization',
        excerpt: 'Tips to improve performance and reduce lag when working with large projects.',
        category: 'troubleshooting',
        tags: ['performance', 'speed', 'optimization']
      },
      {
        id: 'browser-compatibility',
        title: 'Browser & Device Compatibility',
        excerpt: 'Information about supported browsers, devices, and troubleshooting compatibility issues.',
        category: 'troubleshooting',
        tags: ['browser', 'compatibility', 'devices']
      }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Learn how to work with team members and share your projects.',
    icon: <Users className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'team-projects',
        title: 'Working with Team Projects',
        excerpt: 'How to create, manage, and collaborate on team projects effectively.',
        category: 'collaboration',
        tags: ['team', 'projects', 'collaboration']
      },
      {
        id: 'sharing-permissions',
        title: 'Sharing & Permissions',
        excerpt: 'Understanding sharing options and permission levels for different users.',
        category: 'collaboration',
        tags: ['sharing', 'permissions', 'access']
      },
      {
        id: 'feedback-comments',
        title: 'Feedback & Comments',
        excerpt: 'Using the feedback and comment system to collaborate with team members.',
        category: 'collaboration',
        popular: true,
        tags: ['feedback', 'comments', 'review']
      },
      {
        id: 'version-history',
        title: 'Version History & Revisions',
        excerpt: 'How to track changes, view version history, and restore previous versions.',
        category: 'collaboration',
        tags: ['versions', 'history', 'revisions']
      },
      {
        id: 'client-review',
        title: 'Client Review Process',
        excerpt: 'Setting up and managing the client review process for your projects.',
        category: 'collaboration',
        tags: ['clients', 'review', 'approval']
      }
    ]
  },
  {
    id: 'api-integrations',
    name: 'API & Integrations',
    description: 'Information about our API and integrations with other services.',
    icon: <Code className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'api-introduction',
        title: 'API Introduction & Authentication',
        excerpt: 'Getting started with the VideoRemix.vip API and authentication process.',
        category: 'api-integrations',
        tags: ['API', 'authentication', 'development']
      },
      {
        id: 'social-media-integration',
        title: 'Social Media Integrations',
        excerpt: 'How to connect and publish directly to social media platforms.',
        category: 'api-integrations',
        popular: true,
        tags: ['social media', 'publishing', 'integrations']
      },
      {
        id: 'cms-integration',
        title: 'CMS & Website Integrations',
        excerpt: 'Integrating VideoRemix.vip with content management systems and websites.',
        category: 'api-integrations',
        tags: ['CMS', 'WordPress', 'website']
      },
      {
        id: 'webhooks',
        title: 'Using Webhooks',
        excerpt: 'Setting up and managing webhooks for automated workflows.',
        category: 'api-integrations',
        tags: ['webhooks', 'automation', 'events']
      },
      {
        id: 'third-party-tools',
        title: 'Third-Party Tool Connections',
        excerpt: 'Connecting VideoRemix.vip with other tools in your workflow.',
        category: 'api-integrations',
        tags: ['integrations', 'tools', 'workflow']
      }
    ]
  },
  {
    id: 'advanced-usage',
    name: 'Advanced Usage',
    description: 'Take your skills to the next level with advanced techniques and strategies.',
    icon: <Zap className="h-6 w-6 text-primary-400" />,
    articles: [
      {
        id: 'advanced-ai-techniques',
        title: 'Advanced AI Techniques',
        excerpt: 'Master advanced AI features to create more sophisticated videos faster.',
        category: 'advanced-usage',
        popular: true,
        tags: ['AI', 'advanced', 'techniques']
      },
      {
        id: 'batch-processing',
        title: 'Batch Processing & Automation',
        excerpt: 'Create and process multiple videos with automation and batch techniques.',
        category: 'advanced-usage',
        tags: ['batch', 'automation', 'workflow']
      },
      {
        id: 'brand-kit-advanced',
        title: 'Advanced Brand Kit Usage',
        excerpt: 'Create comprehensive brand kits and global styles for consistent branding.',
        category: 'advanced-usage',
        tags: ['branding', 'consistency', 'style']
      },
      {
        id: 'custom-effects',
        title: 'Creating Custom Effects',
        excerpt: 'Build your own custom effects and transitions for unique videos.',
        category: 'advanced-usage',
        tags: ['effects', 'custom', 'transitions']
      },
      {
        id: 'advanced-export',
        title: 'Advanced Export Strategies',
        excerpt: 'Optimize your videos for different platforms with advanced export techniques.',
        category: 'advanced-usage',
        tags: ['export', 'optimization', 'platforms']
      }
    ]
  }
];

// Popular articles across all categories
const getPopularArticles = (): HelpArticle[] => {
  return helpCategories
    .flatMap(category => category.articles)
    .filter(article => article.popular)
    .slice(0, 6);
};

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Simple search implementation
    const results = helpCategories
      .flatMap(category => category.articles)
      .filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) || 
        article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Get articles for the selected category
  const getCategoryArticles = (): HelpArticle[] => {
    if (!selectedCategory) {
      return getPopularArticles();
    }
    
    const category = helpCategories.find(c => c.id === selectedCategory);
    return category ? category.articles : [];
  };

  // Get the current display title
  const getDisplayTitle = (): string => {
    if (showSearchResults) {
      return `Search Results for "${searchQuery}"`;
    }
    
    if (!selectedCategory) {
      return "Popular Articles";
    }
    
    const category = helpCategories.find(c => c.id === selectedCategory);
    return category ? category.name : "Popular Articles";
  };

  return (
    <>
      <Helmet>
        <title>Help Center | VideoRemix.vip</title>
        <meta 
          name="description" 
          content="Find answers to your questions about VideoRemix.vip. Browse our comprehensive help articles, tutorials, and guides." 
        />
      </Helmet>

      <main className="pt-32 pb-20">
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
          </div>

          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <MagicSparkles minSparkles={5} maxSparkles={8}>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    How can we help you?
                  </h1>
                </MagicSparkles>
                
                <p className="text-xl text-gray-300 mb-8">
                  Find answers, tutorials, and guides for using VideoRemix.vip
                </p>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative max-w-2xl mx-auto"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    className="bg-gray-800/70 backdrop-blur-sm w-full pl-12 pr-4 py-4 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
                    placeholder="Search for help articles, tutorials, and FAQs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <span className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                {/* Popular Searches */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="text-gray-400 text-sm mr-2">Popular:</span>
                  {['ai editing', 'templates', 'export', 'collaboration', 'billing'].map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(term)}
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar - Categories */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-white mb-4">Help Categories</h2>
                  <nav className="space-y-1">
                    <button 
                      onClick={() => {
                        setSelectedCategory(null);
                        setShowSearchResults(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center text-sm ${
                        !selectedCategory && !showSearchResults 
                          ? 'bg-primary-600/30 text-white' 
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <Star className="h-5 w-5 mr-3" />
                      Popular Articles
                    </button>
                    
                    {helpCategories.map(category => (
                      <button 
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowSearchResults(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex items-center text-sm ${
                          selectedCategory === category.id 
                            ? 'bg-primary-600/30 text-white' 
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                      >
                        <span className="mr-3">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </nav>

                  {/* Contact support */}
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="text-white font-medium mb-3">Need more help?</h3>
                    <Link 
                      to="/contact" 
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg block text-center"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{getDisplayTitle()}</h2>
                    <p className="text-gray-300">
                      {showSearchResults 
                        ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` 
                        : selectedCategory 
                          ? helpCategories.find(c => c.id === selectedCategory)?.description
                          : "Our most viewed help articles to get you started quickly."}
                    </p>
                  </div>

                  {/* Articles List */}
                  <div className="space-y-4">
                    {(showSearchResults ? searchResults : getCategoryArticles()).map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-primary-500/50 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                            {article.title}
                          </h3>
                          {article.popular && (
                            <span className="bg-primary-600/20 text-primary-400 text-xs px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{article.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-2">
                            {article.tags?.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Link 
                            to={`/help/${article.id}`}
                            className="text-primary-400 hover:text-primary-300 flex items-center text-sm font-medium"
                          >
                            Read More
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}

                    {/* No Results Found */}
                    {showSearchResults && searchResults.length === 0 && (
                      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
                        <div className="inline-block mb-4">
                          <HelpCircle className="h-12 w-12 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                        <p className="text-gray-400 mb-6">
                          We couldn't find any articles matching "{searchQuery}". Please try a different search term or browse our help categories.
                        </p>
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Browse All Categories
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Help Guides */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Featured Help Guides</h2>
                <p className="text-gray-300 max-w-3xl mx-auto">
                  Comprehensive guides to help you master different aspects of VideoRemix.vip
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'The Complete AI Editing Guide',
                    description: 'Master the AI-powered editing features to create videos in record time.',
                    icon: <Sparkles className="h-8 w-8 text-primary-400" />,
                    link: '/help/ai-editing-guide'
                  },
                  {
                    title: 'Video Template Mastery',
                    description: 'Learn how to leverage templates to create consistent, professional videos.',
                    icon: <LayoutTemplate className="h-8 w-8 text-primary-400" />,
                    link: '/help/templates-usage'
                  },
                  {
                    title: 'Multi-Platform Export Guide',
                    description: 'Optimize your videos for every platform with the right export settings.',
                    icon: <PencilRuler className="h-8 w-8 text-primary-400" />,
                    link: '/help/advanced-export'
                  }
                ].map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-primary-500/30 transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="bg-primary-900/50 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                      {guide.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{guide.title}</h3>
                    <p className="text-gray-300 mb-6 flex-grow">{guide.description}</p>
                    <Link 
                      to={guide.link}
                      className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium"
                    >
                      Read Full Guide
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Video Tutorials Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Video Tutorials</h2>
                <p className="text-gray-300 max-w-3xl mx-auto">
                  Watch step-by-step video guides to learn how to use VideoRemix.vip
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Getting Started Tutorial',
                    duration: '6:42',
                    thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  },
                  {
                    title: 'AI Editing Masterclass',
                    duration: '12:18',
                    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  },
                  {
                    title: 'Team Collaboration Tutorial',
                    duration: '8:55',
                    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  },
                  {
                    title: 'Content Repurposing Guide',
                    duration: '9:27',
                    thumbnail: 'https://images.unsplash.com/photo-1576602975754-fe2bf45eaf2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  },
                  {
                    title: 'Advanced Export Settings',
                    duration: '7:13',
                    thumbnail: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  },
                  {
                    title: 'Mastering Video Templates',
                    duration: '10:45',
                    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  }
                ].map((tutorial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    className="group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-primary-500/80 backdrop-blur-sm p-4 rounded-full"
                        >
                          <VideoIcon className="h-6 w-6 text-white" />
                        </motion.button>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {tutorial.duration}
                      </div>
                    </div>
                    <h3 className="text-white font-medium mt-3 group-hover:text-primary-400 transition-colors">
                      {tutorial.title}
                    </h3>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link 
                  to="/tutorials" 
                  className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium"
                >
                  View All Video Tutorials
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Community Help */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-20 bg-gradient-to-br from-primary-900/30 to-gray-800 rounded-xl border border-primary-500/30 p-8 text-center"
            >
              <div className="max-w-3xl mx-auto">
                <MagicSparkles minSparkles={3} maxSparkles={6}>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Join Our Community
                  </h2>
                </MagicSparkles>
                
                <p className="text-xl text-gray-300 mb-8">
                  Connect with other VideoRemix.vip users to share tips, get inspiration, and solve challenges together.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <a 
                    href="https://forum.videoremix.vip"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800/70 rounded-lg p-5 hover:border-primary-500/30 border border-gray-700 transition-colors"
                  >
                    <Laptop className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Community Forum</h3>
                    <p className="text-gray-300 text-sm">Join discussions, ask questions, and share your knowledge</p>
                    <div className="mt-3 text-primary-400 flex items-center justify-center text-sm">
                      Visit Forum
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </a>
                  <a 
                    href="https://discord.gg/videoremix" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800/70 rounded-lg p-5 hover:border-primary-500/30 border border-gray-700 transition-colors"
                  >
                    <Users className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Discord Community</h3>
                    <p className="text-gray-300 text-sm">Chat in real-time with other users and our team</p>
                    <div className="mt-3 text-primary-400 flex items-center justify-center text-sm">
                      Join Discord
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </a>
                  <a 
                    href="https://youtube.com/c/videoremix" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800/70 rounded-lg p-5 hover:border-primary-500/30 border border-gray-700 transition-colors"
                  >
                    <FilePlus className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Feature Requests</h3>
                    <p className="text-gray-300 text-sm">Suggest new features and vote for ideas from others</p>
                    <div className="mt-3 text-primary-400 flex items-center justify-center text-sm">
                      Submit Ideas
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </a>
                </div>
                
                <a 
                  href="https://twitter.com/videoremixapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white font-medium bg-primary-600 hover:bg-primary-700 py-3 px-6 rounded-lg"
                >
                  Follow Us For Updates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HelpCenterPage;