import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, Shield, Clock, Star, ArrowRight, Sparkles, Award, Video } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { useMediaQuery } from 'react-responsive';
import useMeasure from 'react-use-measure';
import CountUp from 'react-countup';
import { Tilt } from 'react-tilt';
import { Link } from 'react-router-dom';
import MagicSparkles from './MagicSparkles';
import { useLandingPageContent } from '../context/LandingPageContext';

// Countdown Timer Component
const CountdownTimer: React.FC = () => {
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
        
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-md">
        <div className="text-2xl font-mono font-bold text-white">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-xs text-white/70 text-center">HOURS</div>
      </div>
      <div className="text-2xl font-bold text-white">:</div>
      <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-md">
        <div className="text-2xl font-mono font-bold text-white">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-xs text-white/70 text-center">MINS</div>
      </div>
      <div className="text-2xl font-bold text-white">:</div>
      <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-md">
        <div className="text-2xl font-mono font-bold text-white animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-white/70 text-center">SECS</div>
      </div>
    </div>
  );
};

// Video preview component
const VideoPreview = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update slider position based on mouse/touch position
  const startProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    
    setProgressWidth(0);
    
    progressRef.current = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev >= 100) {
          if (progressRef.current) {
            clearInterval(progressRef.current);
          }
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 50);
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      startProgress();
    } else if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };
  
  useEffect(() => {
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);
  
  // Convert progress to time format
  const progressToTime = (progress: number) => {
    const totalSeconds = 150; // 2:30 in seconds
    const currentSeconds = (progress / 100) * totalSeconds;
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Tilt 
      options={{ 
        max: 10, 
        scale: 1.05,
        speed: 1000,
        perspective: 1000
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative mt-10 max-w-4xl mx-auto z-10"
      >
        <div className="relative rounded-xl overflow-hidden border-4 border-white/10 shadow-2xl">
          {/* Video thumbnail with play button overlay */}
          <div className="aspect-video bg-gray-900 relative">
            <img 
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
              alt="Personalized Marketing Video Demo" 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Animated overlay effects */}
            {isPlaying && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/30 w-20 h-20 blur-2xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                    }}
                  />
                ))}
              </motion.div>
            )}
            
            {/* Personalization Elements Overlay */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-primary-400" />
              <span>Personalized Marketing</span>
            </div>
            
            {/* Play button */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.button
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
              >
                {/* Pulsing animation */}
                <motion.div
                  className="absolute -inset-4 rounded-full bg-primary-500/20 blur-md"
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0.5, 0, 0.5] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />

                <div className="bg-primary-600 hover:bg-primary-500 rounded-full p-5 relative">
                  <Play className={`h-8 w-8 text-white ${isPlaying ? 'opacity-0' : 'ml-1'}`} />
                  
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-4 w-4 bg-white rounded relative"
                    ></motion.div>
                  )}
                </div>
              </motion.button>
            </motion.div>
            
            {/* Video control bar mockup */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3 flex items-center">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary-500"
                  style={{ width: `${progressWidth}%` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${isPlaying ? progressWidth : 0}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-white text-xs ml-3 whitespace-nowrap">
                {progressToTime(progressWidth)} / 02:30
              </div>
            </div>
          </div>
          
          {/* Video reflection effect */}
          <div className="h-8 bg-gradient-to-b from-gray-900 to-transparent opacity-50 transform scale-y-[-1] relative">
            <div className="absolute inset-0 bg-gray-900/80"></div>
            <img 
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
              alt="" 
              className="w-full h-16 object-cover opacity-20 transform scale-y-[-1]"
            />
          </div>
        </div>
        
        {/* Video caption */}
        <motion.div 
          className="absolute -bottom-4 -right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          animate={isPlaying ? { 
            x: [0, -5, 0],
            boxShadow: ["0 10px 25px rgba(79, 70, 229, 0.2)", "0 10px 25px rgba(79, 70, 229, 0.4)", "0 10px 25px rgba(79, 70, 229, 0.2)"]
          } : {
            x: 0,
            boxShadow: "0 10px 25px rgba(79, 70, 229, 0.2)" 
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          See personalized marketing content in action
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-secondary-500 rounded-full blur-md opacity-70"></div>
        <div className="absolute -bottom-4 -right-20 w-16 h-16 bg-primary-500 rounded-full blur-xl opacity-40"></div>
        
        {/* Additional floating elements */}
        <motion.div
          className="absolute -top-8 right-1/4 bg-secondary-300/30 w-8 h-8 rounded-full blur-lg"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -left-10 top-1/3 bg-primary-300/30 w-12 h-12 rounded-full blur-lg"
          animate={{
            y: [-15, 5, -15],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5, 
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </Tilt>
  );
};

// Key benefits component
const KeyBenefits = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const benefits = [
    { icon: <Clock className="h-5 w-5 text-primary-400" />, text: "90% faster marketing creation" },
    { icon: <Shield className="h-5 w-5 text-primary-400" />, text: "Enterprise-grade security" },
    { icon: <Star className="h-5 w-5 text-primary-400" />, text: "Professional marketing results" },
    { icon: <Award className="h-5 w-5 text-primary-400" />, text: "350% higher conversions" }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="flex flex-wrap justify-center gap-4 mt-8 z-10 relative"
    >
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
          whileHover={{ scale: 1.1, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)" }}
          className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center transition-all border border-white/10 shadow-sm"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            className="mr-2"
          >
            {benefit.icon}
          </motion.div>
          <span className="text-white">{benefit.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Active user count with animation
const ActiveUsers = () => {
  const [countRef, { height }] = useMeasure();
  const [count, setCount] = useState(9721);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="mt-6 flex items-center justify-center z-10 relative"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 shadow-md">
        <div className="flex items-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              repeatType: "reverse"
            }}
          >
            <Video className="h-4 w-4 text-green-400 mr-2" />
          </motion.div>
          <div className="text-white text-sm">
            <span ref={countRef} className="font-bold">
              <CountUp 
                start={count - 5} 
                end={count} 
                duration={3} 
                separator="," 
              />
            </span> marketers using personalization now
            
            {/* Animated indicator dot */}
            <motion.span 
              className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full ml-1"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
      
      {/* Connection lines animation */}
      <AnimatePresence>
        {height > 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: -50 + (i * 50),
                  y: -height * 2
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  x: [-50 + (i * 50), 0, 50 - (i * 50)],
                  y: [-height * 2, -height/2, 0] 
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  repeatDelay: i * 1,
                }}
                className="absolute w-0.5 h-8 bg-gradient-to-b from-green-500/80 to-green-500/0 rounded-full"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Create First Video CTA section
const CreateFirstVideoCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="max-w-xl bg-gradient-to-r from-primary-600/20 to-primary-400/20 backdrop-blur-sm mx-auto mt-7 rounded-xl p-6 border border-primary-500/20"
    >
      <div className="flex items-center justify-center mb-3">
        <div className="bg-gradient-to-r from-primary-500 to-primary-400 p-2.5 rounded-full">
          <Video className="h-5 w-5 text-white" />
        </div>
      </div>
      <h3 className="text-center text-xl font-bold text-white mb-3">Create Your First Personalized Marketing Campaign</h3>
      <p className="text-center text-gray-300 mb-4">
        Launch your first personalized marketing campaign in minutes with our AI-powered personalization platform.
      </p>
      <div className="flex justify-center">
        <Link
          to="/help/create-first-video"
          className="flex items-center bg-white text-primary-600 hover:bg-gray-100 font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200"
        >
          <Video className="h-5 w-5 mr-2" />
          Start Personalizing Content
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

const SpecialHero: React.FC = () => {
  const { hero } = useLandingPageContent();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showCreateFirstVideo, setShowCreateFirstVideo] = useState(true);

  const testimonials = [
    {
      name: "David Chen",
      role: "Marketing Director",
      quote: "The personalization tools helped us achieve a 215% increase in marketing engagement and 3X more campaign leads.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150"
    },
    {
      name: "Sarah Wilson",
      role: "Digital Marketing Lead",
      quote: "I create custom marketing content for different audience segments in minutes. My conversion rates have doubled since using VideoRemix.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150"
    }
  ];

  const playVideo = () => {
    if (videoRef.current) {
      if (!isVideoPlaying) {
        videoRef.current.play().catch(() => {
          // Handle autoplay restrictions
          console.log('Video play was prevented by the browser');
        });
      } else {
        videoRef.current.pause();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Check if user has seen the Create First Video CTA before
  useEffect(() => {
    const hasSeenCTA = localStorage.getItem('hasSeenFirstVideoCTA');
    if (hasSeenCTA) {
      setShowCreateFirstVideo(false);
    } else {
      // After 1 minute, save that user has seen the CTA
      const timeout = setTimeout(() => {
        localStorage.setItem('hasSeenFirstVideoCTA', 'true');
      }, 60000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left mb-6"
            >
              <div className="mb-4 inline-flex items-center rounded-full bg-primary-600 px-3 py-1">
                <Award className="h-4 w-4 text-white mr-2" />
                <span className="text-sm font-medium text-white">PERSONALIZED MARKETING PLATFORM</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none md:leading-tight relative">
                Create Personalized Marketing Content That <span className="text-primary-400">Converts Your Audience</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Transform your marketing with AI-powered personalization that drives 3X higher conversions. Our 50+ marketing tools tailor every element to your specific audience segments.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "AI-powered personalization for marketing content and campaigns",
                  "50+ marketing personalization tools for marketers and businesses",
                  "Create personalized campaigns in minutes, not hours",
                  "Increase marketing ROI with audience-specific content"
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center"
                  >
                    <div className="mr-3 text-primary-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-white text-lg">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mb-8 relative">
                <MagicSparkles minSparkles={3} maxSparkles={6} speed="slow">
                  <div className="mb-4 inline-block px-4 py-1 bg-red-600 text-white font-medium rounded-md relative">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>LIMITED TIME OFFER:</span>
                    </div>
                  </div>
                </MagicSparkles>
                <CountdownTimer />
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mb-6"
              >
                <MagicSparkles minSparkles={2} maxSparkles={5} minSize={5} maxSize={10}>
                  <a 
                    href="#pricing" 
                    className="block w-full md:w-auto md:inline-block text-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-xl px-8 py-5 rounded-lg shadow-lg"
                  >
                    <span className="flex items-center justify-center">
                      START PERSONALIZING CONTENT
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </a>
                </MagicSparkles>
              </motion.div>

              <p className="text-gray-400 text-sm">
                <span className="text-yellow-400">⚡</span> No credit card required. 14-day money-back guarantee.
              </p>
            </motion.div>
            
            {/* Create First Personalized Video banner */}
            {showCreateFirstVideo && <CreateFirstVideoCTA />}
          </div>

          {/* Video Content - Right Side */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-1.5 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={hero?.background_image_url || "https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
                  alt="Personalized Marketing Demo"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <motion.button
                    onClick={playVideo}
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Pulsing animation */}
                    <motion.div
                      className="absolute -inset-4 rounded-full bg-primary-500/20 blur-md"
                      animate={{ 
                        scale: [1, 1.5, 1], 
                        opacity: [0.5, 0, 0.5] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    />

                    <MagicSparkles minSparkles={3} maxSparkles={6} speed="fast">
                      <div className="bg-primary-600 hover:bg-primary-500 rounded-full p-5 relative">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </MagicSparkles>
                  </motion.button>
                </div>

                <div className="absolute top-3 left-3 bg-primary-600/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white font-medium">
                  Personalized Marketing Demo
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                  2:35
                </div>

                {/* Hidden actual video that will play */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover opacity-0"
                  controls
                >
                  <source src="https://example.com/placeholder.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>

            {/* Testimonial mini slider */}
            <div className="mt-6 relative">
              <AnimatePresence mode="wait">
                {testimonials.map((testimonial, index) => (
                  activeTestimonial === index && (
                    <motion.div
                      key={testimonial.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-500"
                        />
                        <div className="ml-4">
                          <div className="text-white font-medium">{testimonial.name}</div>
                          <div className="text-gray-400 text-sm">{testimonial.role}</div>
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-gray-300 italic text-sm">
                        "{testimonial.quote}"
                      </p>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
              
              {/* Dots indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeTestimonial ? "bg-primary-500 w-6" : "bg-gray-500"
                    }`}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`View testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={12467} separator="," duration={2.5} />+
                </div>
                <div className="text-xs text-gray-400">Marketing Professionals</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <div className="text-xl font-bold text-white mt-1">4.9/5</div>
                <div className="text-xs text-gray-400">Marketing ROI Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 pt-6 border-t border-white/10"
        >
          <p className="text-center text-gray-400 text-sm mb-4">TRUSTED BY MARKETING TEAMS WORLDWIDE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["Microsoft", "Google", "YouTube", "Instagram", "Twitter"].map((brand, i) => (
              <motion.img 
                key={i}
                whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                src={[
                  "https://cdn.pixabay.com/photo/2013/02/12/09/07/microsoft-80658_960_720.png",
                  "https://cdn.pixabay.com/photo/2015/12/11/11/43/google-1088003_960_720.png",
                  "https://cdn.pixabay.com/photo/2017/03/30/17/42/youtube-2189041_960_720.png",
                  "https://cdn.pixabay.com/photo/2018/06/05/13/24/instagram-3456027_960_720.png",
                  "https://cdn.pixabay.com/photo/2017/06/22/14/23/twitter-2430933_960_720.png"
                ][i]} 
                alt={brand} 
                className="h-8 sm:h-10 brightness-[2]" 
              />
            ))}
          </div>
        </motion.div>
        
        {/* Key benefits icons */}
        <KeyBenefits />
        
        {/* Active users counter */}
        <ActiveUsers />
        
        {/* Video preview section */}
        <VideoPreview />
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, 10, 0]
          }}
          transition={{
            y: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "mirror",
            }
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <button 
            onClick={() => {
              const problemSection = document.getElementById('problem');
              if (problemSection) {
                problemSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors"
            aria-label="Scroll to content"
          >
            <span className="text-sm mb-2">Discover more</span>
            <ChevronDown className="h-6 w-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialHero;

// Assuming the CheckCircle component is missing from the imports, let's define it
const CheckCircle: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);