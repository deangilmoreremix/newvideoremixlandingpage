import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, X, ChevronDown, ChevronRight, ArrowRight, MessageSquare, HelpCircle, Mail, Video, Sparkles, Clock, Users, DollarSign, Laptop, Shield, Globe, Zap, LayoutTemplate, FileText, Database, Play, PanelTop } from 'lucide-react';
import MagicSparkles from '../components/MagicSparkles';

// Define FAQ categories
const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: <Play className="h-5 w-5" /> },
  { id: 'accounts', name: 'Accounts & Billing', icon: <DollarSign className="h-5 w-5" /> },
  { id: 'features', name: 'Features & Capabilities', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'technical', name: 'Technical Questions', icon: <Laptop className="h-5 w-5" /> },
  { id: 'collaboration', name: 'Collaboration', icon: <Users className="h-5 w-5" /> },
  { id: 'security', name: 'Privacy & Security', icon: <Shield className="h-5 w-5" /> },
  { id: 'ai', name: 'AI Features', icon: <Zap className="h-5 w-5" /> },
  { id: 'publishing', name: 'Exporting & Publishing', icon: <PanelTop className="h-5 w-5" /> },
  { id: 'templates', name: 'Templates & Content', icon: <LayoutTemplate className="h-5 w-5" /> },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: <HelpCircle className="h-5 w-5" /> }
];

