import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Gift, ChevronDown, Sparkles, Shield, Video, FileVideo, Users } from 'lucide-react';
import { useLandingPageContent } from '../context/LandingPageContext';
import MagicSparkles from './MagicSparkles';

export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [selectedApps, setSelectedApps] = useState<{[key: string]: boolean}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { pricingPlans, isLoading } = useLandingPageContent();

  // All apps data
  const allApps = [
    { name: "AI Personalized Content", url: "https://capable-mermaid-3c73fa.netlify.app/" },
    { name: "AI Referral Maximizer", url: "https://eloquent-kleicha-7e3a3e.netlify.app" },
    { name: "AI Sales Maximizer", url: "https://magnificent-lamington-619374.netlify.app/" },
    { name: "Smart CRM Closer", url: "https://stupendous-twilight-64389a.netlify.app/" },
    { name: "Sales Assistant App", url: "https://gentle-frangipane-ceed17.netlify.app" },
    { name: "Sales Page Builder", url: "https://prismatic-starship-c0b4c2.netlify.app" },
    { name: "Video AI Editor", url: "https://heroic-seahorse-296f32.netlify.app/" },
    { name: "AI Video & Image", url: "https://thriving-mochi-ecd815.netlify.app/" },
    { name: "AI Template Generator", url: "https://cute-khapse-4e62cb.netlify.app" },
    { name: "FunnelCraft AI", url: "https://serene-valkyrie-fec320.netlify.app/" },
    { name: "AI Screen Recorder", url: "https://adorable-arithmetic-675d28.netlify.app/" },
    { name: "AI Skills Monetizer", url: "https://roaring-mochi-39a60a.netlify.app" },
    { name: "AI Signature", url: "https://kaleidoscopic-tarsier-3d0a6c.netlify.app/" },
    { name: "AI Proposal", url: "https://keen-pastelito-6b9074.netlify.app" }
  ];

  // Category groupings
  const marketingApps = [
    "AI Personalized Content", "AI Referral Maximizer", "AI Sales Maximizer",
    "Smart CRM Closer", "Sales Assistant App", "Sales Page Builder"
  ];

  const contentApps = [
    "Video AI Editor", "AI Video & Image", "AI Template Generator", "FunnelCraft AI"
  ];

  const productivityApps = [
    "AI Screen Recorder", "AI Skills Monetizer", "AI Signature",
    "AI Proposal"
  ];

  // Helper functions
  const getAppIcon = (appName: string) => {
    const icons: {[key: string]: string} = {
      "AI Personalized Content": "🤖",
      "AI Referral Maximizer": "📈",
      "AI Sales Maximizer": "💰",
      "Smart CRM Closer": "🎯",
      "Sales Assistant App": "👔",
      "Sales Page Builder": "📄",
      "Video AI Editor": "🎬",
      "AI Video & Image": "🖼️",
      "AI Template Generator": "📝",
      "FunnelCraft AI": "🚀",
      "AI Screen Recorder": "🖥️",
      "AI Skills Monetizer": "💡",
      "AI Signature": "✍️",
      "AI Proposal": "📋"
    };
    return icons[appName] || "🔧";
  };

  const getAppDescription = (appName: string) => {
    const descriptions: {[key: string]: string} = {
      "AI Personalized Content": "Create personalized content at scale",
      "AI Referral Maximizer": "Maximize referral program effectiveness",
      "AI Sales Maximizer": "Boost sales with AI-powered strategies",
      "Smart CRM Closer": "Close more deals with smart CRM automation",
      "Sales Assistant App": "AI-powered sales assistance and insights",
      "Sales Page Builder": "Build high-converting sales pages instantly",
      "Video AI Editor": "Edit videos with advanced AI tools",
      "AI Video & Image": "Transform videos and images with AI",
      "AI Template Generator": "Generate professional templates automatically",
      "FunnelCraft AI": "Build sales funnels with AI assistance",
      "AI Screen Recorder": "Record and enhance screen content",
      "AI Skills Monetizer": "Monetize your skills with AI help",
      "AI Signature": "Create professional signatures automatically",
      "AI Proposal": "Generate compelling proposals with AI"
    };
    return descriptions[appName] || "Powerful AI tool for your business";
  };
  
  // App categories with individual apps
  const appCategories = [
    {
      name: "Marketing & Sales Apps",
      description: "Boost your marketing and sales with AI-powered tools",
      apps: [
        { name: "AI Personalized Content", url: "https://capable-mermaid-3c73fa.netlify.app/" },
        { name: "AI Referral Maximizer", url: "https://eloquent-kleicha-7e3a3e.netlify.app" },
        { name: "AI Sales Maximizer", url: "https://magnificent-lamington-619374.netlify.app/" },
        { name: "Smart CRM Closer", url: "https://stupendous-twilight-64389a.netlify.app/" },
        { name: "Sales Assistant App", url: "https://gentle-frangipane-ceed17.netlify.app" },
        { name: "Sales Page Builder", url: "https://prismatic-starship-c0b4c2.netlify.app" }
      ],
      is_popular: false
    },
    {
      name: "Content Creation Apps",
      description: "Create stunning content with professional AI tools",
      apps: [
        { name: "Video AI Editor", url: "https://heroic-seahorse-296f32.netlify.app/" },
        { name: "AI Video & Image", url: "https://thriving-mochi-ecd815.netlify.app/" },
        { name: "AI Template Generator", url: "https://cute-khapse-4e62cb.netlify.app" },
        { name: "FunnelCraft AI", url: "https://serene-valkyrie-fec320.netlify.app/" }
      ],
      is_popular: true
    },
    {
      name: "Productivity Apps",
      description: "Streamline your workflow with intelligent automation",
      apps: [
        { name: "AI Screen Recorder", url: "https://adorable-arithmetic-675d28.netlify.app/" },
        { name: "AI Skills Monetizer", url: "https://roaring-mochi-39a60a.netlify.app" },
        { name: "AI Signature", url: "https://kaleidoscopic-tarsier-3d0a6c.netlify.app/" },
        { name: "Interactive Shopping", url: "https://inspiring-mandazi-d17556.netlify.app" },
        { name: "AI Proposal", url: "https://keen-pastelito-6b9074.netlify.app" }
      ],
      is_popular: false
    }
  ];

  // Convert app categories to pricing plan format for compatibility
  const defaultPlans = appCategories.map((category, index) => ({
    name: category.name,
    price_monthly: 99,
    price_yearly: 990, // $99/year per app
    price_lifetime: 2376, // 24 years worth at yearly rate
    description: category.description,
    features: category.apps.map(app => app.name),
    is_popular: category.is_popular,
    apps: category.apps
  }));
  
  // Use dynamic data from Supabase if available
  const plans = (!isLoading && pricingPlans && pricingPlans.length > 0) ? pricingPlans : defaultPlans;
  
  // Find the popular plan
  const popularPlan = plans.find(plan => plan.is_popular) || plans[1];
  
  // Find the free plan
  const freePlan = plans.find(plan => plan.price_monthly === 0) || plans[0];
  
  // Categorized features for expanded display
  const featureCategories = [
    {
      title: "Video Creation & Editing",
      features: [
        {
          title: "AI Video Creation",
          free: "Limited to 5 videos",
          pro: "Unlimited",
          business: "Unlimited with priority processing"
        },
        {
          title: "Video Quality",
          free: "720p",
          pro: "4K",
          business: "4K"
        },
        {
          title: "AI Editing Tools",
          free: "Basic editing",
          pro: "Advanced editing",
          business: "Professional suite"
        },
        {
          title: "Smart Templates",
          free: "5 templates",
          pro: "500+ templates",
          business: "500+ templates + custom"
        },
        {
          title: "Content Repurposing",
          free: "✕",
          pro: "✓",
          business: "✓ Advanced"
        },
        {
          title: "Auto Captions",
          free: "✕",
          pro: "✓ 40+ languages",
          business: "✓ 100+ languages"
        }
      ]
    },
    {
      title: "Personalization Tools",
      features: [
        {
          title: "Audience Segmentation",
          free: "2 segments",
          pro: "Unlimited segments",
          business: "Unlimited with AI segmentation"
        },
        {
          title: "Marketing Personalization",
          free: "Basic",
          pro: "Advanced",
          business: "Enterprise-level"
        },
        {
          title: "Personalized Video Creation",
          free: "✕",
          pro: "✓",
          business: "✓ Advanced"
        },
        {
          title: "Dynamic Content",
          free: "✕",
          pro: "✓",
          business: "✓ Advanced"
        },
        {
          title: "AI Content Suggestions",
          free: "✕",
          pro: "Basic",
          business: "Advanced"
        },
        {
          title: "Custom Branding",
          free: "Limited",
          pro: "Full branding kit",
          business: "Multiple brand profiles"
        }
      ]
    },
    {
      title: "Collaboration & Workflow",
      features: [
        {
          title: "Team Members",
          free: "1 user",
          pro: "2 users",
          business: "10 users"
        },
        {
          title: "Collaboration Tools",
          free: "✕",
          pro: "✓",
          business: "✓ Advanced"
        },
        {
          title: "Approval Workflows",
          free: "✕",
          pro: "Basic",
          business: "Advanced"
        },
        {
          title: "Version History",
          free: "Limited",
          pro: "30 days",
          business: "Unlimited"
        },
        {
          title: "Role-Based Permissions",
          free: "✕",
          pro: "Basic roles",
          business: "Advanced custom roles"
        },
        {
          title: "Team Projects",
          free: "✕",
          pro: "Up to 5",
          business: "Unlimited"
        }
      ]
    },
    {
      title: "Storage & Publishing",
      features: [
        {
          title: "Cloud Storage",
          free: "2GB",
          pro: "50GB",
          business: "500GB"
        },
        {
          title: "Direct Publishing",
          free: "2 platforms",
          pro: "All major platforms",
          business: "All platforms + scheduling"
        },
        {
          title: "Video Analytics",
          free: "Basic",
          pro: "Advanced",
          business: "Enterprise"
        },
        {
          title: "API Access",
          free: "✕",
          pro: "Limited",
          business: "Full access"
        },
        {
          title: "Scheduled Publishing",
          free: "✕",
          pro: "Basic",
          business: "Advanced with calendar"
        },
        {
          title: "Batch Processing",
          free: "✕",
          pro: "Up to 5 videos",
          business: "Unlimited"
        }
      ]
    },
    {
      title: "AI Features & Personalization",
      features: [
        {
          title: "AI Voice Generation",
          free: "2 voices",
          pro: "30+ voices",
          business: "100+ voices + custom voices"
        },
        {
          title: "AI Background Removal",
          free: "5 per month",
          pro: "Unlimited",
          business: "Unlimited with batch processing"
        },
        {
          title: "AI Scene Detection",
          free: "Basic",
          pro: "Advanced",
          business: "Professional"
        },
        {
          title: "AI Music Generation",
          free: "✕",
          pro: "✓",
          business: "✓ Custom mood profiles"
        },
        {
          title: "AI Video Enhancer",
          free: "✕",
          pro: "Basic enhancement",
          business: "Professional enhancement"
        },
        {
          title: "Personalized Thumbnails",
          free: "✕",
          pro: "AI-generated options",
          business: "Advanced A/B testing"
        }
      ]
    },
    {
      title: "Support & Training",
      features: [
        {
          title: "Support Channels",
          free: "Email",
          pro: "Email + Chat",
          business: "Email + Chat + Phone"
        },
        {
          title: "Response Time",
          free: "48 hours",
          pro: "24 hours",
          business: "4 hours"
        },
        {
          title: "Onboarding",
          free: "Self-service",
          pro: "Guided setup",
          business: "Dedicated onboarding specialist"
        },
        {
          title: "Training Resources",
          free: "Knowledge base",
          pro: "Tutorials + Webinars",
          business: "Custom training sessions"
        },
        {
          title: "Dedicated Account Manager",
          free: "✕",
          pro: "✕",
          business: "✓"
        },
        {
          title: "SLA",
          free: "✕",
          pro: "✕",
          business: "✓"
        }
      ]
    }
  ];

  // Features that are restricted in the free plan but available in Pro
  const restrictedFeatures = [
    "Advanced AI effects",
    "Brand kit integration",
    "Multi-platform optimization",
    "Bulk export capabilities",
    "API access"
  ];

  // Bonuses to add value to the offer
  const bonuses = [
    {
      title: "Video Marketing Blueprint",
      value: "$297",
      description: "Learn how to create videos that convert viewers into customers."
    },
    {
      title: "Viral Video Templates Pack",
      value: "$197",
      description: "10 exclusive templates proven to increase engagement and shares."
    },
    {
      title: "Social Media Calendar",
      value: "$97",
      description: "12-month content planning calendar with video ideas for every platform."
    }
  ];

  // State for expanded features section
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  
  // Effect for discount timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1;
        
        if (newSeconds >= 0) {
          return { ...prev, seconds: newSeconds };
        }
        
        const newMinutes = prev.minutes - 1;
        
        if (newMinutes >= 0) {
          return { ...prev, minutes: newMinutes, seconds: 59 };
        }
        
        const newHours = prev.hours - 1;
        
        if (newHours >= 0) {
          return { hours: newHours, minutes: 59, seconds: 59 };
        }
        
        clearInterval(interval);
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Get pricing based on billing cycle
  const getPrice = (plan) => {
    switch(billingCycle) {
      case 'monthly':
        return plan.price_monthly;
      case 'yearly':
        return plan.price_yearly;
      case 'lifetime':
        return plan.price_lifetime || (plan.price_yearly * 3.5); // Fallback if no lifetime price
      default:
        return plan.price_monthly;
    }
  };

  // Get the discount percentage
  const getDiscount = () => {
    switch(billingCycle) {
      case 'yearly':
        return 20;
      case 'lifetime':
        return 40;
      default:
        return 0;
    }
  };

  // Get the billing period text
  const getBillingText = () => {
    switch(billingCycle) {
      case 'monthly':
        return '/month';
      case 'yearly':
        return '/year';
      case 'lifetime':
        return ' one-time';
      default:
        return '/month';
    }
  };

  // Handle app selection
  const handleAppSelection = (appName: string, checked: boolean) => {
    setSelectedApps(prev => ({
      ...prev,
      [appName]: checked
    }));
  };

  // Calculate total selected apps and price
  const selectedCount = Object.values(selectedApps).filter(Boolean).length;
  const basePrice = billingCycle === 'yearly' ? 99 : billingCycle === 'monthly' ? 8.25 : 99 * 24;
  const discountRate = selectedCount >= 5 ? 0.3 : selectedCount >= 3 ? 0.2 : selectedCount >= 2 ? 0.1 : 0;
  const discountedPrice = basePrice * (1 - discountRate);
  const totalPrice = selectedCount * discountedPrice;

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="inline-block mb-3">
            <div className="bg-primary-500/20 text-primary-400 px-4 py-1.5 rounded-full text-sm font-semibold">
              SPECIAL OFFER PRICING
            </div>
          </div>
          
          <MagicSparkles minSparkles={3} maxSparkles={6} colors={['#6366f1', '#818cf8', '#f472b6', '#ec4899']}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 break-words">
              Choose Your <span className="text-primary-400">AI Apps</span> Today!
            </h2>
          </MagicSparkles>

          <p className="text-xl text-gray-300 mb-4 break-words">
            Select from 14 powerful AI apps at just $99/year each. Mix and match to build your perfect toolkit.
          </p>
          
          <div className="flex justify-center mt-4 mb-4">
            <div className="bg-primary-900/30 backdrop-blur-sm px-5 py-3 rounded-xl border border-primary-500/20 shadow-lg flex flex-col sm:flex-row items-center gap-3">
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-primary-400 font-semibold flex items-center"
              >
                <Clock className="h-5 w-5 mr-2 text-red-400" />
                <span>OFFER ENDS IN:</span>
              </motion.div>
              
              <div className="flex items-center space-x-2">
                <div className="bg-gray-800/80 px-3 py-1.5 rounded-md shadow-inner">
                  <div className="text-2xl font-mono font-bold text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/70 text-center">HOURS</div>
                </div>
                <div className="text-2xl font-bold text-white">:</div>
                <div className="bg-gray-800/80 px-3 py-1.5 rounded-md shadow-inner">
                  <div className="text-2xl font-mono font-bold text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/70 text-center">MINS</div>
                </div>
                <div className="text-2xl font-bold text-white">:</div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1 }
                  }}
                  className="bg-gray-800/80 px-3 py-1.5 rounded-md shadow-inner"
                >
                  <div className="text-2xl font-mono font-bold text-red-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/70 text-center">SECS</div>
                </motion.div>
              </div>
              
              <motion.div className="ml-0 sm:ml-3 text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded-full flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>347 people viewing this offer</span>
              </motion.div>
            </div>
          </div>
          
          {/* Price toggle */}
          <div className="flex justify-center mb-8 mt-8">
            <div className="bg-gray-800 p-1 rounded-full inline-flex">
              <motion.button
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'monthly' ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setBillingCycle('monthly')}
                whileHover={{ scale: billingCycle === 'monthly' ? 1.0 : 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Monthly
              </motion.button>
              <motion.button
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'yearly' ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setBillingCycle('yearly')}
                whileHover={{ scale: billingCycle === 'yearly' ? 1.0 : 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Yearly <span className="text-xs bg-green-500 text-white px-1 py-0.5 rounded-sm ml-1">-20%</span>
              </motion.button>
              <motion.button
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'lifetime' ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setBillingCycle('lifetime')}
                whileHover={{ scale: billingCycle === 'lifetime' ? 1.0 : 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Lifetime <span className="text-xs bg-pink-500 text-white px-1 py-0.5 rounded-sm ml-1">-40%</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* App Showcase Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              className="inline-block mb-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-primary-500/20 text-primary-400 px-4 py-1.5 rounded-full text-sm font-semibold">
                🎯 AI APPS SHOWCASE
              </div>
            </motion.div>

            <MagicSparkles minSparkles={3} maxSparkles={6} colors={['#6366f1', '#818cf8', '#f472b6', '#ec4899']}>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Choose from 14 Powerful AI Tools
              </h3>
            </MagicSparkles>

            <p className="text-gray-300 text-lg">
              $99/year per app • Mix and match to build your perfect toolkit
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 p-1 rounded-full inline-flex">
              {[
                { id: 'all', name: 'All Apps', count: 14 },
                { id: 'marketing', name: 'Marketing & Sales', count: 6 },
                { id: 'content', name: 'Content Creation', count: 4 },
                { id: 'productivity', name: 'Productivity', count: 4 }
              ].map((category) => (
                <motion.button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: selectedCategory === category.id ? 1.0 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.name} ({category.count})
                </motion.button>
              ))}
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allApps
              .filter(app => selectedCategory === 'all' ||
                (selectedCategory === 'marketing' && marketingApps.includes(app.name)) ||
                (selectedCategory === 'content' && contentApps.includes(app.name)) ||
                (selectedCategory === 'productivity' && productivityApps.includes(app.name))
              )
              .map((app, index) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`bg-gray-800/50 border rounded-xl overflow-hidden hover:bg-gray-800/80 transition-all duration-300 ${
                    selectedApps[app.name] ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-700 hover:border-primary-500/50'
                  }`}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl mb-2">
                        {getAppIcon(app.name)}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedApps[app.name] || false}
                        onChange={(e) => handleAppSelection(app.name, e.target.checked)}
                        className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                      />
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 break-words">
                      {app.name}
                    </h4>

                    <p className="text-gray-400 text-sm mb-4 break-words">
                      {getAppDescription(app.name)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-primary-400 font-bold">
                        $99/year
                      </div>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 underline"
                      >
                        Preview →
                      </a>
                    </div>

                    {selectedApps[app.name] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 text-center"
                      >
                        <span className="inline-flex items-center text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3 mr-1" />
                          Selected
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>


        {/* Selected Apps Summary */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-8 bg-gray-800 rounded-xl border border-primary-500/30 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your Selection</h3>
                <p className="text-gray-300">
                  {selectedCount} app{selectedCount > 1 ? 's' : ''} selected
                  {discountRate > 0 && (
                    <span className="text-green-400 ml-2">
                      ({(discountRate * 100).toFixed(0)}% discount applied)
                    </span>
                  )}
                </p>
                <div className="mt-2 text-sm text-gray-400">
                  {Object.entries(selectedApps).filter(([_, selected]) => selected).map(([appName]) => appName).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${totalPrice.toFixed(2)} {getBillingText()}
                </div>
                <div className="text-sm text-gray-400">
                  ${discountedPrice.toFixed(2)} per app
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Subscribe Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expanded Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-16"
        >
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="flex items-center justify-center w-full mb-6 text-primary-400 hover:text-primary-300"
          >
            <span className="mr-2">{showAllFeatures ? 'Hide' : 'Show'} Full Feature Comparison</span>
            <motion.div
              animate={{ rotate: showAllFeatures ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </button>
          
          <AnimatedFeatureTable 
            showAllFeatures={showAllFeatures} 
            featureCategories={featureCategories} 
          />
        </motion.div>
        
        {/* Features comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transform transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Feature Comparison</h3>
              <motion.button 
                className="text-gray-400 hover:text-white flex items-center"
                aria-label="Toggle feature comparison"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm mr-2">View all features</span>
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {restrictedFeatures.map((feature, i) => (
                  <motion.div 
                    key={i} 
                    className="grid grid-cols-8 gap-4 items-center py-2 border-b border-gray-800"
                    whileHover={{ 
                      backgroundColor: "rgba(31, 41, 55, 0.5)", 
                      borderRadius: "0.375rem",
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="col-span-4 text-gray-300 break-words">{feature}</div>
                    <div className="col-span-2 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <X className="h-5 w-5 text-gray-500 mx-auto" />
                      </motion.div>
                    </div>
                    <div className="col-span-2 text-center">
                      <motion.div
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: [0, 5, -5, 0],
                          color: "rgba(52, 211, 153, 1)" 
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="grid grid-cols-8 gap-4 items-center pt-2">
                  <div className="col-span-4"></div>
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-medium text-gray-400">Free</div>
                    <motion.a 
                      href="#signup-free" 
                      className="text-xs text-primary-400 hover:text-primary-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Sign Up
                    </motion.a>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-medium text-primary-400">Pro Plan</div>
                    <motion.a 
                      href="#checkout" 
                      className="text-xs text-primary-400 hover:text-primary-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Get Access
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Lifetime offer highlight */}
        {billingCycle === 'lifetime' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-primary-900/40 to-secondary-900/30 p-6 rounded-xl border border-primary-500/30"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="md:w-1/3 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-primary-900/50 rounded-full"
                >
                  <FileVideo className="h-16 w-16 text-primary-400" />
                </motion.div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-white mb-3">Why Choose Lifetime Access?</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Pay once, use forever – no more recurring charges</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Significant cost savings compared to yearly plans after 3 years</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Access to all current features and tools in your plan</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Free major updates for the lifetime of the product</span>
                  </li>
                </ul>
                <motion.a 
                  href="#lifetime-checkout" 
                  className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3 px-6 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Secure Lifetime Access Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ChevronDown className="ml-2 h-5 w-5 rotate-270" />
                  </motion.div>
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* FAQ mini section */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-400">Quick answers to common questions</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "How does the 14-day guarantee work?",
                answer: "If you're not completely satisfied with VideoRemix.vip within 14 days of purchase, simply email our support team and we'll issue a full refund, no questions asked."
              },
              {
                question: "Can I upgrade or downgrade my plan later?",
                answer: "Yes! You can upgrade to Pro at any time. You can also downgrade to the free plan if your needs change."
              },
              {
                question: "What happens after I purchase the lifetime plan?",
                answer: "After purchasing the lifetime plan, you'll have permanent access to all features included in that plan for the lifetime of VideoRemix.vip. You'll also receive all major updates to those features."
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  borderColor: "rgba(99, 102, 241, 0.4)",
                  transition: { duration: 0.2 }
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-5 font-medium cursor-pointer list-none">
                    <span className="text-white break-words">{item.question}</span>
                    <motion.div
                      animate={{ rotate: 0 }}
                      initial={{ rotate: 0 }}
                      variants={{
                        open: { rotate: 180 },
                        closed: { rotate: 0 }
                      }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                    </motion.div>
                  </summary>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="px-5 pb-5 pt-0"
                  >
                    <p className="text-gray-400 break-words">{item.answer}</p>
                  </motion.div>
                </details>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <motion.a 
              href="#faq" 
              className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              View all FAQs
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5,
                  repeatType: "loop"
                }}
              >
                <ChevronDown className="ml-1 h-4 w-4 rotate-270" />
              </motion.span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Animated feature table component
const AnimatedFeatureTable = ({ showAllFeatures, featureCategories }) => {
  if (!showAllFeatures) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-16"
    >
      <div className="px-6 py-4 bg-gray-800 text-white font-bold">
        Complete Feature Comparison
      </div>
      
      <div className="p-6">
        {featureCategories.map((category, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">
              {category.title}
            </h3>
            
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 text-gray-300 w-1/3">Feature</th>
                  <th className="text-center py-3 text-gray-300 w-1/5">Free</th>
                  <th className="text-center py-3 text-gray-300 w-1/5">Pro</th>
                  <th className="text-center py-3 text-gray-300 w-1/5">Business</th>
                </tr>
              </thead>
              <tbody>
                {category.features.map((feature, featureIndex) => (
                  <motion.tr 
                    key={featureIndex}
                    className="border-t border-gray-800"
                    whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}
                  >
                    <td className="py-3 text-white">{feature.title}</td>
                    <td className="py-3 text-center">
                      {feature.free === "✓" ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.free === "✕" ? (
                        <X className="h-5 w-5 text-gray-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400 text-sm">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {feature.pro === "✓" ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.pro === "✕" ? (
                        <X className="h-5 w-5 text-gray-600 mx-auto" />
                      ) : (
                        <span className="text-primary-400 text-sm font-medium">{feature.pro}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {feature.business === "✓" ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.business === "✕" ? (
                        <X className="h-5 w-5 text-gray-600 mx-auto" />
                      ) : (
                        <span className="text-primary-400 text-sm font-medium">{feature.business}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        
        <div className="flex items-center justify-center gap-8 mt-10">
          <a 
            href="#signup-free" 
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg"
          >
            Get Started
          </a>
          <a 
            href="#checkout" 
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
          >
            Get Pro
          </a>
          <a 
            href="#business" 
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingSection;