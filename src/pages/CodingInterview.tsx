import React, { useState } from 'react';
import Chat from '../components/Chat';
import CodeEditor from '../components/CodeEditor';
import { Message, CodingQuestion } from '../types';
import { LayoutGrid, MessageSquare, Code } from 'lucide-react';

interface CodingInterviewProps {
  messages: Message[];
  streamingMessage: Message | null;
  question: CodingQuestion | null;
  code: string;
  onCodeChange: (code: string) => void;
  onSendMessage: (content: string, role?: string) => void;
  onSubmitCode: () => void;
  isProcessing: boolean;
  timeRemaining: number;
  enableSpeech: boolean;
}

const CodingInterview: React.FC<CodingInterviewProps> = ({
  messages,
  streamingMessage,
  question,
  code,
  onCodeChange,
  onSendMessage,
  onSubmitCode,
  isProcessing,
  timeRemaining,
  enableSpeech
}) => {
  const [activeView, setActiveView] = useState('split'); // 'split', 'chat', 'code'
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] pb-4">
      {/* View toggle buttons - improved for mobile */}
      <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
        <div className="flex p-1 sm:p-1.5 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/50">
          <button
            onClick={() => setActiveView('split')}
            className={`p-1.5 sm:p-2 px-3 sm:px-5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2.5 ${
              activeView === 'split' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Split View"
          >
            <LayoutGrid size={18} className={activeView === 'split' ? 'text-blue-200' : ''} />
            <span className="font-medium text-sm sm:text-base whitespace-nowrap">Split View</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`p-1.5 sm:p-2 px-3 sm:px-5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2.5 ${
              activeView === 'chat' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Chat View"
          >
            <MessageSquare size={18} className={activeView === 'chat' ? 'text-blue-200' : ''} />
            <span className="font-medium text-sm sm:text-base whitespace-nowrap">Chat View</span>
          </button>
          <button
            onClick={() => setActiveView('code')}
            className={`p-1.5 sm:p-2 px-3 sm:px-5 rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2.5 ${
              activeView === 'code' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Code View"
          >
            <Code size={18} className={activeView === 'code' ? 'text-blue-200' : ''} />
            <span className="font-medium text-sm sm:text-base whitespace-nowrap">Code View</span>
          </button>
        </div>
      </div>

      {/* Main content area - improved responsiveness */}
      <div className={`flex-1 flex ${activeView !== 'split' ? 'flex-col' : ''} gap-4 sm:gap-6 overflow-hidden`}>
        <div 
          className={`
            ${activeView === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-full w-full' : 'h-full w-full flex flex-col'} 
            ${activeView === 'chat' ? 'block h-full' : ''} 
            ${activeView === 'code' ? 'block h-full' : ''}
          `}
        >
          {/* Show chat in both split and chat views */}
          {(activeView === 'split' || activeView === 'chat') && (
            <div className={`
              bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden 
              border border-blue-900/60 shadow-2xl
              ${activeView === 'split' ? 'h-full' : 'h-full flex-1'}
              transition-all duration-300 ease-in-out
              hover:shadow-blue-900/20 hover:shadow-2xl
              flex flex-col
              ${activeView === 'split' ? 'order-2 md:order-1' : ''}
            `}>
              <Chat
                messages={messages}
                streamingMessage={streamingMessage}
                onSendMessage={onSendMessage}
                isProcessing={isProcessing}
                darkMode={true}
                enableSpeech={enableSpeech}
              />
            </div>
          )}
          
          {/* Show code editor in both split and code views */}
          {(activeView === 'split' || activeView === 'code') && (
            <div className={`
              bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden 
              border border-blue-900/60 shadow-2xl
              ${activeView === 'split' ? 'h-full' : 'h-full flex-1'}
              transition-all duration-300 ease-in-out
              hover:shadow-blue-900/20 hover:shadow-2xl
              flex flex-col
              ${activeView === 'split' ? 'order-1 md:order-2' : ''}
            `}>
              <CodeEditor
                question={question}
                code={code}
                onCodeChange={onCodeChange}
                onSubmit={onSubmitCode}
                timeRemaining={timeRemaining}
                isProcessing={isProcessing}
                darkMode={true}
                isInterviewStarted={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingInterview;