// Comprehensive FAQ data with categories
const faqData = [
  // Getting Started
  {
    question: "What is VideoRemix.vip?",
    answer: "VideoRemix.vip is an AI-powered marketing personalization platform offering 14 specialized apps at $99/year each. Choose any combination of tools to create personalized marketing content, images, and campaigns that drive results.",
    category: "getting-started"
  },
  {
    question: "How does VideoRemix.vip work?",
    answer: "Each app uses artificial intelligence to automate specific marketing tasks. Upload your content, select your preferences, and our AI handles the technical work. You can combine multiple apps for comprehensive marketing automation.",
    category: "getting-started"
  },
  {
    question: "How do I choose which apps I need?",
    answer: "Start with one app that addresses your most pressing need, then add more as your marketing strategy grows. Each app costs $99/year and can be added or removed anytime. Our sales team can help you select the right combination.",
    category: "getting-started"
  },
  {
    question: "Do I need technical skills to use VideoRemix.vip?",
    answer: "Not at all! Our apps are designed for marketers, business owners, and content creators with zero technical experience. Each app includes intuitive interfaces and AI that handles complex tasks automatically.",
    category: "getting-started"
  },
  
  // Accounts & Billing
  {
    question: "How much does VideoRemix.vip cost?",
    answer: "Each AI app costs $99/year. You can subscribe to one app or multiple apps based on your needs. Annual billing provides the best value, but we also offer flexibility for growing businesses.",
    category: "accounts"
  },
  {
    question: "Can I change my app selection later?",
    answer: "Absolutely! You can add or remove apps from your subscription at any time through your account dashboard. Changes take effect at the start of your next billing cycle, ensuring you only pay for what you need.",
    category: "accounts"
  },
  {
    question: "How does the 14-day money-back guarantee work?",
    answer: "If you're not completely satisfied with any VideoRemix.vip app within 14 days of purchase, contact our support team for a full refund. No questions asked. This applies to first-time purchases of any app.",
    category: "accounts"
  },
  {
    question: "Do you offer team or enterprise pricing?",
    answer: "Yes! For teams needing multiple apps or enterprise solutions, we offer custom pricing and features. Contact our sales team to discuss volume discounts and tailored solutions for your organization.",
    category: "accounts"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay. For Enterprise customers, we can arrange invoicing and purchase orders.",
    category: "accounts"
  },

  // Features & Capabilities
  {
    question: "What makes VideoRemix.vip different from other AI tools?",
    answer: "Unlike generic AI platforms, VideoRemix.vip offers specialized apps designed specifically for marketing tasks. Each app is optimized for particular use cases, providing better results than general-purpose AI tools.",
    category: "features"
  },
  {
    question: "Can I use multiple apps together?",
    answer: "Yes! Many users combine apps for comprehensive marketing automation. For example, you might use our content creation app with our personalization app for complete campaign automation.",
    category: "features"
  },
  {
    question: "Is there a limit to how many apps I can subscribe to?",
    answer: "No limits! Subscribe to as many or as few apps as you need. Each app operates independently, so you can scale your AI toolkit as your business grows.",
    category: "features"
  },
  {
    question: "Do apps integrate with my existing tools?",
    answer: "Most apps include API access and integrations with popular marketing platforms. Contact our support team to discuss specific integration needs for your tech stack.",
    category: "features"
  },

  // Technical Questions
  {
    question: "Do I need an internet connection to use the apps?",
    answer: "Yes, VideoRemix.vip apps are cloud-based and require an internet connection. This enables powerful AI processing and ensures your apps are always up-to-date with the latest features.",
    category: "technical"
  },
  {
    question: "What are the minimum system requirements?",
    answer: "Any modern computer with a web browser and internet connection. We recommend Chrome or Firefox for optimal performance. No special hardware required.",
    category: "technical"
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All data is encrypted and stored securely. We comply with GDPR, CCPA, and other privacy regulations. Your marketing data and AI-generated content remain private and secure.",
    category: "technical"
  },

  // Collaboration
  {
    question: "Can multiple people work on the same video project?",
    answer: "Yes, our Pro and Business plans include collaboration features. Multiple team members can work on the same project simultaneously, leave comments, and track changes. Business plans offer additional team management features like role-based permissions and approval workflows.",
    category: "collaboration"
  },
  {
    question: "How do I share my projects with team members?",
    answer: "In your project dashboard, simply click the 'Share' button and enter the email addresses of team members you want to collaborate with. You can set permission levels (viewer, editor, admin) for each collaborator. They'll receive an email invitation to join the project.",
    category: "collaboration"
  },
  {
    question: "Can I control what team members can do in my projects?",
    answer: "Absolutely. Business plans offer granular permission controls. You can set team members as Viewers (can only view and comment), Editors (can make changes but not delete or export), or Admins (full control including export and deletion). You can also lock specific elements of a video to prevent changes.",
    category: "collaboration"
  },
  {
    question: "Is there a version history for collaborative projects?",
    answer: "Yes, all projects maintain a complete version history. You can view previous versions, see who made which changes, and restore any past version if needed. This ensures you never lose work and can always track the evolution of your projects, even with multiple collaborators.",
    category: "collaboration"
  },
  {
    question: "How does the approval workflow feature work?",
    answer: "Business plans include customizable approval workflows. You can designate specific team members as approvers and set up sequential approval chains (e.g., first design team approval, then marketing, then client). Each approver receives notifications when it's their turn to review, and the project maintains a complete approval audit trail.",
    category: "collaboration"
  },

  // Privacy & Security
  {
    question: "How secure is my content on VideoRemix.vip?",
    answer: "We take security extremely seriously. All content is encrypted both in transit and at rest using bank-grade encryption. Our infrastructure is hosted on secure cloud providers with SOC 2 Type II compliance. We implement strict access controls, regular security audits, and follow security best practices across our entire platform.",
    category: "security"
  },
  {
    question: "Who owns the videos I create with VideoRemix.vip?",
    answer: "You retain full ownership of all content you create with VideoRemix.vip. We do not claim any rights to your videos or the assets you upload. You're free to use your videos for any purpose aligned with our terms of service.",
    category: "security"
  },
  {
    question: "Do you share my data with third parties?",
    answer: "We never sell your personal data or content to third parties. We do work with select service providers (like cloud storage and payment processors) who need limited access to provide the services you use. All such providers are bound by strict confidentiality agreements and data protection requirements. See our privacy policy for complete details.",
    category: "security"
  },
  {
    question: "Can I use VideoRemix.vip in compliance with GDPR/CCPA/HIPAA?",
    answer: "Yes. VideoRemix.vip is compliant with GDPR and CCPA requirements. For HIPAA compliance, our Business Associate Agreement (BAA) is available for Enterprise customers. We provide the tools and documentation needed to use our platform in a compliant manner, though ultimate compliance responsibility remains with your organization.",
    category: "security"
  },
  {
    question: "How long do you retain my data and content?",
    answer: "Active account content is stored indefinitely while your account remains active. If you delete specific content, it's removed from our active systems immediately and from backups within 30 days. If you cancel your account, you have a 30-day window to download your content before it's permanently deleted.",
    category: "security"
  },
  {
    question: "Can I request my data to be deleted?",
    answer: "Yes, you can request deletion of your account and associated data at any time through your account settings or by contacting our support team. Upon request, we will delete your personal information and content in accordance with applicable laws and our data retention policy.",
    category: "security"
  },

  // AI Features
  {
    question: "How accurate is the AI in each app?",
    answer: "Each app is trained on extensive datasets specific to its marketing domain. Accuracy varies by use case but typically ranges from 95-99% for well-defined tasks. Our AI continuously learns and improves.",
    category: "ai"
  },
  {
    question: "Can I customize how the AI works?",
    answer: "Yes! Each app offers customization options. You can set preferences, upload brand guidelines, and provide feedback to improve AI performance for your specific needs.",
    category: "ai"
  },
  {
    question: "Will AI replace my marketing team?",
    answer: "VideoRemix.vip AI enhances human creativity rather than replacing it. Our apps handle repetitive tasks and provide intelligent suggestions, freeing your team for strategic work.",
    category: "ai"
  },

  // Exporting & Publishing
  {
    question: "How do I export my videos?",
    answer: "Exporting videos is simple. Once you've finished editing, click the 'Export' button in the top right corner. You can choose from various quality settings (SD to 4K), file formats, and even directly publish to social media platforms.",
    category: "publishing"
  },
  {
    question: "What export formats are available?",
    answer: "VideoRemix.vip supports exporting to all major video formats including MP4, MOV, and WebM. You can select various quality presets optimized for different uses (web, social media, professional) or customize settings like bitrate, frame rate, and compression.",
    category: "publishing"
  },
  {
    question: "Can I export videos for specific social platforms?",
    answer: "Yes! We offer one-click optimization for all major social platforms including YouTube, Instagram, TikTok, Facebook, Twitter, and LinkedIn. This automatically adjusts aspect ratio, format, compression, and other settings to match each platform's requirements and best practices.",
    category: "publishing"
  },
  {
    question: "Can I publish directly to social media?",
    answer: "Yes, Pro and Business plans allow direct publishing to YouTube, Facebook, Instagram, Twitter, TikTok, and LinkedIn. After connecting your social accounts in the dashboard, you can publish videos directly without downloading and re-uploading them.",
    category: "publishing"
  },
  {
    question: "How long does exporting take?",
    answer: "Export times depend on video length, resolution, and current system load. Most videos are ready in seconds to a few minutes. Our cloud-based rendering means you don't have to keep your browser open during processing—you'll receive an email notification when your export is complete.",
    category: "publishing"
  },
  {
    question: "Are there any limitations on exports?",
    answer: "Free accounts can export up to 5 videos per month at 720p resolution with a watermark. Pro accounts have unlimited exports up to 4K resolution without watermarks. Business accounts additionally get priority rendering for faster exports during peak times.",
    category: "publishing"
  },
  {
    question: "Can I schedule posts to social media?",
    answer: "Yes, Business plans include social media scheduling features. You can create a publishing calendar, schedule posts for optimal times, and manage your content distribution across multiple platforms from a single dashboard.",
    category: "publishing"
  },

  // Templates & Content
  {
    question: "How many templates are available?",
    answer: "VideoRemix.vip offers 500+ professionally designed templates across dozens of categories including social media, marketing, education, real estate, e-commerce, and more. We add new templates weekly based on current trends and user requests.",
    category: "templates"
  },
  {
    question: "Can I create my own templates?",
    answer: "Yes, Pro and Business users can save any project as a custom template for future use. This is especially useful for creating consistent branded videos or establishing a template library for your team or organization.",
    category: "templates"
  },
  {
    question: "Can I use stock footage and music from VideoRemix.vip in my videos?",
    answer: "Yes, VideoRemix.vip includes access to a vast library of royalty-free stock footage, images, and music that you can use in your videos. All stock content is licensed for commercial use, so you can safely use it in both personal and business projects without attribution.",
    category: "templates"
  },
  {
    question: "Are there industry-specific templates available?",
    answer: "Absolutely! We offer specialized templates for real estate, e-commerce, education, fitness, restaurants, technology, non-profits, finance, healthcare, and many other industries. Each template is designed with industry-specific best practices in mind.",
    category: "templates"
  },
  {
    question: "Can templates be customized to match my brand?",
    answer: "Yes, all templates are fully customizable. You can change colors, fonts, layouts, transitions, timing, and replace any media elements with your own. Pro and Business users can also save brand kits to quickly apply consistent branding to any template.",
    category: "templates"
  },
  {
    question: "How often are new templates added?",
    answer: "We add 15-20 new templates each month, focusing on current design trends, seasonal themes, and specific user requests. Pro and Business users get early access to all new templates.",
    category: "templates"
  },

  // Troubleshooting
  {
    question: "My video is processing for a long time. What should I do?",
    answer: "Most videos process within minutes, but larger files or complex projects can take longer. If processing exceeds 30 minutes, try refreshing the page or contact support. For faster processing, consider breaking very long videos into smaller segments or reducing resolution during initial edits.",
    category: "troubleshooting"
  },
  {
    question: "Why does my exported video look pixelated?",
    answer: "Pixelation usually results from exporting at a lower resolution than optimal or from heavily compressed source footage. Try exporting at a higher quality setting, or if using the free plan, upgrade to access higher resolution exports. If your source footage is low quality, our AI enhancement feature (Pro plan) can help improve visual clarity.",
    category: "troubleshooting"
  },
  {
    question: "The video playback is stuttering in the editor. How can I fix this?",
    answer: "Editor playback performance depends on your internet connection and computer specs. Try enabling the 'Performance Mode' in settings, which uses lower resolution previews while editing. Clearing your browser cache, closing other tabs, and using Chrome or Firefox can also improve performance.",
    category: "troubleshooting"
  },
  {
    question: "Why are my uploads failing?",
    answer: "Upload issues are usually related to file size, format, or internet connectivity. Make sure your file is in a supported format, check your internet connection stability, and try breaking very large files into smaller segments. If problems persist, try our desktop uploader tool which has better handling for large files and unstable connections.",
    category: "troubleshooting"
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer: "Click the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email. Be sure to check your spam folder if you don't see the reset email. Password reset links expire after 24 hours for security reasons.",
    category: "troubleshooting"
  },
  {
    question: "My problem isn't listed here. How do I get help?",
    answer: "Our support team is ready to help! For technical issues, please visit our Help Center for detailed guides or contact support directly through the chat icon in the bottom right corner of the app. You can also email support@videoremix.vip with details about your issue. Pro and Business users receive priority support with faster response times.",
    category: "troubleshooting"
  }
];

