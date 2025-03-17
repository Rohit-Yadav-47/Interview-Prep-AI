import React from 'react';
import ReactCodeCompiler from '../components/ReactCodeCompiler';
import Chat from '../components/Chat';
import { Message } from '../types';

interface FrontendTestProps {
  messages: Message[];
  streamingMessage: Message | null;
  onSendMessage: (content: string, role?: string) => void;
  isProcessing: boolean;
  enableSpeech: boolean;
}

const FrontendTest: React.FC<FrontendTestProps> = ({
  messages,
  streamingMessage,
  onSendMessage,
  isProcessing,
  enableSpeech
}) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-blue-900/50 shadow-lg h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] overflow-hidden">
      <ReactCodeCompiler 
        darkMode={true} 
        enableSpeech={enableSpeech}
        interviewComponent={
          <div className="w-full h-full overflow-hidden">
            <div className="h-full rounded-xl overflow-hidden border border-purple-500/20 shadow-lg">
              <Chat
                messages={messages}
                streamingMessage={streamingMessage}
                onSendMessage={onSendMessage}
                isProcessing={isProcessing}
                darkMode={true}
                enableSpeech={enableSpeech}
                className="p-2 sm:p-4"
              />
            </div>
          </div>
        }
        className="p-2 sm:p-4"
      />
    </div>
  );
};

export default FrontendTest;
