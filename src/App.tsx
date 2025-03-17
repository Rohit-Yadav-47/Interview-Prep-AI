import React, { useState, useEffect, useCallback } from 'react';
import { Message, CodingQuestion } from './types';
import { chat, analyzeCodingSolution } from './lib/groq';
import {
  Brain,
  Heart,
  Terminal,
  Layout,
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
  // Helper function to format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isInterviewStarted = currentPage !== 'home';

  return (
    <header className="relative z-20 bg-black backdrop-blur-lg border-b border-blue-900/50 sticky top-0 shadow-xl">
      <div className="max-w-[98%] xl:max-w-[95%] mx-auto px-4 py-4">
        <div className="flex flex-row gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigateTo('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md rounded-full animate-pulse"></div>
              <Brain className="relative text-white z-10" size={32} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              CodeSense AI
            </h1>
          </div>
          {/* Main Navigation */}
          <nav className="flex items-center gap-3">
            <div className="relative flex rounded-xl overflow-hidden border border-gray-700/50 shadow-lg backdrop-blur-sm">
              <button
                onClick={() => navigateTo('coding-interview', 'coding')}
                aria-label="Interview Mode"
                aria-current={isInterviewStarted && interviewMode === 'coding' ? 'page' : undefined}
                className={`px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 relative
                  ${isInterviewStarted && interviewMode === 'coding'
                    ? 'text-blue-100 font-medium z-10'
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                <span className={`absolute inset-0 ${isInterviewStarted && interviewMode === 'coding' 
                  ? 'bg-gradient-to-r from-blue-600/80 to-blue-500/60 opacity-100' 
                  : 'bg-gray-800/60 hover:bg-gray-700/70 opacity-0 hover:opacity-100'} transition-all duration-300`}>
                </span>
                <Terminal size={18} className="relative z-10" />
                <span className="font-medium relative z-10">Interview Mode</span>
                {isInterviewStarted && interviewMode === 'coding' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] animate-pulse absolute top-2.5 right-2.5 z-10"></span>
                )}
              </button>
              <div className="w-px h-8 bg-gray-100/50 self-center"></div>
              <button
                onClick={() => navigateTo('frontend-test', 'frontend')}
                aria-label="Frontend Test"
                aria-current={isInterviewStarted && interviewMode === 'frontend' ? 'page' : undefined}
                className={`px-4 py-2.5 flex items-center gap-2.5 transition-all duration-300 relative
                  ${isInterviewStarted && interviewMode === 'frontend'
                    ? 'text-green-100 font-medium z-10' 
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                <span className={`absolute inset-0 ${isInterviewStarted && interviewMode === 'frontend' 
                  ? 'bg-gradient-to-r from-green-600/80 to-green-500/60 opacity-100' 
                  : 'bg-gray-800/60 hover:bg-gray-700/70 opacity-0 hover:opacity-100'} transition-all duration-300`}>
                </span>
                <Layout size={18} className="relative z-10" />
                <span className="font-medium relative z-10">Frontend Test</span>
                {isInterviewStarted && interviewMode === 'frontend' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-green-300 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)] animate-pulse absolute top-2.5 right-2.5 z-10"></span>
                )}
              </button>
            </div>
          </nav>
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
      
      <main className={`
        flex-grow w-full relative z-10
        max-w-full px-4 sm:px-6 py-4' '}
      `}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  ); 


};
export default App;