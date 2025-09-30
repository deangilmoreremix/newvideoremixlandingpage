import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Share2, 
  Printer,
  Play,
  ArrowRight,
  MessageSquare,
  Video as VideoIcon,
  BookOpen,
  HelpCircle
} from 'lucide-react';

// Mock article data - in a real app this would come from an API or CMS
const articles = [
  {
    id: 'what-is-videoremix',
    title: 'What is VideoRemix.vip?',
    excerpt: 'An introduction to VideoRemix.vip and how it can transform your video creation process.',
    category: 'getting-started',
    categoryName: 'Getting Started',
    reading_time: '3 min read',
    last_updated: 'May 15, 2025',
    author: 'VideoRemix Team',
    content: `
      <h2>Introduction to VideoRemix.vip</h2>
      <p>VideoRemix.vip is an AI-powered video creation and editing platform designed to make professional video production accessible to everyone. Whether you're a content creator, marketer, educator, or business owner, our platform provides the tools you need to create stunning videos without technical expertise.</p>
      
      <h2>Key Features</h2>
      <p>VideoRemix.vip combines several powerful capabilities into one intuitive platform:</p>
      
      <h3>AI-Powered Video Creation</h3>
      <p>Our advanced artificial intelligence enables you to generate professional videos from simple text prompts, templates, or raw footage. The AI analyzes your content, selects appropriate visuals, and applies professional editing techniques automatically.</p>
      
      <h3>Intuitive Editing Tools</h3>
      <p>No technical skills required! Our drag-and-drop interface and simplified controls make video editing accessible to everyone. Complex tasks like color correction, audio enhancement, and scene transitions are handled automatically or through simple controls.</p>
      
      <h3>Professional Templates</h3>
      <p>Choose from hundreds of professionally designed templates for any industry or purpose. Each template can be fully customized to match your brand and content needs.</p>
      
      <h3>Content Repurposing</h3>
      <p>Easily transform long-form videos into short clips optimized for social media and other platforms. Our AI identifies the most engaging segments and creates perfectly formatted versions for each platform.</p>
      
      <h3>Collaboration Tools</h3>
      <p>Work together with team members in real-time, share feedback, and manage approval workflows efficiently, regardless of location.</p>
      
      <h2>Who is VideoRemix.vip For?</h2>
      <p>Our platform is designed to serve a wide range of users:</p>
      
      <ul>
        <li><strong>Content Creators:</strong> YouTubers, social media influencers, and digital content producers who need to create engaging videos consistently.</li>
        <li><strong>Marketing Teams:</strong> Create product demonstrations, advertisements, and promotional content with professional quality.</li>
        <li><strong>Educators:</strong> Develop engaging instructional videos and learning materials for students.</li>
        <li><strong>Small Business Owners:</strong> Produce professional marketing videos without outsourcing or hiring specialists.</li>
        <li><strong>Corporate Communications:</strong> Create internal communications, training materials, and company announcements.</li>
      </ul>
      
      <h2>Benefits of Using VideoRemix.vip</h2>
      
      <h3>Time Savings</h3>
      <p>Reduce video production time by up to 90% compared to traditional methods. What used to take days can now be accomplished in minutes or hours.</p>
      
      <h3>Cost Efficiency</h3>
      <p>Eliminate the need for expensive software subscriptions, specialized hardware, or outsourced video production services.</p>
      
      <h3>Professional Quality</h3>
      <p>Create videos that look like they were produced by a professional studio, regardless of your experience level.</p>
      
      <h3>Consistent Output</h3>
      <p>Maintain visual consistency across all your videos with templates and brand kits that ensure your content always looks polished and on-brand.</p>
      
      <h2>Getting Started</h2>
      <p>Ready to begin creating videos with VideoRemix.vip? Check out our <a href="/help/create-first-video">Creating Your First Video</a> guide to get started quickly.</p>
    `,
    related_articles: [
      'create-first-video', 
      'account-setup', 
      'navigating-dashboard'
    ],
    tags: ['introduction', 'overview', 'basics'],
    video_tutorial: 'https://example.com/tutorials/intro-to-videoremix',
    toc: [
      { id: 'introduction-to-videoremix-io', title: 'Introduction to VideoRemix.vip', level: 2 },
      { id: 'key-features', title: 'Key Features', level: 2 },
      { id: 'ai-powered-video-creation', title: 'AI-Powered Video Creation', level: 3 },
      { id: 'intuitive-editing-tools', title: 'Intuitive Editing Tools', level: 3 },
      { id: 'professional-templates', title: 'Professional Templates', level: 3 },
      { id: 'content-repurposing', title: 'Content Repurposing', level: 3 },
      { id: 'collaboration-tools', title: 'Collaboration Tools', level: 3 },
      { id: 'who-is-videoremix-io-for', title: 'Who is VideoRemix.vip For?', level: 2 },
      { id: 'benefits-of-using-videoremix-io', title: 'Benefits of Using VideoRemix.vip', level: 2 },
      { id: 'time-savings', title: 'Time Savings', level: 3 },
      { id: 'cost-efficiency', title: 'Cost Efficiency', level: 3 },
      { id: 'professional-quality', title: 'Professional Quality', level: 3 },
      { id: 'consistent-output', title: 'Consistent Output', level: 3 },
      { id: 'getting-started', title: 'Getting Started', level: 2 }
    ]
  },
  {
    id: 'create-first-video',
    title: 'Creating Your First Video',
    excerpt: 'A step-by-step guide to creating your first video with VideoRemix.vip in under 15 minutes.',
    category: 'getting-started',
    categoryName: 'Getting Started',
    reading_time: '8 min read',
    last_updated: 'May 12, 2025',
    author: 'Sarah Johnson',
    content: `
      <h2>Introduction</h2>
      <p>In this guide, we'll walk you through the process of creating your first video with VideoRemix.vip. By the end, you'll have a professional-quality video ready to share or publish.</p>
      
      <h2>Before You Start</h2>
      <p>Make sure you have:</p>
      <ul>
        <li>Created your VideoRemix.vip account</li>
        <li>Any media assets you want to include (optional, as we provide stock footage)</li>
        <li>A general idea of what your video will be about</li>
      </ul>
      
      <h2>Step 1: Start a New Project</h2>
      <p>Begin by logging into your VideoRemix.vip dashboard and clicking the "Create New Video" button in the top-right corner. This will open the project creation screen.</p>
      
      <h3>Choose Your Starting Point</h3>
      <p>You'll see several options for starting your project:</p>
      <ul>
        <li><strong>Start from Template:</strong> Choose from our library of pre-designed templates.</li>
        <li><strong>Start from Text:</strong> Enter a description and let our AI generate a video.</li>
        <li><strong>Start from Scratch:</strong> Begin with a blank canvas for complete control.</li>
        <li><strong>Upload Your Footage:</strong> Start with your own media files.</li>
      </ul>
      
      <p>For your first video, we recommend starting with a template. Click "Start from Template" to continue.</p>
      
      <h2>Step 2: Select a Template</h2>
      <p>Browse our template library and select one that matches your needs. You can filter templates by:</p>
      <ul>
        <li>Industry/Purpose</li>
        <li>Duration</li>
        <li>Style/Mood</li>
        <li>Aspect Ratio (16:9, 9:16, 1:1, etc.)</li>
      </ul>
      
      <p>Once you've found a template you like, hover over it and click "Use This Template" to proceed to the editor.</p>
      
      <h2>Step 3: Customize Your Video</h2>
      <p>Now you'll see the VideoRemix.vip editor interface with your selected template loaded. Here's how to customize it:</p>
      
      <h3>Replace Text Elements</h3>
      <p>Click on any text in the preview window to edit it. You can change the content, font, size, color, and animations from the right sidebar.</p>
      
      <h3>Replace Media</h3>
      <p>To replace images or video clips:</p>
      <ol>
        <li>Click on the media element you want to replace</li>
        <li>In the sidebar, click "Replace Media"</li>
        <li>Choose from your uploads, our stock library, or upload new media</li>
        <li>Adjust the crop, timing, and other properties as needed</li>
      </ol>
      
      <h3>Adjust Timing</h3>
      <p>To change how long elements appear on screen:</p>
      <ol>
        <li>Select the element in the timeline at the bottom of the screen</li>
        <li>Drag the edges to extend or shorten its duration</li>
        <li>Or enter an exact duration in the sidebar</li>
      </ol>
      
      <h2>Step 4: Add Your Branding</h2>
      <p>Make the video your own by adding your brand elements:</p>
      
      <h3>Add Your Logo</h3>
      <p>Click the "Brand" tab in the sidebar, then "Add Logo." Upload your logo file and position it where you want it to appear.</p>
      
      <h3>Set Brand Colors</h3>
      <p>In the Brand tab, click "Colors" and set your primary and secondary brand colors. You can apply these to text, backgrounds, and other elements.</p>
      
      <h2>Step 5: Review and Enhance</h2>
      <p>Before finalizing your video:</p>
      
      <h3>Use AI Enhancement</h3>
      <p>Click the "Enhance" button in the top menu to apply our AI improvements to your video. This can automatically adjust colors, optimize transitions, and improve overall quality.</p>
      
      <h3>Preview Your Video</h3>
      <p>Click the "Preview" button to watch your complete video. Make note of any adjustments needed.</p>
      
      <h2>Step 6: Export Your Video</h2>
      <p>When you're satisfied with your video:</p>
      <ol>
        <li>Click the "Export" button in the top-right corner</li>
        <li>Select your preferred quality settings and format</li>
        <li>Choose whether to download directly or publish to connected platforms</li>
        <li>Click "Start Export" to begin processing</li>
      </ol>
      
      <p>Depending on the length and complexity of your video, export can take anywhere from a few seconds to several minutes.</p>
      
      <h2>Congratulations!</h2>
      <p>You've created your first video with VideoRemix.vip! Your exported video will be available in the "My Videos" section of your dashboard, where you can download it or share it directly.</p>
      
      <h2>Next Steps</h2>
      <p>Now that you've created your first video, consider exploring these resources:</p>
      <ul>
        <li><a href="/help/ai-editing-guide">AI Editing: Complete Guide</a></li>
        <li><a href="/help/templates-usage">Using Video Templates</a></li>
        <li><a href="/help/adding-media">Adding & Managing Media</a></li>
      </ul>
    `,
    related_articles: [
      'account-setup', 
      'video-editor-interface', 
      'templates-usage'
    ],
    tags: ['tutorial', 'basics', 'getting started', 'first video'],
    video_tutorial: 'https://example.com/tutorials/create-first-video',
    toc: [
      { id: 'introduction', title: 'Introduction', level: 2 },
      { id: 'before-you-start', title: 'Before You Start', level: 2 },
      { id: 'step-1-start-a-new-project', title: 'Step 1: Start a New Project', level: 2 },
      { id: 'choose-your-starting-point', title: 'Choose Your Starting Point', level: 3 },
      { id: 'step-2-select-a-template', title: 'Step 2: Select a Template', level: 2 },
      { id: 'step-3-customize-your-video', title: 'Step 3: Customize Your Video', level: 2 },
      { id: 'replace-text-elements', title: 'Replace Text Elements', level: 3 },
      { id: 'replace-media', title: 'Replace Media', level: 3 },
      { id: 'adjust-timing', title: 'Adjust Timing', level: 3 },
      { id: 'step-4-add-your-branding', title: 'Step 4: Add Your Branding', level: 2 },
      { id: 'add-your-logo', title: 'Add Your Logo', level: 3 },
      { id: 'set-brand-colors', title: 'Set Brand Colors', level: 3 },
      { id: 'step-5-review-and-enhance', title: 'Step 5: Review and Enhance', level: 2 },
      { id: 'use-ai-enhancement', title: 'Use AI Enhancement', level: 3 },
      { id: 'preview-your-video', title: 'Preview Your Video', level: 3 },
      { id: 'step-6-export-your-video', title: 'Step 6: Export Your Video', level: 2 },
      { id: 'congratulations', title: 'Congratulations!', level: 2 },
      { id: 'next-steps', title: 'Next Steps', level: 2 }
    ]
  },
  {
    id: 'ai-editing-guide',
    title: 'AI Editing: Complete Guide',
    excerpt: 'Everything you need to know about using our AI editing capabilities.',
    category: 'features-tools',
    categoryName: 'Features & Tools',
    reading_time: '10 min read',
    last_updated: 'May 5, 2025',
    author: 'David Chen',
    content: `
      <h2>Introduction to AI Editing</h2>
      <p>VideoRemix.vip's AI editing capabilities represent the cutting edge of video production technology. Our AI systems can analyze your footage, understand context, and apply professional editing techniques automatically. This guide will help you leverage these powerful features to their fullest potential.</p>
      
      <h2>What the AI Can Do</h2>
      <p>Our AI editing system can perform numerous tasks that traditionally required hours of manual work:</p>
      
      <h3>Scene Detection</h3>
      <p>The AI automatically identifies different scenes in your footage, creating natural cut points and organizing your content logically.</p>
      
      <h3>Content Analysis</h3>
      <p>Our system analyzes the actual content of your video to identify important moments, key subjects, and emotional highlights.</p>
      
      <h3>Color Correction</h3>
      <p>The AI can automatically balance colors, adjust lighting, and apply color grading to give your footage a professional, consistent look.</p>
      
      <h3>Audio Enhancement</h3>
      <p>Background noise reduction, voice clarity improvement, and volume normalization happen automatically.</p>
      
      <h3>Pacing Optimization</h3>
      <p>The AI analyzes your content to determine the optimal pacing, adjusting clip lengths and transitions to maintain viewer engagement.</p>
      
      <h3>B-Roll Selection</h3>
      <p>When you need supplementary footage, the AI can recommend and place appropriate B-roll from our stock library or your uploaded content.</p>
      
      <h2>Getting Started with AI Editing</h2>
      
      <h3>Auto-Edit Mode</h3>
      <p>The simplest way to use our AI editing features is through Auto-Edit mode:</p>
      
      <ol>
        <li>Upload your raw footage or select existing media</li>
        <li>Click the "Auto-Edit" button in the main toolbar</li>
        <li>Select your preferred editing style (Documentary, Dynamic, Cinematic, Social Media, etc.)</li>
        <li>Optionally, add specific instructions for the AI</li>
        <li>Click "Generate Edit" and wait for the AI to process your content</li>
      </ol>
      
      <p>The AI will analyze your content and create an initial edit following your selected style. This typically takes 2-5 minutes depending on the amount of footage.</p>
      
      <h3>AI Assist Mode</h3>
      <p>For more control while still leveraging AI power:</p>
      
      <ol>
        <li>Start editing your project manually</li>
        <li>When you want AI assistance, click on the magic wand icon next to any editing function</li>
        <li>The AI will provide suggestions specific to that aspect of editing</li>
        <li>Accept or modify the suggestions as desired</li>
      </ol>
      
      <h2>Advanced AI Editing Techniques</h2>
      
      <h3>Training the AI with Feedback</h3>
      <p>Our AI learns from your feedback to better understand your preferences:</p>
      
      <ul>
        <li>Use the thumbs up/down buttons on AI suggestions to provide feedback</li>
        <li>When accepting an AI edit, you can mark it as "Exactly Right" or "Close but Needed Changes"</li>
        <li>Add specific feedback comments when rejecting suggestions</li>
      </ul>
      
      <p>Over time, the system will learn your preferences and provide increasingly accurate suggestions.</p>
      
      <h3>AI Style Transfer</h3>
      <p>You can have the AI mimic the editing style of popular content:</p>
      
      <ol>
        <li>Go to the AI panel and select "Style Transfer"</li>
        <li>Either choose from preset styles (Cinematic, Vlog, Commercial, etc.)</li>
        <li>Or upload reference videos whose style you want to emulate</li>
        <li>Adjust the style intensity slider (subtle to dramatic)</li>
        <li>Apply to your entire project or selected segments</li>
      </ol>
      
      <h3>Narrative AI</h3>
      <p>For documentary or story-based content, our Narrative AI can help structure your footage into a compelling story:</p>
      
      <ol>
        <li>Select the clips you want to include</li>
        <li>Go to the AI panel and choose "Narrative Structure"</li>
        <li>Enter the key message or story you want to convey</li>
        <li>The AI will reorganize your clips into a narrative structure with appropriate pacing and flow</li>
      </ol>
      
      <h2>AI Editing Best Practices</h2>
      
      <h3>Provide Context for Better Results</h3>
      <p>The more information you provide, the better the AI can edit your content:</p>
      
      <ul>
        <li>Add project descriptions and goals</li>
        <li>Tag key subjects in your footage</li>
        <li>Specify target audience and platform</li>
        <li>Note any specific moments that must be included</li>
      </ul>
      
      <h3>Review and Refine</h3>
      <p>While our AI is powerful, human creativity and judgment remain essential:</p>
      
      <ul>
        <li>Always review AI-generated edits</li>
        <li>Look for opportunities to add your creative touches</li>
        <li>Use AI suggestions as a starting point, not the final product</li>
        <li>Combine multiple AI suggestions when appropriate</li>
      </ul>
      
      <h3>Balance Automation and Control</h3>
      <p>Finding the right mix of AI assistance and manual editing yields the best results:</p>
      
      <ul>
        <li>Use Auto-Edit for first drafts or simple projects</li>
        <li>Use AI Assist for specific tasks while maintaining creative control</li>
        <li>Consider your timeline: tighter deadlines may warrant more AI automation</li>
      </ul>
      
      <h2>Troubleshooting AI Editing Issues</h2>
      
      <h3>If the AI is Missing Important Moments</h3>
      <ul>
        <li>Tag key moments or subjects in your footage before processing</li>
        <li>Add specific instructions about important content</li>
        <li>Adjust the "Content Retention" slider to keep more original footage</li>
      </ul>
      
      <h3>If Color Correction Looks Unnatural</h3>
      <ul>
        <li>Try a different color grade preset</li>
        <li>Reduce the color correction intensity</li>
        <li>For specific shots, disable AI color correction and adjust manually</li>
      </ul>
      
      <h3>If Pacing Feels Off</h3>
      <ul>
        <li>Adjust the "Editing Pace" setting (slower or faster)</li>
        <li>Specify the target length of your final video</li>
        <li>Manually adjust specific transitions that don't feel right</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>AI editing represents a paradigm shift in video production, allowing you to create professional-quality content in a fraction of the time. By understanding and effectively using VideoRemix.vip's AI features, you can dramatically improve both your workflow efficiency and output quality.</p>
      
      <h2>Further Resources</h2>
      <ul>
        <li><a href="/tutorials/ai-editing-masterclass">Watch our AI Editing Masterclass video tutorial</a></li>
        <li><a href="/help/ai-voice-generation">Learn about AI Voice Generation</a></li>
        <li><a href="/help/batch-processing">Discover how to process multiple videos with AI</a></li>
      </ul>
    `,
    related_articles: [
      'advanced-ai-techniques', 
      'video-editor-interface', 
      'export-options'
    ],
    tags: ['AI', 'editing', 'automation', 'advanced'],
    video_tutorial: 'https://example.com/tutorials/ai-editing-masterclass',
    toc: [
      { id: 'introduction-to-ai-editing', title: 'Introduction to AI Editing', level: 2 },
      { id: 'what-the-ai-can-do', title: 'What the AI Can Do', level: 2 },
      { id: 'scene-detection', title: 'Scene Detection', level: 3 },
      { id: 'content-analysis', title: 'Content Analysis', level: 3 },
      { id: 'color-correction', title: 'Color Correction', level: 3 },
      { id: 'audio-enhancement', title: 'Audio Enhancement', level: 3 },
      { id: 'pacing-optimization', title: 'Pacing Optimization', level: 3 },
      { id: 'b-roll-selection', title: 'B-Roll Selection', level: 3 },
      { id: 'getting-started-with-ai-editing', title: 'Getting Started with AI Editing', level: 2 },
      { id: 'auto-edit-mode', title: 'Auto-Edit Mode', level: 3 },
      { id: 'ai-assist-mode', title: 'AI Assist Mode', level: 3 },
      { id: 'advanced-ai-editing-techniques', title: 'Advanced AI Editing Techniques', level: 2 },
      { id: 'training-the-ai-with-feedback', title: 'Training the AI with Feedback', level: 3 },
      { id: 'ai-style-transfer', title: 'AI Style Transfer', level: 3 },
      { id: 'narrative-ai', title: 'Narrative AI', level: 3 },
      { id: 'ai-editing-best-practices', title: 'AI Editing Best Practices', level: 2 },
      { id: 'provide-context-for-better-results', title: 'Provide Context for Better Results', level: 3 },
      { id: 'review-and-refine', title: 'Review and Refine', level: 3 },
      { id: 'balance-automation-and-control', title: 'Balance Automation and Control', level: 3 },
      { id: 'troubleshooting-ai-editing-issues', title: 'Troubleshooting AI Editing Issues', level: 2 },
      { id: 'if-the-ai-is-missing-important-moments', title: 'If the AI is Missing Important Moments', level: 3 },
      { id: 'if-color-correction-looks-unnatural', title: 'If Color Correction Looks Unnatural', level: 3 },
      { id: 'if-pacing-feels-off', title: 'If Pacing Feels Off', level: 3 },
      { id: 'conclusion', title: 'Conclusion', level: 2 },
      { id: 'further-resources', title: 'Further Resources', level: 2 }
    ]
  }
];

