import React, { useState, useCallback } from 'react';
import CodingInterview from './CodingInterview';
import { Message, CodingQuestion } from '../types';

// Sample coding question for demonstration
const sampleQuestion: CodingQuestion = {
  id: '1',
  title: 'Implement a Counter Component',
  description: 'Create a simple counter component with increment and decrement buttons.',
  difficulty: 'easy',
  timeLimit: 30 * 60, // 30 minutes in seconds
};

const InterviewApp: React.FC = () => {
  // State for managing messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [code, setCode] = useState<string>('// Write your code here');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Reset timer when chat is reset
  const [timeRemaining, setTimeRemaining] = useState<number>(sampleQuestion.timeLimit);
  
  // Handle message sending with special case for reset command
  const handleSendMessage = useCallback((content: string, role: string = 'user') => {
    // Handle reset command
    if (content === "__RESET_CONVERSATION__" && role === "system") {
      console.log("Resetting conversation...");
      setMessages([]);
      setStreamingMessage(null);
      // If needed, reset other states like code or timer
      return;
    }
    
    // Normal message handling
    setIsProcessing(true);
    
    // Create the new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: role as 'assistant' | 'user' | 'system',
      timestamp: new Date()
    };
    
    // Add user message immediately
    if (role === 'user') {
      setMessages(prev => [...prev, newMessage]);
    }
    
    // Simulate API call for assistant response
    setTimeout(() => {
      if (role === 'user') {
        // Create mock assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I've received your message: "${content}". How can I help with your code?`,
          role: 'assistant',
          timestamp: new Date()
        };
        
        // Stream the response
        setStreamingMessage(assistantMessage);
        
        // After "streaming", add to messages and clear streaming
        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage(null);
          setIsProcessing(false);
        }, 1000);
      } else {
        setMessages(prev => [...prev, newMessage]);
        setIsProcessing(false);
      }
    }, 500);
  }, []);
  
  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  // Handle code submission
  const handleSubmitCode = () => {
    setIsProcessing(true);
    
    // Simulate code evaluation
    setTimeout(() => {
      handleSendMessage(
        "I've received your code submission. Great job!",
        'assistant'
      );
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Coding Interview</h1>
      
      <CodingInterview
        messages={messages}
        streamingMessage={streamingMessage}
        question={sampleQuestion}
        code={code}
        onCodeChange={handleCodeChange}
        onSendMessage={handleSendMessage}
        onSubmitCode={handleSubmitCode}
        isProcessing={isProcessing}
        timeRemaining={timeRemaining}
        enableSpeech={true}
      />
    </div>
  );
};

export default InterviewApp;
