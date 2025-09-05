import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SparkleBackground from './components/SparkleBackground';
import SpecialHeader from './components/SpecialHeader';
import ScrollProgressBar from './components/ScrollProgressBar';
import CustomCursor from './components/CustomCursor';
import LiveActivityIndicator from './components/LiveActivityIndicator';
import AudioPlayer from './components/AudioPlayer';
import ErrorBoundary from './components/ErrorBoundary';
import AIAssistant from './components/AIAssistant';

// Lazy loaded components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AppPage = lazy(() => import('./pages/AppPage'));
const ToolsHubPage = lazy(() => import('./pages/ToolsHubPage')); // New Tools Hub Page

// Feature pages
const AIVideoCreatorPage = lazy(() => import('./pages/features/AIVideoCreatorPage'));
const AIEditingPage = lazy(() => import('./pages/features/AIEditingPage'));
const SmartTemplatesPage = lazy(() => import('./pages/features/SmartTemplatesPage'));
const ContentRepurposingPage = lazy(() => import('./pages/features/ContentRepurposingPage'));
const AutoCaptionsPage = lazy(() => import('./pages/features/AutoCaptionsPage'));
const CollaborationPage = lazy(() => import('./pages/features/CollaborationPage'));

// Generic pages
const FeatureListPage = lazy(() => import('./pages/FeatureListPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const SpecialFooter = lazy(() => import('./components/SpecialFooter'));

// Help Center pages
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const HelpArticlePage = lazy(() => import('./pages/HelpArticlePage'));

// Loading fallback component
const SectionLoader = () => (
  <div className="flex justify-center items-center py-20 text-white">
    <div className="relative">
      <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-primary-500 font-medium">Loading</span>
      </div>
    </div>
  </div>
);

function App() {
  // Detect mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Update document title with page section
  useEffect(() => {
    const updateTitle = () => {
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'home';
      
      for (const section of sections as NodeListOf<HTMLElement>) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop - 200 && 
            window.scrollY < sectionTop + sectionHeight - 200) {
          currentSection = section.id;
          break;
        }
      }
      
      document.title = `VideoRemix.io | ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`;
    };
    
    window.addEventListener('scroll', updateTitle);
    return () => window.removeEventListener('scroll', updateTitle);
  }, []);

  // Log and handle errors from error boundaries
  const handleError = (error: Error) => {
    console.log("App caught an error:", error.message);
    // In a production app, you might send this to an error tracking service
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Helmet>
        <title>VideoRemix.io - AI-Powered Video Creation & Editing</title>
        <meta name="description" content="Create, edit and remix videos with AI-powered tools. Transform your content with VideoRemix.io's easy-to-use platform." />
      </Helmet>
      
      {/* Scroll Progress Indicator */}
      <ScrollProgressBar />
      
      {/* Custom Cursor (desktop only) */}
      {!isMobile && !isTablet && <CustomCursor />}
      
      {/* Audio Feedback System */}
      <AudioPlayer />
      
      {/* Live Activity Indicator */}
      <LiveActivityIndicator />
      
      {/* AI Assistant */}
      <AIAssistant />
      
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <LandingPage isMobile={isMobile} isTablet={isTablet} />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />

        {/* Tools Hub Page */}
        <Route path="/tools" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <ToolsHubPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />

        {/* App Detail Pages */}
        <Route path="/app/:appId" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <AppPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        {/* Feature Landing Pages */}
        <Route path="/features/ai-video-creator" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <AIVideoCreatorPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/features/ai-editing" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <AIEditingPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/features/smart-templates" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <SmartTemplatesPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/features/content-repurposing" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <ContentRepurposingPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/features/auto-captions" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <AutoCaptionsPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/features/collaboration" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <CollaborationPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        {/* General Pages */}
        <Route path="/features" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <FeatureListPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/pricing" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <PricingPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/faq" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <FAQPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/about" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <AboutUsPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/contact" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <ContactPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/blog" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <BlogPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/blog/:postId" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <BlogPostPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        {/* Help Center Routes */}
        <Route path="/help" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <HelpCenterPage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
        
        <Route path="/help/:articleId" element={
          <ErrorBoundary onError={handleError}>
            <SparkleBackground>
              <SpecialHeader />
              <Suspense fallback={<SectionLoader />}>
                <HelpArticlePage />
                <SpecialFooter />
              </Suspense>
            </SparkleBackground>
          </ErrorBoundary>
        } />
      </Routes>
    </div>
  );
}

export default App;