// Helper function to get an article by ID
const getArticleById = (id: string) => {
  return articles.find(article => article.id === id) || null;
};

// Function to get a list of related articles
const getRelatedArticles = (ids: string[]) => {
  return ids.map(id => articles.find(article => article.id === id))
    .filter(article => article !== undefined) as typeof articles;
};

const HelpArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  
  // Simulate fetching article data
  useEffect(() => {
    // In a real app, this would be an API call
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const foundArticle = getArticleById(articleId || '');
      setArticle(foundArticle);
      
      if (foundArticle?.related_articles) {
        setRelatedArticles(getRelatedArticles(foundArticle.related_articles));
      }
      
      setLoading(false);
    }, 500);
  }, [articleId]);
  
  // Track active heading for table of contents
  useEffect(() => {
    if (!article) return;
    
    const handleScroll = () => {
      // Get all headings in the article
      const headings = document.querySelectorAll('h2, h3, h4');
      
      // Find the heading that is currently at the top of the viewport
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        
        if (rect.top <= 150) {
          // This heading is at or above the top of the viewport
          const id = heading.id;
          if (id && id !== activeHeadingId) {
            setActiveHeadingId(id);
          }
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, activeHeadingId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 text-white">
        <div className="relative">
          <div className="w-20 h-20 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary-500 font-medium">Loading</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Article Not Found</h1>
        <p className="text-gray-300 mb-8">The help article you're looking for doesn't exist or has been moved.</p>
        <Link 
          to="/help" 
          className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg"
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          Return to Help Center
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Help Center | VideoRemix.vip</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>
      
      <main className="pt-32 pb-20">
        <article className="py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-600/10 rounded-full blur-[100px] -z-10"></div>
          </div>
          
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <div className="mb-8">
              <nav className="flex text-gray-400 text-sm">
                <Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link to={`/help?category=${article.category}`} className="hover:text-primary-400 transition-colors">{article.categoryName}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-white truncate max-w-[200px]">{article.title}</span>
              </nav>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents - Desktop */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h2 className="text-white font-bold mb-4">Table of Contents</h2>
                  <nav>
                    <ul className="space-y-1">
                      {article.toc.map((item: any, index: number) => (
                        <li 
                          key={index} 
                          style={{ 
                            marginLeft: `${(item.level - 2) * 16}px`
                          }}
                        >
                          <a 
                            href={`#${item.id}`}
                            className={`block text-sm py-1 border-l-2 pl-3 transition-colors ${
                              activeHeadingId === item.id 
                                ? 'text-primary-400 border-primary-400' 
                                : 'text-gray-300 border-gray-700 hover:text-primary-300 hover:border-primary-300'
                            }`}
                          >
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  {/* Article Meta */}
                  <div className="mt-8 pt-6 border-t border-gray-700 space-y-3 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{article.reading_time}</span>
                    </div>
                    <div className="text-gray-400">
                      Last updated: {article.last_updated}
                    </div>
                    <div className="text-gray-400">
                      By: {article.author}
                    </div>
                  </div>
                  
                  {/* Article Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                    {article.video_tutorial && (
                      <a 
                        href={article.video_tutorial}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <VideoIcon className="h-4 w-4 mr-2" />
                        <span>Watch Video Tutorial</span>
                      </a>
                    )}
                    <button 
                      className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                      onClick={() => window.print()}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      <span>Print Article</span>
                    </button>
                    <button 
                      className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // In a real app, you would show a toast notification
                        alert("Link copied to clipboard!");
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      <span>Share Article</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
                >
                  {/* Article Header */}
                  <header className="mb-8 pb-8 border-b border-gray-700">
                    <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
                    <p className="text-xl text-gray-300 mb-6">{article.excerpt}</p>
                    
                    {/* Article Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags.map((tag: string, idx: number) => (
                        <Link 
                          key={idx}
                          to={`/help?tag=${tag}`}
                          className="bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 px-3 py-1 rounded-full transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Mobile Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 lg:hidden">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.reading_time}
                      </div>
                      <div>
                        Last updated: {article.last_updated}
                      </div>
                      <div>
                        By: {article.author}
                      </div>
                    </div>
                  </header>
                  
                  {/* Table of Contents - Mobile Only */}
                  <div className="lg:hidden mb-8">
                    <details className="bg-gray-700/50 rounded-lg">
                      <summary className="p-4 font-medium text-white cursor-pointer">
                        Table of Contents
                      </summary>
                      <div className="p-4 pt-0 border-t border-gray-600">
                        <nav>
                          <ul className="space-y-1">
                            {article.toc.map((item: any, index: number) => (
                              <li 
                                key={index} 
                                style={{ 
                                  marginLeft: `${(item.level - 2) * 16}px`
                                }}
                              >
                                <a 
                                  href={`#${item.id}`}
                                  className="block text-sm py-1 text-gray-300 hover:text-primary-400 transition-colors"
                                >
                                  {item.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      </div>
                    </details>
                  </div>
                  
                  {/* Video Tutorial - If Available */}
                  {article.video_tutorial && (
                    <div className="mb-8">
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                          {/* Replace with actual video thumbnail */}
                          <img
                            src="https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Video thumbnail"
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.a
                              href={article.video_tutorial}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-primary-600/80 backdrop-blur-sm p-4 rounded-full"
                            >
                              <Play className="h-8 w-8 text-white" />
                            </motion.a>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            Watch Video Tutorial
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Article Content */}
                  <div 
                    className="prose prose-lg prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-a:no-underline prose-a:transition-colors prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-2 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-code:text-primary-300 prose-img:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                  
                  {/* Article Feedback */}
                  <div className="mt-12 pt-8 border-t border-gray-700">
                    <h3 className="text-white font-bold mb-4">Was this article helpful?</h3>
                    <div className="flex space-x-4">
                      <button 
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          feedback === 'helpful'
                            ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                        onClick={() => setFeedback('helpful')}
                      >
                        <ThumbsUp className="h-5 w-5 mr-2" />
                        Yes, it helped
                      </button>
                      <button 
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          feedback === 'not-helpful'
                            ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                        onClick={() => setFeedback('not-helpful')}
                      >
                        <ThumbsDown className="h-5 w-5 mr-2" />
                        No, I need more help
                      </button>
                    </div>
                    
                    {/* Feedback submitted message */}
                    {feedback && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 bg-primary-600/20 border border-primary-500/50 rounded-lg"
                      >
                        <p className="text-white">
                          {feedback === 'helpful' 
                            ? "Thank you for your feedback! We're glad this article was helpful." 
                            : 'Thanks for letting us know. Would you like to contact our support team for more assistance?'
                          }
                        </p>
                        {feedback === 'not-helpful' && (
                          <Link 
                            to="/contact" 
                            className="inline-flex items-center mt-2 text-primary-400 hover:text-primary-300"
                          >
                            Contact Support
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedArticles.map((relatedArticle, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Link to={`/help/${relatedArticle.id}`} className="block">
                            <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-primary-500/50 transition-colors h-full">
                              <div className="flex items-start">
                                <div className="bg-primary-600/20 p-3 rounded-lg mr-4 flex-shrink-0">
                                  <FileText className="h-5 w-5 text-primary-400" />
                                </div>
                                <div>
                                  <h3 className="text-white font-bold mb-2 group-hover:text-primary-400 transition-colors">
                                    {relatedArticle.title}
                                  </h3>
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {relatedArticle.excerpt}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* More Help Options */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mt-12 bg-gradient-to-br from-primary-900/30 to-gray-800 rounded-xl border border-primary-500/30 p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Still have questions?</h3>
                  <p className="text-gray-300 mb-6">
                    Find more answers in our help center or contact our support team for assistance.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link 
                      to="/help" 
                      className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Browse Help Center
                    </Link>
                    <Link 
                      to="/contact" 
                      className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact Support
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </article>
      </main>
      
      <style jsx global>{`
        .prose pre {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
        }
        
        .prose h2 {
          scroll-margin-top: 120px;
        }
        
        .prose h3, .prose h4 {
          scroll-margin-top: 120px;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media print {
          header, footer, nav, .no-print {
            display: none !important;
          }
          
          body, .prose {
            font-size: 12pt;
            color: black;
            background-color: white;
          }
          
          a {
            text-decoration: underline;
            color: #0000EE;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          table, figure {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default HelpArticlePage;