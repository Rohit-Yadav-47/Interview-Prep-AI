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
  // Remove onResetChat prop
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
  // Remove onResetChat from props
}) => {
  const [activeView, setActiveView] = useState('split'); // 'split', 'chat', 'code'
  
  // Remove handleResetChat function

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-4">
      {/* View toggle buttons - styled as modern tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex p-1.5 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/50">
          <button
            onClick={() => setActiveView('split')}
            className={`p-2 px-5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${
              activeView === 'split' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Split View"
          >
            <LayoutGrid size={20} className={activeView === 'split' ? 'text-blue-200' : ''} />
            <span className="font-medium">Split View</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`p-2 px-5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${
              activeView === 'chat' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Chat View"
          >
            <MessageSquare size={20} className={activeView === 'chat' ? 'text-blue-200' : ''} />
            <span className="font-medium">Chat View</span>
          </button>
          <button
            onClick={() => setActiveView('code')}
            className={`p-2 px-5 rounded-lg transition-all duration-200 flex items-center gap-2.5 ${
              activeView === 'code' 
                ? 'bg-blue-600/50 text-white shadow-inner border border-blue-500/40' 
                : 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
            }`}
            title="Code View"
          >
            <Code size={20} className={activeView === 'code' ? 'text-blue-200' : ''} />
            <span className="font-medium">Code View</span>
          </button>
        </div>
      </div>

      {/* Main content area - maximized height */}
      <div className={`flex-1 flex ${activeView !== 'split' ? 'flex-col' : ''} gap-6 overflow-hidden`}>
        <div 
          className={`
            ${activeView === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 h-full w-full' : 'h-full w-full flex flex-col'} 
            ${activeView === 'chat' ? 'block h-full' : ''} 
            ${activeView === 'code' ? 'block h-full' : ''}
          `}
        >
          {(activeView === 'split' || activeView === 'chat') && (
            <div className={`
              bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden 
              border border-blue-900/60 shadow-2xl
              ${activeView === 'split' ? 'h-full' : 'h-full flex-1'}
              transition-all duration-300 ease-in-out
              hover:shadow-blue-900/20 hover:shadow-2xl
              flex flex-col
            `}>
              <Chat
                messages={messages}
                streamingMessage={streamingMessage}
                onSendMessage={onSendMessage}
                // Remove onResetChat={onResetChat} - the component will use its own reload logic
                isProcessing={isProcessing}
                darkMode={true}
                enableSpeech={enableSpeech}
              />
            </div>
          )}
          
          {(activeView === 'split' || activeView === 'code') && (
            <div className={`
              bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden 
              border border-blue-900/60 shadow-2xl
              ${activeView === 'split' ? 'h-full' : 'h-full flex-1'}
              transition-all duration-300 ease-in-out
              hover:shadow-blue-900/20 hover:shadow-2xl
              flex flex-col
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
