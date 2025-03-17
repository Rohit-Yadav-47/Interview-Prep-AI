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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll to bottom when messages update or during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage?.content]);

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
      className="flex flex-col h-full relative perspective-1000 overflow-hidden"
    >
      {/* Animated Background */}
      <div className={`fixed inset-0 bg-grid z-0 ${darkMode ? 'bg-grid-dark' : 'bg-grid-light'}`}>
        <div className="absolute inset-0 bg-gradient-radial z-0 animate-pulse-slow"></div>
      </div>
      
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 backdrop-blur-md bg-opacity-70 ${darkMode ? 'bg-indigo-900/40' : 'bg-blue-600/40'} text-white p-4 rounded-b-2xl shadow-neon`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow">
              <Mic size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                  Interview AI
                </span>
              </h2>
              <div className="flex items-center text-xs">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                {isProcessing ? 'Processing' : 'Ready'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {enableSpeech && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-full ${isCallMode
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                } hover:shadow-glow transition-all duration-300`}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-blue-500/20 animate-pulse-slow opacity-80 group-hover:opacity-100"></span>
                {isCallMode ? (
                  <><PhoneOff size={16} /> <span>End Interview</span></>
                ) : (
                  <><PlayCircle size={16} /> <span>Start Interview</span></>
                )}
              </motion.button>
            )}
            <motion.button 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => setShowControls(!showControls)}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <Settings size={16} />
            </motion.button>
          </div>
        </div>
        {isCallMode && (
          <div className="absolute bottom-0 left-0 right-0 h-4 flex items-end justify-center gap-1 overflow-hidden">
            {audioVisualization.map((value, i) => (
              <div 
                key={i} 
                className="w-1 bg-cyan-400 rounded-t-sm opacity-70"
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
      
      {/* Floating Controls Menu */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute top-20 right-4 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-xl shadow-neon p-3 border border-white/20"
          >
            <div className="flex flex-col space-y-2 min-w-[180px]">
              <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all text-sm text-white">
                <Share2 size={16} />
                <span>Share Conversation</span>
              </button>
              <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all text-sm text-white">
                <Maximize size={16} />
                <span>Expand View</span>
              </button>
              <div className="border-t border-white/10 my-1"></div>
              <button 
                onClick={() => setShowControls(false)} 
                className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all text-sm text-white"
              >
                <X size={16} />
                <span>Close Menu</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div 
        className={`flex-1 ${messages.length === 0 && !streamingMessage ? 'overflow-hidden' : 'overflow-y-auto'} p-6 space-y-6 z-10 relative ${darkMode ? 'bg-gradient-mesh-dark' : 'bg-gradient-mesh-light'}`}
      >
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-600/30 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 animate-pulse"></div>
              <Mic size={48} className="text-white/80" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                Begin Your Interview
              </p>
              <p className="mt-2 text-sm text-blue-100/70">
                Speak or type to start the conversation
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className={`mt-6 px-6 py-3 rounded-full relative group flex items-center justify-center gap-2
                  bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/20 shadow-lg hover:shadow-xl transition-all`}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 animate-pulse-slow opacity-80 group-hover:opacity-100"></span>
                <PlayCircle size={18} />
                <span className="font-medium">Start Interview Session</span>
              </motion.button>
            </motion.div>
          </div>
        )}
        
        {/* Message Bubbles */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.role === 'assistant' ? -20 : 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: (index * 0.05) % 0.2 }}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className="max-w-[85%] relative group transition-all duration-300">
                {message.role === 'assistant' && (
                  <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-glow z-10">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 shadow-lg ${message.role === 'assistant'
                    ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm border border-blue-500/20 text-blue-50'
                    : 'bg-gradient-to-br from-cyan-600/40 to-blue-700/40 backdrop-blur-sm border border-cyan-400/20 text-cyan-50 ml-auto'
                  } hover:shadow-glow transition-all duration-300`}
                >
                  <ReactMarkdown className="prose prose-invert max-w-none
                    prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-blue-500/30
                    prose-code:bg-gray-800/50 prose-code:text-cyan-300 prose-code:border prose-code:border-blue-500/30
                    prose-headings:text-cyan-200 prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className={`text-xs text-blue-300/60 mt-1 ${message.role === 'assistant' ? 'text-left pl-2' : 'text-right pr-2'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Streaming Message Animation */}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex ${streamingMessage.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] relative ${streamingMessage.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 text-blue-50'
                : 'bg-gradient-to-br from-cyan-600/40 to-blue-700/40 text-cyan-50 ml-auto'
              } rounded-2xl p-4 backdrop-blur-sm border border-blue-500/20 shadow-glow-pulse`}
            >
              {streamingMessage.role === 'assistant' && (
                <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-glow animate-pulse">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
              )}
              <ReactMarkdown className="prose prose-invert max-w-none
                prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-blue-500/30
                prose-code:bg-gray-800/50 prose-code:text-cyan-300
                prose-headings:text-cyan-200 prose-a:text-cyan-300"
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

      {/* Input Section */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-20 p-4 bg-transparent"
      >
        {isCallMode && (
          <div className="flex items-center justify-center mb-4">
            <div className="px-3 py-1.5 rounded-full backdrop-blur-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-glow-green flex items-center gap-2 animate-pulse-slow">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium text-green-300">Interview Active</span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
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
                  className="w-full px-6 py-4 bg-white/5 focus:bg-white/10 text-white placeholder-blue-300/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all duration-300 relative z-10"
                  disabled={isProcessing}
                />
                <div className="absolute inset-y-0 right-0 pr-1 flex items-center gap-2 z-20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={(!input.trim() && !isCallMode) || isProcessing}
                    className={`mr-2 h-12 w-12 rounded-lg flex items-center justify-center ${((!input.trim() && !isCallMode) || isProcessing) 
                      ? 'bg-blue-500/30 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer hover:shadow-glow'
                    } transition-all duration-300`}
                  >
                    <Send size={20} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
          {isCallMode && messages.length > 0 && enableSpeech && (
            <div className="text-center text-xs text-blue-300/60">
              Click the input field to type your response or use voice controls
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Global Styles */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .bg-grid {
          background-size: 50px 50px;
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          pointer-events: none;
        }
        .bg-grid-dark { background-color: #0a0a20; }
        .bg-grid-light {
          background-color: #f0f5ff;
          background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
        }
        .bg-gradient-mesh-dark {
          background-color: #0a0a20;
          background-image: radial-gradient(circle at 15% 50%, #1a103080 0%, transparent 25%),
                           radial-gradient(circle at 85% 30%, #10205080 0%, transparent 25%);
        }
        .bg-gradient-mesh-light {
          background-color: #f0f5ff;
          background-image: radial-gradient(circle at 15% 50%, #e0e8ff80 0%, transparent 25%),
                           radial-gradient(circle at 85% 30%, #d5e5ff80 0%, transparent 25%);
        }
        .shadow-neon { box-shadow: 0 0 15px 0 rgba(56, 189, 248, 0.3); }
        .shadow-glow {
          box-shadow: 0 0 10px 0 rgba(56, 189, 248, 0.3),
                      0 0 20px 0 rgba(56, 189, 248, 0.15);
        }
        .shadow-glow-pulse {
          box-shadow: 0 0 10px 0 rgba(56, 189, 248, 0.3);
          animation: pulse-shadow 2s infinite;
        }
        .shadow-glow-green {
          box-shadow: 0 0 10px 0 rgba(16, 185, 129, 0.3),
                      0 0 20px 0 rgba(16, 185, 129, 0.15);
        }
        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 10px 0 rgba(56, 189, 248, 0.3); }
          50% { box-shadow: 0 0 20px 0 rgba(56, 189, 248, 0.5); }
          100% { box-shadow: 0 0 10px 0 rgba(56, 189, 248, 0.3); }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, transparent 0%, #0a0a2050 70%);
          pointer-events: none;
        }
        .pulse-send { animation: pulse-once 0.5s; }
        @keyframes pulse-once { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .typing-indicator {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: rgba(56, 189, 248, 0.7);
          border-radius: 50%;
          opacity: 0.4;
        }
        .typing-indicator span:nth-of-type(1) { animation: 1s blink infinite 0.3333s; }
        .typing-indicator span:nth-of-type(2) { animation: 1s blink infinite 0.6666s; }
        .typing-indicator span:nth-of-type(3) { animation: 1s blink infinite 0.9999s; }
        @keyframes blink { 50% { opacity: 1; } }
        /* Hide native scrollbar */
        ::-webkit-scrollbar { display: none; }
        form, input, button { position: relative; }
      `}</style>
    </div>
  );
}
