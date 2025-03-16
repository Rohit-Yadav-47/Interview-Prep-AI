import React from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle, Brain, Loader } from 'lucide-react';
import { CodingQuestion } from '../types';
import { motion } from 'framer-motion';

interface CodeEditorProps {
  question: CodingQuestion | null;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  timeRemaining: number;
  darkMode: boolean;
  isLoading?: boolean;
  isInterviewStarted?: boolean;
}

export default function CodeEditor({
  question,
  code,
  onCodeChange,
  onSubmit,
  timeRemaining,
  darkMode,
  isLoading = false,
  isInterviewStarted = false,
}: CodeEditorProps) {
  // Helper to determine what content to show in the description area
  const renderDescription = () => {
    if (isLoading) {
      return <p className="text-indigo-100/80">Preparing your coding challenge...</p>;
    }
    
    if (question) {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-indigo-100/90">{question.description}</p>
        </div>
      );
    }
    
    if (isInterviewStarted) {
      return (
        <p className="italic text-indigo-100/80">
          The interviewer will present a coding challenge soon. You can start typing code in the editor below to prepare.
        </p>
      );
    }
  };

  return (
    <div className="flex flex-col h-full relative perspective-1000 overflow-hidden">
      {/* Animated Background */}
      <div className={`fixed inset-0 bg-grid z-0 ${darkMode ? 'bg-grid-dark' : 'bg-grid-light'}`}>
        <div className="absolute inset-0 bg-gradient-radial z-0 animate-pulse-slow"></div>
      </div>

      {/* Question description area */}
      {(question || isInterviewStarted || isLoading) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`z-10 p-4 backdrop-blur-md ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50/60'} border-b ${darkMode ? 'border-blue-500/20' : 'border-blue-200/40'} shadow-inner`}
        >
          <div className="max-w-3xl mx-auto">
            {renderDescription()}
          </div>
        </motion.div>
      )}

      <div className="flex-1 relative z-10">
        {/* Editor component with improved styling */}
        <div className="absolute inset-0 backdrop-blur-sm bg-opacity-30 border border-blue-500/10 shadow-inner">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme={darkMode ? "vs-dark" : "light"}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontFamily: "'Fira Code', 'Droid Sans Mono', 'monospace'",
              fontLigatures: true,
              padding: { top: 10 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: true,
              roundedSelection: true,
              renderLineHighlight: 'all',
            }}
          />
        </div>
      </div>

      {/* Fixed bottom bar with submit button */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className={`relative z-20 py-4 px-6 backdrop-blur-md ${darkMode ? 'bg-indigo-900/30' : 'bg-blue-100/50'} border-t ${darkMode ? 'border-blue-500/20' : 'border-blue-200/40'}`}
      >
        <div className="flex justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            disabled={isLoading}
            className={`px-10 py-3 rounded-lg relative group flex items-center justify-center gap-2 transition-all
              ${darkMode 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              } text-white font-medium shadow-glow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0`}
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse-slow opacity-80 group-hover:opacity-100"></span>
            <div className="flex items-center justify-center mb-6">
              {isLoading ? (
                <Loader size={18} className="animate-spin mr-2" />
              ) : (
                <CheckCircle size={18} className="mr-2" />
              )}
              <span className="font-medium">Submit Solution</span>
            </div>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Global Styles - matching those from Chat component */}
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
        .shadow-neon { box-shadow: 0 0 15px 0 rgba(56, 189, 248, 0.3); }
        .shadow-glow {
          box-shadow: 0 0 10px 0 rgba(56, 189, 248, 0.3),
                      0 0 20px 0 rgba(56, 189, 248, 0.15);
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, transparent 0%, #0a0a2050 70%);
          pointer-events: none;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}