import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Phone, PhoneOff, Mic, Settings, Maximize, X, Share2, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import VoiceControl from './VoiceControl';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';

interface ChatProps {
  messages: Message[];
  streamingMessage: Message | null;
  onSendMessage: (content: string, role?: 'assistant' | 'user') => void;
  isProcessing: boolean;
  darkMode: boolean;
  enableSpeech?: boolean;
}

export default function Chat({ 
  messages, 
  streamingMessage, 
  onSendMessage, 
  isProcessing,
  darkMode,
  enableSpeech = true
}: ChatProps) {
  const [input, setInput] = useState('');
  const [isCallMode, setIsCallMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState<number[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const lastStreamingContentRef = useRef<string | null>(null);

  // Smoother audio visualization using requestAnimationFrame with a simple throttle
  useEffect(() => {
    if (isCallMode) {
      let animationFrame: number;
      let lastTime = performance.now();
      const updateVisualization = (time: number) => {
        if (time - lastTime >= 100) {
          lastTime = time;
          const newVisualization = Array.from({ length: 20 }, () => Math.random() * 100);
          setAudioVisualization(newVisualization);
        }
        animationFrame = requestAnimationFrame(updateVisualization);
      };
      animationFrame = requestAnimationFrame(updateVisualization);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isCallMode]);

  // Check if we should scroll based on certain conditions
  const shouldScrollToBottom = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    
    const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
    // If already at the bottom, or new messages were added, or 
    // if streaming content changed significantly, then scroll
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    const hasNewMessages = messages.length > lastMessageCountRef.current;
    const streamingContentChanged = streamingMessage?.content && 
      (!lastStreamingContentRef.current || 
       (streamingMessage.content.length - lastStreamingContentRef.current.length) > 10);
    
    return isNearBottom || hasNewMessages || streamingContentChanged;
  }, [messages.length, streamingMessage?.content]);

  // More selective auto-scroll behavior
  useEffect(() => {
    // Update refs for comparison on next render
    lastMessageCountRef.current = messages.length;
    lastStreamingContentRef.current = streamingMessage?.content || null;
    
    // Only scroll when needed
    if (shouldScrollToBottom() && messagesEndRef.current) {
      // Use a short timeout to ensure content is rendered before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, streamingMessage?.content, shouldScrollToBottom]);

  // Focus input field when not processing
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isProcessing]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await onSendMessage(input, 'user');
      setInput('');
      if (containerRef.current) {
        containerRef.current.classList.add('pulse-send');
        setTimeout(() => containerRef.current?.classList.remove('pulse-send'), 1000);
      }
    }
  }, [input, onSendMessage]);

  const handleSpeechResult = useCallback(async (text: string) => {
    if (text.trim()) {
      console.log("Processing speech result:", text);
      await onSendMessage(text, 'user');
    }
  }, [onSendMessage]);

  // Only start interview if speech is enabled
  const startInterview = useCallback(() => {
    if (!enableSpeech) {
      console.log("Speech functionality is disabled in this mode");
      return;
    }
    
    setIsCallMode((prev) => {
      const newMode = !prev;
      if (!prev && messages.length === 0) {
        setTimeout(() => {
          onSendMessage(
            "Hello, Can you feed your resume or what kind of interview are you looking for today?",
            'assistant'
          );
        }, 800);
      }
      return newMode;
    });
  }, [enableSpeech, messages, onSendMessage]);

  const processTextForSpeech = useCallback((text: string): string => {
    let processed = text.replace(/```[\s\S]*?```/g, "I've included a code example that you can see in the text.");
    processed = processed
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/^>\s*(.*?)$/gm, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/#{1,6}\s(.*?)$/gm, "$1")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .replace(/\. \./g, ".")
      .trim();
    processed = processed.replace(/^[-*]\s*(.*?)$/gm, "• $1.");
    const sentences = processed.match(/[^.!?]+[.!?]+/g) || [processed];
    return sentences.join(' ');
  }, []);

  const handleAIResponse = useCallback((text: string) => {
    if (isCallMode || isSpeaking) {
      return processTextForSpeech(text);
    }
    return "";
  }, [isCallMode, isSpeaking, processTextForSpeech]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col  relative perspective-1000 overflow-hidden"
    >
      {/* Animated Background */}
      <div className={`fixed inset-0 bg-grid z-0 ${darkMode ? 'bg-grid-dark' : 'bg-grid-light'} `}>
        <div className="absolute inset-0 bg-gradient-radial z-0 animate-pulse-slow"></div>
      </div>
      
      {/* Top Navigation Bar - Mobile optimized */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 backdrop-blur-md bg-opacity-70 ${darkMode ? 'bg-indigo-900/40' : 'bg-blue-600/40'} text-white p-2 sm:p-4 rounded-b-lg sm:rounded-b-2xl  shadow-neon`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow">
              <Mic size={16} className="text-white sm:hidden" />
              <Mic size={20} className="text-white hidden sm:block" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                  Interview AI
                </span>
              </h2>
              <div className="flex items-center text-[10px] sm:text-xs">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 sm:mr-2 ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                {isProcessing ? 'Processing' : 'Ready'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-3">
            {enableSpeech && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className={`relative group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full ${isCallMode
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                } hover:shadow-glow transition-all duration-300 text-xs sm:text-base`}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-blue-500/20 animate-pulse-slow opacity-80 group-hover:opacity-100"></span>
                {isCallMode ? (
                  <><PhoneOff size={14} className="sm:hidden" /><PhoneOff size={16} className="hidden sm:block" /><span className="hidden sm:inline">End</span><span className="sm:hidden">End</span></>
                ) : (
                  <><PlayCircle size={14} className="sm:hidden" /><PlayCircle size={16} className="hidden sm:block" /><span className="hidden sm:inline">Start Interview</span><span className="sm:inline sm:hidden">Start</span></>
                )}
              </motion.button>
            )}
            <motion.button 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => setShowControls(!showControls)}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Settings size={14} className="sm:hidden" />
              <Settings size={16} className="hidden sm:block" />
            </motion.button>
          </div>
        </div>
        {isCallMode && (
          <div className="absolute bottom-0 left-0 right-0 h-3 sm:h-4 flex items-end justify-center gap-0.5 sm:gap-1 overflow-hidden">
            {audioVisualization.map((value, i) => (
              <div 
                key={i} 
                className="w-0.5 sm:w-1 bg-cyan-400 rounded-t-sm opacity-70"
                style={{ 
                  height: `${value}%`,
                  maxHeight: '20px',
                  transition: 'height 0.1s ease-out'
                }}
              ></div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Floating Controls Menu - Mobile optimized */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute top-16 sm:top-20 right-2 sm:right-4 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-xl shadow-neon p-2 sm:p-3 border border-white/20"
          >
            <div className="flex flex-col space-y-1 sm:space-y-2 min-w-[140px] sm:min-w-[180px]">
              <button className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all text-xs sm:text-sm text-white">
                <Share2 size={14} className="sm:hidden" />
                <Share2 size={16} className="hidden sm:block" />
                <span>Share Conversation</span>
              </button>
              <button className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all text-xs sm:text-sm text-white">
                <Maximize size={14} className="sm:hidden" />
                <Maximize size={16} className="hidden sm:block" />
                <span>Expand View</span>
              </button>
              <div className="border-t border-white/10 my-1"></div>
              <button 
                onClick={() => setShowControls(false)} 
                className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all text-xs sm:text-sm text-white"
              >
                <X size={14} className="sm:hidden" />
                <X size={16} className="hidden sm:block" />
                <span>Close Menu</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container - Mobile optimized */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 ${messages.length === 0 && !streamingMessage ? 'overflow-hidden' : 'overflow-y-auto'} p-3 sm:p-6 space-y-3 sm:space-y-6 z-10  relative ${darkMode ? 'bg-gradient-mesh-dark' : 'bg-gradient-mesh-light'} `}
      >
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
              className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-600/30 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 animate-pulse"></div>
              <Mic size={32} className="text-white/80 sm:hidden" />
              <Mic size={48} className="text-white/80 hidden sm:block" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-8 text-center px-4 w-full flex flex-col items-center"
            >
              <p className="text-base sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                Begin Your Interview
              </p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-100/70">
                Speak or type to start the conversation
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className="mt-3 sm:mt-6 px-4 sm:px-8 py-2 sm:py-3 rounded-full relative group flex items-center justify-center gap-2 mx-auto
                  bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/20 shadow-lg hover:shadow-xl transition-all text-xs sm:text-base"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 animate-pulse-slow opacity-80 group-hover:opacity-100"></span>
                <PlayCircle size={16} className="sm:hidden" />
                <PlayCircle size={18} className="hidden sm:block" />
                <span className="font-medium">Start Interview</span>
              </motion.button>
            </motion.div>
          </div>
        )}
        
        {/* Message Bubbles - Mobile optimized */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.role === 'assistant' ? -20 : 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: (index * 0.05) % 0.2 }}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className="max-w-[90%] sm:max-w-[85%] relative group transition-all duration-300">
                {message.role === 'assistant' && (
                  <div className="absolute -left-1.5 sm:-left-2 -top-1.5 sm:-top-2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-glow z-10">
                    <span className="text-[8px] sm:text-xs font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={`rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg ${message.role === 'assistant'
                    ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm border border-blue-500/20 text-blue-50'
                    : 'bg-gradient-to-br from-cyan-600/40 to-blue-700/40 backdrop-blur-sm border border-cyan-400/20 text-cyan-50 ml-auto'
                  } hover:shadow-glow transition-all duration-300`}
                >
                  <ReactMarkdown className="prose prose-invert max-w-none text-xs sm:text-base
                    prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-blue-500/30
                    prose-code:bg-gray-800/50 prose-code:text-cyan-300 prose-code:border prose-code:border-blue-500/30 prose-code:text-[10px] sm:prose-code:text-sm
                    prose-headings:text-cyan-200 prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline
                    prose-p:text-xs sm:prose-p:text-base"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className={`text-[8px] sm:text-xs text-blue-300/60 mt-0.5 sm:mt-1 ${message.role === 'assistant' ? 'text-left pl-2' : 'text-right pr-2'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Streaming Message Animation - Mobile optimized */}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex ${streamingMessage.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] relative ${streamingMessage.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 text-blue-50'
                : 'bg-gradient-to-br from-cyan-600/40 to-blue-700/40 text-cyan-50 ml-auto'
              } rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-sm border border-blue-500/20 shadow-glow-pulse`}
            >
              {streamingMessage.role === 'assistant' && (
                <div className="absolute -left-1.5 sm:-left-2 -top-1.5 sm:-top-2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-glow animate-pulse">
                  <span className="text-[8px] sm:text-xs font-bold text-white">AI</span>
                </div>
              )}
              <ReactMarkdown className="prose prose-invert max-w-none text-xs sm:text-base
                prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-blue-500/30
                prose-code:bg-gray-800/50 prose-code:text-cyan-300 prose-code:text-[10px] sm:prose-code:text-sm
                prose-headings:text-cyan-200 prose-a:text-cyan-300
                prose-p:text-xs sm:prose-p:text-base"
              >
                {streamingMessage.content}
              </ReactMarkdown>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Mobile optimized */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-20 p-2 sm:p-4 bg-transparent"
      >
        {isCallMode && (
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-glow-green flex items-center gap-1 sm:gap-2 animate-pulse-slow">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs sm:text-sm font-medium text-green-300">Interview Active</span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:gap-4">
          {enableSpeech && (
            <div className="flex justify-center space-x-4">
              <VoiceControl
                onSpeechResult={handleSpeechResult}
                onAIResponse={handleAIResponse}
                isCallMode={isCallMode}
                isSpeaking={isSpeaking}
                setIsSpeaking={setIsSpeaking}
                darkMode={darkMode}
              />
            </div>
          )}
          <div className="relative z-30">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 z-0"></div>
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="relative rounded-xl overflow-hidden backdrop-blur-md border border-white/10 shadow-glow group">
                <input
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isCallMode ? "Speak or type your message..." : "Type your message..."}
                  className="w-full px-3 sm:px-6 py-2.5 sm:py-4 bg-white/5 focus:bg-white/10 text-white placeholder-blue-300/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all duration-300 relative z-10 text-sm"
                  disabled={isProcessing}
                />
                <div className="absolute inset-y-0 right-0 pr-1 flex items-center gap-2 z-20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={(!input.trim() && !isCallMode) || isProcessing}
                    className={`mr-1 sm:mr-2 h-8 w-8 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center ${((!input.trim() && !isCallMode) || isProcessing) 
                      ? 'bg-blue-500/30 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer hover:shadow-glow'
                    } transition-all duration-300`}
                  >
                    <Send size={16} className="text-white sm:hidden" />
                    <Send size={20} className="text-white hidden sm:block" />
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
          {isCallMode && messages.length > 0 && enableSpeech && (
            <div className="text-center text-[10px] sm:text-xs text-blue-300/60">
              Click the input field to type your response or use voice controls
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Global Styles - Keep existing and add mobile optimizations */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .bg-grid {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .bg-grid {
            background-size: 50px 50px;
          }
        }
        .bg-grid-dark { background-color: #0a0a20; }
        .bg-grid-light {
          background-color: #f0f5ff;
          background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
        }
        
        /* Mobile-optimized styles */
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          margin-top: 6px;
        }
        
        .typing-indicator span {
          display: inline-block;
          height: 6px;
          width: 6px;
          margin: 0 2px;
          background-color: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @media (min-width: 640px) {
          .typing-indicator span {
            height: 8px;
            width: 8px;
            margin: 0 3px;
          }
          .typing-indicator {
            padding: 10px 0;
            margin-top: 8px;
          }
        }
        
        /* Responsive prose adjustments */
        .prose pre {
          font-size: 0.75rem;
          padding: 0.75rem;
          margin: 0.5rem auto;
          text-align: left;
          max-width: 100%;
          overflow-x: auto;
          border-radius: 0.5rem;
        }
        
        .prose code {
          text-align: left;
          display: inline-block;
        }
        
        .prose p {
          text-align: left;
          margin: 0.75rem 0;
        }
        
        @media (min-width: 640px) {
          .prose pre {
            font-size: 0.875rem;
            padding: 1rem;
            margin: 0.75rem auto;
            border-radius: 0.75rem;
          }
          .prose p {
            margin: 1rem 0;
          }
        }
      `}</style>
    </div>
  );
}
