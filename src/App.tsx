import React, { useState, useEffect, useCallback } from 'react';
import { Message, CodingQuestion } from './types';
import Chat from './components/Chat';
import CodeEditor from './components/CodeEditor';
import ReactCodeCompiler from './components/ReactCodeCompiler';
import { chat, analyzeCodingSolution } from './lib/groq';
import {
  Brain,
  Heart,
  Terminal,
  Send,
  Clock,
  Code,
  Layout,
  ChevronRight,
  Zap,
} from 'lucide-react';

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
  isInterviewStarted,
  interviewMode,
  timeRemaining,
  question,
  activeView,
  setActiveView,
  startInterview,
}) => {
  // Helper function to format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="relative z-20 bg-gray-900/80 backdrop-blur-lg border-b border-blue-900/50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md rounded-full animate-pulse"></div>
              <Brain className="relative text-white z-10" size={28} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeSense AI
            </h1>
          </div>
          {/* Main Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => startInterview('coding')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isInterviewStarted && interviewMode === 'coding'
                  ? 'bg-blue-600/40 border border-blue-500/50 text-blue-300'
                  : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              <Terminal size={16} />
              <span>Interview Mode</span>
              {isInterviewStarted && interviewMode === 'coding' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => startInterview('frontend')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isInterviewStarted && interviewMode === 'frontend'
                  ? 'bg-green-600/40 border border-green-500/50 text-green-300'
                  : 'bg-gray-800/70 hover:bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              <Layout size={16} />
              <span>Frontend Test</span>
              {isInterviewStarted && interviewMode === 'frontend' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
        {/* Submenu */}
        {isInterviewStarted && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <ChevronRight size={14} />
              <span>{interviewMode === 'coding' ? 'Interview Session' : 'Frontend React Test'}</span>
              {isInterviewStarted && question && (
                <div className="flex items-center gap-2 ml-4 bg-blue-900/50 backdrop-blur px-3 py-1.5 rounded-full border border-blue-800/50">
                  <Clock className={`${timeRemaining < 60 ? 'text-red-400' : 'text-blue-400'}`} size={16} />
                  <span className={`text-sm font-mono ${timeRemaining < 60 ? 'text-red-400' : 'text-blue-300'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            {/* View Toggle Buttons (only for coding mode) */}
            {interviewMode === 'coding' && (
              <div className="flex p-1 bg-gray-800/70 backdrop-blur rounded-lg">
                <button
                  onClick={() => setActiveView('split')}
                  className={`p-1.5 rounded-md transition ${
                    activeView === 'split' ? 'bg-gray-700 shadow' : 'hover:bg-gray-700/50'
                  }`}
                  title="Split View"
                >
                  <Terminal size={16} className="text-blue-400" />
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`p-1.5 rounded-md transition ${
                    activeView === 'chat' ? 'bg-gray-700 shadow' : 'hover:bg-gray-700/50'
                  }`}
                  title="Chat View"
                >
                  <Send size={16} className="text-blue-400" />
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`p-1.5 rounded-md transition ${
                    activeView === 'code' ? 'bg-gray-700 shadow' : 'hover:bg-gray-700/50'
                  }`}
                  title="Code View"
                >
                  <Code size={16} className="text-blue-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

// --- Footer Component ---
const Footer = () => (
  <footer className="relative z-10 bg-gray-900/80 backdrop-blur-lg border-t border-blue-900/50 p-4 text-center text-sm text-gray-400">
    <div className="flex items-center justify-center gap-1">
      Made with <Heart size={14} className="text-red-500 fill-red-500" /> by Rohit
    </div>
  </footer>
);

// --- Main Content Component ---
const MainContent = ({
  isInterviewStarted,
  interviewMode,
  activeView,
  question,
  messages,
  streamingMessage,
  code,
  onCodeChange,
  onSendMessage,
  onSubmitCode,
  isProcessing,
  timeRemaining,
  startInterview,
  activeSpeechMode,
}) => {
  return (
    <main className="flex-grow max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2 w-full relative z-10 ">
      {!isInterviewStarted ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-3xl w-full text-center shadow-xl border border-blue-900/50">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md animate-pulse"></div>
              <Brain className="w-full h-full relative z-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Welcome to CodeSense AI
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Your AI-powered coding interview and frontend development platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coding Interview Card - Enhanced */}
              <div className="bg-gray-800/50 rounded-xl border border-blue-900/50 p-6 text-left hover:border-blue-700/50 transition-all hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 duration-300">
                <div className="bg-blue-600/30 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-600/40 transition-colors">
                  <Terminal size={24} className="text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">
                  Interview Mode
                </h3>
                <p className="text-gray-400 mb-4">
                  AI-driven technical interview with code assessment and problem-solving challenges.
                </p>
                <ul className="text-gray-400 text-sm mb-4 space-y-1.5 list-inside list-disc">
                  <li>Real-time voice conversation</li>
                  <li>Personalized coding challenges</li>
                  <li>Code evaluation and feedback</li>
                </ul>
                <button 
                  onClick={() => startInterview('coding')}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {/* Add a permanent subtle glow that gets enhanced on hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-md coding-button-bg"></span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-md opacity-20 hover:opacity-100 active:opacity-100 focus:opacity-100 transition-opacity duration-300"></span>
                  <Zap size={16} className="text-blue-200 relative z-10" />
                  <span className="relative z-10">Start Interview</span>
                </button>
              </div>
              {/* Frontend Test Card - Enhanced */}
              <div className="bg-gray-800/50 rounded-xl border border-green-900/50 p-6 text-left hover:border-green-700/50 transition-all hover:shadow-lg hover:shadow-green-900/20 hover:-translate-y-0.5 duration-300">
                <div className="bg-green-600/30 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-600/40 transition-colors">
                  <Layout size={24} className="text-green-300" />
                </div>
                <h3 className="text-xl font-semibold text-green-300 mb-2">
                  Frontend Test
                </h3>
                <p className="text-gray-400 mb-4">
                  Interactive React playground to showcase your frontend and UI development skills.
                </p>
                <ul className="text-gray-400 text-sm mb-4 space-y-1.5 list-inside list-disc">
                  <li>Live React coding environment</li>
                  <li>Real-time preview of your code</li>
                  <li>Multiple starter templates</li>
                </ul>
                <button 
                  onClick={() => startInterview('frontend')}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600/80 to-teal-600/80 hover:from-green-500 hover:to-teal-500 text-white font-medium rounded-lg transition shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {/* Add a permanent subtle glow that gets enhanced on hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400/10 to-teal-400/10 blur-md frontend-button-bg"></span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400/20 to-teal-400/20 blur-md opacity-20 hover:opacity-100 active:opacity-100 focus:opacity-100 transition-opacity duration-300"></span>
                  <Code size={16} className="text-green-200 relative z-10" />
                  <span className="relative z-10">Launch React Playground</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Interview components - always rendered but conditionally visible */}
          <div className={interviewMode === 'coding' ? 'block' : 'hidden'}>
            <div
              className={`grid gap-6 min-h-[500px] mb-10 transition-all duration-300 overflow-y-auto
                ${activeView === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}
                ${activeView === 'chat' ? 'md:grid-cols-1' : ''}
                ${activeView === 'code' ? 'md:grid-cols-1' : ''}`}
            >
              {(activeView === 'split' || activeView === 'chat') && (
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl overflow-hidden border-blue-900/50 border shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[400px]">
                  <Chat
                    messages={messages}
                    streamingMessage={streamingMessage}
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    darkMode={true}
                    enableSpeech={activeSpeechMode === 'coding'}
                  />
                </div>
              )}
              {(activeView === 'split' || activeView === 'code') && (
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl overflow-hidden border-blue-900/50 border shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[400px]">
                  <CodeEditor
                    question={question}
                    code={code}
                    onCodeChange={onCodeChange}
                    onSubmit={onSubmitCode}
                    timeRemaining={timeRemaining}
                    isProcessing={isProcessing}
                    darkMode={true}
                    isInterviewStarted={isInterviewStarted}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Frontend Test - Better integration with interview functionality */}
          <div className={interviewMode === 'frontend' ? 'block' : 'hidden'}>
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-blue-900/50 shadow-lg min-h-[500px] mb-10 overflow-hidden">
              <ReactCodeCompiler 
                darkMode={true} 
                enableSpeech={activeSpeechMode === 'frontend'}
                interviewComponent={
                  <div className="w-full p-2 h-full overflow-y-auto">
                    <div className="rounded-xl overflow-hidden border border-purple-500/20 shadow-lg">
                      <Chat
                        messages={messages}
                        streamingMessage={streamingMessage}
                        onSendMessage={onSendMessage}
                        isProcessing={isProcessing}
                        darkMode={true}
                        enableSpeech={activeSpeechMode === 'frontend'}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeView, setActiveView] = useState('split'); // 'split', 'chat', 'code'
  const [interviewMode, setInterviewMode] = useState<'coding' | 'frontend'>('coding');
  // Add a state to track which mode has active speech
  const [activeSpeechMode, setActiveSpeechMode] = useState<'coding' | 'frontend' | null>(null);

  // Timer effect for countdown
  useEffect(() => {
    if (!isInterviewStarted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInterviewStarted]);

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

  // Send message handler
  const handleSendMessage = useCallback(
    async (content, role = 'user') => {
      // If content indicates a mode start, set up interview accordingly
      if (content === 'start-interview-coding') {
        startInterview('coding');
        return;
      }
      if (content === 'start-interview-frontend') {
        startInterview('frontend');
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
    [messages]
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

  // Start interview handler
  const startInterview = useCallback((mode: 'coding' | 'frontend') => {
    setIsInterviewStarted(true);
    setInterviewMode(mode);
    setActiveSpeechMode(mode);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 transition-all duration-500 relative">
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
      
      {/* Rest of the component remains the same */}
      <Header
        isInterviewStarted={isInterviewStarted}
        interviewMode={interviewMode}
        timeRemaining={timeRemaining}
        question={question}
        activeView={activeView}
        setActiveView={setActiveView}
        startInterview={startInterview}
      />
      <MainContent
        isInterviewStarted={isInterviewStarted}
        interviewMode={interviewMode}
        activeView={activeView}
        question={question}
        messages={messages}
        streamingMessage={streamingMessage}
        code={code}
        onCodeChange={setCode}
        onSendMessage={handleSendMessage}
        onSubmitCode={handleSubmitCode}
        isProcessing={isProcessing}
        timeRemaining={timeRemaining}
        startInterview={startInterview}
        activeSpeechMode={activeSpeechMode}
      />
      <Footer />
    </div>
  );
}

export default App;