// Frequently searched questions
const popularSearches = [
  "How do I get started",
  "Which apps do I need",
  "App pricing and billing",
  "AI accuracy and customization",
  "Security and data privacy"
];

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [filteredFaqs, setFilteredFaqs] = useState(faqData.filter(faq => faq.category === 'getting-started'));
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Effect for handling search and category filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If no search query, filter by active category
      setFilteredFaqs(
        activeCategory === 'all' 
          ? faqData 
          : faqData.filter(faq => faq.category === activeCategory)
      );
    } else {
      // If there's a search query, filter by both search and category
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredFaqs(
        faqData.filter(faq => {
          const matchesSearch = 
            faq.question.toLowerCase().includes(lowercaseQuery) ||
            faq.answer.toLowerCase().includes(lowercaseQuery);
          const matchesCategory = 
            activeCategory === 'all' || 
            faq.category === activeCategory;
          
          return matchesSearch && matchesCategory;
        })
      );
    }
  }, [searchQuery, activeCategory]);
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenQuestion(null);
  };
  
  // Handle question toggle
  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOpenQuestion(null);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Handle search popular question
  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | VideoRemix.vip</title>
        <meta 
          name="description" 
          content="Find answers to your questions about VideoRemix.vip's AI-powered video creation platform. Learn about features, pricing, technical requirements, and more." 
        />
      </Helmet>

      <main className="pt-32 pb-20">
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <MagicSparkles minSparkles={5} maxSparkles={8}>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Frequently Asked Questions
                  </h1>
                </MagicSparkles>
                
                <p className="text-xl text-gray-300 mb-8">
                  Find answers to common questions about VideoRemix.vip's features, pricing, and capabilities.
                </p>
              </motion.div>
              
              {/* Search input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto relative mb-12"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    ref={searchInputRef}
                    className="bg-gray-800/80 backdrop-blur-sm w-full pl-12 pr-14 py-4 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button 
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                      onClick={clearSearch}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </motion.div>
              
              {/* Popular searches */}
              {!searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-8"
                >
                  <p className="text-gray-400 mb-3">Popular searches:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularSearches.map((query, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePopularSearch(query)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm transition-colors border border-gray-700"
                      >
                        {query}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Category sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-700 sticky top-28">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    FAQ Categories
                  </h2>
                  
                  <nav className="space-y-1">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
                        activeCategory === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Sparkles className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>All Questions</span>
                      {activeCategory === 'all' && (
                        <ChevronRight className="h-5 w-5 ml-auto" />
                      )}
                    </button>
                    
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
                          activeCategory === category.id
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        {React.cloneElement(category.icon, { 
                          className: "h-5 w-5 mr-3 flex-shrink-0" 
                        })}
                        <span>{category.name}</span>
                        {activeCategory === category.id && (
                          <ChevronRight className="h-5 w-5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </nav>
                  
                  {/* Contact support */}
                  <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <h3 className="font-semibold text-white mb-2">Can't find your answer?</h3>
                    <p className="text-gray-300 text-sm mb-4">Our support team is here to help with any questions you might have.</p>
                    <a 
                      href="/contact" 
                      className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
              
              {/* FAQ listings */}
              <div className="lg:col-span-2">
                {searchQuery && (
                  <div className="mb-6 text-white">
                    <p className="text-lg">
                      <span className="text-gray-400">Search results for: </span>
                      <span className="font-medium">"{searchQuery}"</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
                    </p>
                  </div>
                )}
                
                {!searchQuery && activeCategory !== 'all' && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <p className="text-gray-300">
                      {activeCategory === 'getting-started' && "Everything you need to know to get up and running with VideoRemix.vip."}
                      {activeCategory === 'accounts' && "Information about accounts, subscriptions, billing, and payments."}
                      {activeCategory === 'features' && "Learn about the key features and capabilities of our platform."}
                      {activeCategory === 'technical' && "Technical specifications and requirements for using VideoRemix.vip."}
                      {activeCategory === 'collaboration' && "How to work with team members and clients on video projects."}
                      {activeCategory === 'security' && "Details about our privacy practices and security measures."}
                      {activeCategory === 'ai' && "Learn how our AI-powered features work to enhance your videos."}
                      {activeCategory === 'publishing' && "Information about exporting, saving, and sharing your videos."}
                      {activeCategory === 'templates' && "All about our templates library and content assets."}
                      {activeCategory === 'troubleshooting' && "Solutions to common issues and technical problems."}
                    </p>
                  </div>
                )}
                
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {filteredFaqs.map((faq, index) => (
                        <motion.div
                          key={`${faq.question}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-sm"
                        >
                          <button
                            className="flex justify-between items-center w-full p-5 text-left"
                            onClick={() => toggleQuestion(index)}
                            aria-expanded={openQuestion === index}
                          >
                            <h3 className="text-lg font-medium text-white pr-10 break-words">{faq.question}</h3>
                            <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-colors duration-200 ${
                              openQuestion === index ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-700 text-gray-400'
                            }`}>
                              <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${
                                openQuestion === index ? 'transform rotate-180' : ''
                              }`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {openQuestion === index && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-5 pb-5 border-t border-gray-700 pt-4">
                                  <p className="text-gray-300 whitespace-pre-line break-words">
                                    {faq.answer}
                                  </p>
                                  
                                  {/* Category badge */}
                                  <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                                    <span className="inline-flex items-center bg-gray-700/50 px-3 py-1 rounded-full text-xs text-gray-300">
                                      {categories.find(c => c.id === faq.category)?.icon}
                                      <span className="ml-1">
                                        {categories.find(c => c.id === faq.category)?.name || faq.category}
                                      </span>
                                    </span>
                                    
                                    {/* Helpful buttons */}
                                    <div className="flex space-x-2">
                                      <button className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded-lg transition-colors hover:bg-gray-700/50">
                                        Was this helpful?
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700"
                  >
                    <div className="inline-block mb-4">
                      <Search className="h-12 w-12 text-gray-500 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-gray-400 mb-6">We couldn't find any FAQs matching your search.</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={clearSearch}
                        className="text-primary-400 hover:text-primary-300 font-medium"
                      >
                        Clear search
                      </button>
                      <a 
                        href="/contact" 
                        className="text-primary-400 hover:text-primary-300 font-medium"
                      >
                        Contact support
                      </a>
                    </div>
                  </motion.div>
                )}
                
                {/* Contact section at the bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="mt-16 bg-gradient-to-br from-primary-900/30 to-primary-700/30 rounded-xl p-8 border border-primary-500/30"
                >
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="mb-6 md:mb-0 md:mr-8">
                      <div className="bg-primary-500/20 p-4 rounded-full">
                        <HelpCircle className="h-8 w-8 text-primary-400" />
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left mb-6 md:mb-0 md:flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
                      <p className="text-gray-300">Our support team is here to help you with any questions or issues.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.a
                        href="/contact"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                      >
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Contact Support
                      </motion.a>
                      
                      <motion.a
                        href="mailto:support@videoremix.vip"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center border border-gray-700"
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Email Us
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Additional self-help resources */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-16 max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white text-center mb-8">Additional Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Video Tutorials",
                    description: "Watch step-by-step video guides on using VideoRemix.vip's features",
                    icon: <Video className="h-8 w-8 text-primary-400" />,
                    link: "/tutorials"
                  },
                  {
                    title: "Help Center",
                    description: "Browse our comprehensive knowledge base articles and guides",
                    icon: <FileText className="h-8 w-8 text-primary-400" />,
                    link: "/help-center"
                  },
                  {
                    title: "Community Forum",
                    description: "Connect with other users to share tips and get inspiration",
                    icon: <Users className="h-8 w-8 text-primary-400" />,
                    link: "/community"
                  }
                ].map((resource, index) => (
                  <motion.a
                    key={index}
                    href={resource.link}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500/30 transition-colors flex flex-col h-full"
                  >
                    <div className="bg-primary-900/30 p-3 rounded-lg inline-block mb-4">
                      {resource.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                    <p className="text-gray-300 mb-6">{resource.description}</p>
                    <div className="mt-auto">
                      <span className="text-primary-400 font-medium flex items-center">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
            
            {/* Product features highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-20 text-center"
            >
              <MagicSparkles minSparkles={3} maxSparkles={6}>
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Experience VideoRemix.vip?</h2>
              </MagicSparkles>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Create professional videos in minutes with our AI-powered platform.
              </p>
              
              <motion.a
                href="/get-started"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold px-8 py-4 rounded-lg shadow-lg shadow-primary-600/20"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>
              
              {/* Key features */}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                {[
                  { icon: <Zap className="h-4 w-4" />, text: "AI-powered editing" },
                  { icon: <Clock className="h-4 w-4" />, text: "Save 90% of editing time" },
                  { icon: <Video className="h-4 w-4" />, text: "Professional templates" },
                  { icon: <Database className="h-4 w-4" />, text: "Cloud storage" },
                  { icon: <Users className="h-4 w-4" />, text: "Team collaboration" },
                  { icon: <Globe className="h-4 w-4" />, text: "Multi-language support" }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 flex items-center"
                  >
                    <div className="text-primary-400 mr-2 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default FAQPage;