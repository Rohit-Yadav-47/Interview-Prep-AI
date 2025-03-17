import React, { useState, useEffect, useCallback } from 'react';
import { Message, CodingQuestion } from './types';
import { chat, analyzeCodingSolution } from './lib/groq';
import {
  Brain,
  Heart,
  Terminal,
  Layout,
  Menu,
  X,
  Home as HomeIcon
} from 'lucide-react';

// Import page components
import Home from './pages/Home';
import CodingInterview from './pages/CodingInterview';
import FrontendTest from './pages/FrontendTest';

// --- Floating Background Particles ---
const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute w-32 h-32 rounded-full bg-blue-400/10 blur-3xl -top-16 -left-16 animate-float"></div>
    <div className="absolute w-64 h-64 rounded-full bg-purple-400/10 blur-3xl top-1/4 right-1/3 animate-float-slow"></div>
    <div className="absolute w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl bottom-1/4 left-1/3 animate-float-medium"></div>
  </div>
);

// --- Header Component ---
const Header = ({
  currentPage,
  interviewMode,
  timeRemaining,
  question,
  navigateTo,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Helper function to format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isInterviewStarted = currentPage !== 'home';
  
  // Close menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.mobile-menu-container') && !e.target.closest('.menu-button')) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleNavigation = (page, mode) => {
    navigateTo(page, mode);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative z-20 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-lg border-b border-blue-900/50 sticky top-0 shadow-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => navigateTo('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md rounded-full animate-pulse group-hover:bg-purple-500 transition-colors duration-300"></div>
              <Brain className="relative text-white z-10" size={28} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-500 transition-all duration-300">
              CodeSense AI
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {currentPage !== 'home' && (
              <button
                onClick={() => navigateTo('home')}
                className="text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all duration-200 flex items-center gap-2"
              >
                <HomeIcon size={18} />
                <span>Home</span>
              </button>
            )}
            
            <div className="flex rounded-lg overflow-hidden border border-gray-700/70 shadow-lg">
              <button
                onClick={() => navigateTo('coding-interview', 'coding')}
                className={`px-3.5 py-2 flex items-center gap-2 transition-all duration-200 relative ${
                  isInterviewStarted && interviewMode === 'coding'
                    ? 'text-blue-100 font-medium bg-blue-600/70'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
                }`}
              >
                <Terminal size={18} />
                <span className="font-medium">Coding</span>
                {isInterviewStarted && interviewMode === 'coding' && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
                )}
              </button>
              
              <button
                onClick={() => navigateTo('frontend-test', 'frontend')}
                className={`px-3.5 py-2 flex items-center gap-2 transition-all duration-200 relative ${
                  isInterviewStarted && interviewMode === 'frontend'
                    ? 'text-green-100 font-medium bg-green-600/70'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
                }`}
              >
                <Layout size={18} />
                <span className="font-medium">Frontend</span>
                {isInterviewStarted && interviewMode === 'frontend' && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                )}
              </button>
            </div>
            
            {isInterviewStarted && (
              <div className="ml-2 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-300 flex items-center">
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>  
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center z-30 p-2 rounded-lg hover:bg-gray-800/70 transition-colors duration-200 menu-button"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-100" />
            ) : (
              <Menu size={24} className="text-gray-100" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Slide from top animation */}
      <div className={`fixed inset-x-0 top-0 md:hidden transition-transform duration-300 ease-in-out z-10 mobile-menu-container ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-blue-800/30 pt-16 pb-4">
          <div className="container mx-auto px-4 flex flex-col gap-2">
            <button
              onClick={() => handleNavigation('home')}
              className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                currentPage === 'home'
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              <HomeIcon size={20} />
              <span className="font-medium">Home</span>
            </button>
            
            <button
              onClick={() => handleNavigation('coding-interview', 'coding')}
              className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                isInterviewStarted && interviewMode === 'coding'
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              <Terminal size={20} />
              <span className="font-medium">Coding Interview</span>
              {isInterviewStarted && interviewMode === 'coding' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
              )}
            </button>
            
            <button
              onClick={() => handleNavigation('frontend-test', 'frontend')}
              className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                isInterviewStarted && interviewMode === 'frontend'
                  ? 'bg-green-600/20 text-green-100 border border-green-500/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              <Layout size={20} />
              <span className="font-medium">Frontend Test</span>
              {isInterviewStarted && interviewMode === 'frontend' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              )}
            </button>
            
           
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Footer Component ---
const Footer = () => (
  <footer className="relative z-10 bg-black backdrop-blur-lg border-t border-blue-900/50 p-4 text-center text-sm text-gray-400">
    <div className="flex items-center justify-center gap-1">
      Made with <Heart size={14} className="text-red-500 fill-red-500" /> by Rohit
    </div>
  </footer>
);

function App() {
  // Page navigation state
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'coding-interview', 'frontend-test'
  
  // Shared state
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'coding' | 'frontend'>('coding');
  const [activeSpeechMode, setActiveSpeechMode] = useState<'coding' | 'frontend' | null>(null);

  // Timer effect for countdown
  useEffect(() => {
    if (currentPage === 'home') return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentPage]);

  // Handle streaming messages
  useEffect(() => {
    if (streamingMessage && streamingMessage.role === 'assistant') {
      const allMessages = [...messages, streamingMessage];
      window.dispatchEvent(
        new CustomEvent('new-ai-message', {
          detail: { messages: allMessages, isStreaming: true, streamContent: streamingMessage.content },
        })
      );
    }
  }, [streamingMessage, messages]);

  useEffect(() => {
    if (messages.length && messages[messages.length - 1].role === 'assistant') {
      window.dispatchEvent(new CustomEvent('new-ai-message', { detail: { messages, isStreaming: false } }));
    }
  }, [messages]);

  // Navigation handler
  const navigateTo = useCallback((page: string, mode?: 'coding' | 'frontend') => {
    setCurrentPage(page);
    if (mode) {
      setInterviewMode(mode);
      setActiveSpeechMode(mode);
    }
    
    // Reset time when starting a new interview
    if ((page === 'coding-interview' || page === 'frontend-test') && messages.length === 0) {
      setTimeRemaining(900);
    }
    
    // Reset messages when starting a new interview
    if (page !== 'home' && messages.length === 0) {
      // Add initial greeting based on mode
      const greeting = mode === 'coding' 
        ? "Welcome to your coding interview! I'm your AI interviewer today. Let's start with a brief introduction. Could you tell me about your programming experience?"
        : "Welcome to the React frontend test! I'll be your guide as you work on developing React components. What kind of React experience do you have?";
        
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [messages]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (content, role = 'user') => {
      // Special commands
      if (content === 'start-interview-coding') {
        navigateTo('coding-interview', 'coding');
        return;
      }
      if (content === 'start-interview-frontend') {
        navigateTo('frontend-test', 'frontend');
        return;
      }
      
      const userMessage: Message = { role, content };
      setMessages((prev) => [...prev, userMessage]);
      
      if (role === 'user') {
        setStreamingMessage({ role: 'assistant', content: '' });
        setIsProcessing(true);

        try {
          const streamController = new AbortController();
          const responsePromise = chat([...messages, userMessage], {
            onStreamChunk: (chunk) => {
              setStreamingMessage((current) =>
                current ? { ...current, content: current.content + chunk } : { role: 'assistant', content: chunk }
              );
            },
            signal: streamController.signal,
          });

          const fullResponse = await responsePromise;
          setMessages((prev) => [...prev, { role: 'assistant', content: fullResponse }]);
          setStreamingMessage(null);
        } catch (error) {
          console.error('Error getting response:', error);
          setStreamingMessage(null);
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [messages, navigateTo]
  );

  // Submit code handler
  const handleSubmitCode = useCallback(async () => {
    setIsProcessing(true);
    setStreamingMessage({ role: 'assistant', content: 'Code Analysis:\n\n' });
    try {
      const streamController = new AbortController();
      const analysisPromise = analyzeCodingSolution(
        question ? question.description : 'Please analyze this code',
        code,
        {
          onStreamChunk: (chunk) => {
            setStreamingMessage((current) =>
              current ? { ...current, content: current.content + chunk } : { role: 'assistant', content: chunk }
            );
          },
          signal: streamController.signal,
        }
      );
      const fullAnalysis = await analysisPromise;
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `Submitted code:\n\`\`\`\n${code}\n\`\`\`` },
        { role: 'assistant', content: `\n\n${fullAnalysis}` },
      ]);
      setStreamingMessage(null);
    } catch (error) {
      console.error('Error analyzing code:', error);
      setStreamingMessage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [code, question]);

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'coding-interview':
        return (
          <CodingInterview
            messages={messages}
            streamingMessage={streamingMessage}
            question={question}
            code={code}
            onCodeChange={setCode}
            onSendMessage={handleSendMessage}
            onSubmitCode={handleSubmitCode}
            isProcessing={isProcessing}
            timeRemaining={timeRemaining}
            enableSpeech={activeSpeechMode === 'coding'}
          />
        );
      case 'frontend-test':
        return (
          <FrontendTest
            messages={messages}
            streamingMessage={streamingMessage}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            enableSpeech={activeSpeechMode === 'frontend'}
          />
        );
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black transition-all duration-500 relative">
      <FloatingParticles />
      <style jsx global>{`
        /* Improved targeting for transition effects */
        .interview-transition-coding .coding-button-bg {
          opacity: 1 !important;
          transform: scale(30) !important;
          transition: all 0.3s ease-in-out;
        }
        
        .interview-transition-frontend .frontend-button-bg {
          opacity: 1 !important;
          transform: scale(30) !important;
          transition: all 0.3s ease-in-out;
        }
        
        @keyframes buttonPulse {
          0% { opacity: 0.2; }
          50% { opacity: 0.4; }
          100% { opacity: 0.2; }
        }
      `}</style>
      
      <Header
        currentPage={currentPage}
        interviewMode={interviewMode}
        timeRemaining={timeRemaining}
        question={question}
        navigateTo={navigateTo}
      />
      
      <main className="flex-grow w-full relative z-10 container mx-auto px-4 py-4 sm:py-6">
        {renderPage()}
      </main>
      <Footer />
    </div>
  ); 
};

export default App;