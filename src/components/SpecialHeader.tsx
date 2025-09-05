import React, { useState, useEffect } from 'react';
import { Video, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SpecialHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  // Featured tools for the dropdown
  const featuredTools = [
    { name: 'Personalized AI Image Generation', url: '/features/ai-image', description: 'Create AI-generated images', icon: <span className="text-lg">🎨</span> },
    { name: 'Personalized Video Generator', url: '/editor/:templateId', description: 'Generate personalized videos', icon: <span className="text-lg">🎬</span> },
    { name: 'Personalized Multimodal AI Creator', url: '/gemini-features', description: 'Create with text and visual inputs', icon: <span className="text-lg">🔮</span> },
    { name: 'Personalized Sales Proposal Generator', url: 'https://proposal-ai.videoremix.io', description: 'Create tailored proposals', icon: <span className="text-lg">📝</span> },
    { name: 'Personalized Sales Page Builder', url: 'https://sales-page-builder.videoremix.io', description: 'Build high-converting pages', icon: <span className="text-lg">🏗️</span> },
    { name: 'Personalized Client Research', url: '/features/client-research', description: 'Research clients automatically', icon: <span className="text-lg">🔍</span> }
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className={`fixed top-0 left-0 right-0 z-50 py-3 ${isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-opacity"
              ></motion.div>
              <Video className="h-8 w-8 text-white relative z-10" />
            </div>
            <div>
              <span className="text-xl font-bold text-white leading-none">VideoRemix.io</span>
              <div className="text-xs text-primary-300">SPECIAL OFFER</div>
            </div>
          </Link>
        </motion.div>

        {/* Navigation Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center space-x-1.5"
        >
          <Link to="/features" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium">
            Features
          </Link>

          {/* Tools Dropdown */}
          <div 
            className="relative" 
            onMouseEnter={() => handleDropdownToggle('tools')}
            onMouseLeave={closeDropdowns}
          >
            <button 
              className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium flex items-center"
              onClick={() => handleDropdownToggle('tools')}
            >
              Tools <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeDropdown === 'tools' && (
              <div className="absolute left-0 mt-1 w-[320px] bg-black/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-4">
                  <h3 className="text-primary-400 font-medium text-sm mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" /> Featured Tools
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {featuredTools.map((tool, index) => (
                      <a 
                        key={index}
                        href={tool.url}
                        className="block p-2 hover:bg-gray-800 rounded text-white transition-colors group"
                      >
                        <div className="flex items-center mb-1">
                          <div className="mr-2">{tool.icon}</div>
                          <span className="font-medium group-hover:text-primary-400 transition-colors text-sm">{tool.name}</span>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-1">{tool.description}</p>
                      </a>
                    ))}
                  </div>
                  
                  <Link 
                    to="/tools" 
                    className="block text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors mt-2"
                  >
                    <span className="flex items-center justify-center">
                      Browse All Tools
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/pricing" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium">
            Pricing
          </Link>
          <Link to="/faq" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium">
            FAQ
          </Link>
          <Link to="/help" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium">
            Help Center
          </Link>
          <motion.Link 
            to="/get-started" 
            className="ml-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 px-4 py-2 rounded-full text-sm font-medium text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GET ACCESS NOW
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block ml-1"
            >
              <ChevronDown className="h-4 w-4 -rotate-90 inline-block" />
            </motion.div>
          </motion.Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black overflow-hidden"
          >
            <div className="container mx-auto px-4 py-2 space-y-1">
              <Link to="/features" className="block text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Features
              </Link>
              
              {/* Mobile Tools Dropdown */}
              <div>
                <button 
                  className="flex justify-between items-center w-full text-white hover:bg-gray-800 px-3 py-2 rounded-md"
                  onClick={() => handleDropdownToggle('mobile-tools')}
                >
                  <span>Tools</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'mobile-tools' ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'mobile-tools' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2 px-4 bg-gray-900 rounded-md mt-1 mb-2 space-y-2">
                        {featuredTools.map((tool, index) => (
                          <a 
                            key={index}
                            href={tool.url}
                            className="block text-white hover:bg-gray-800 px-2 py-2 rounded text-sm"
                          >
                            <div className="flex items-center">
                              <div className="mr-2">{tool.icon}</div>
                              <span>{tool.name}</span>
                            </div>
                          </a>
                        ))}
                        
                        <Link 
                          to="/tools" 
                          className="block text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors mt-2"
                        >
                          Browse All Tools
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link to="/pricing" className="block text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Pricing
              </Link>
              <Link to="/faq" className="block text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                FAQ
              </Link>
              <Link to="/help" className="block text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Help Center
              </Link>
              <Link to="/get-started" className="block text-white bg-primary-600 hover:bg-primary-700 px-3 py-2 rounded-md mt-2">
                GET ACCESS NOW
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SpecialHeader;