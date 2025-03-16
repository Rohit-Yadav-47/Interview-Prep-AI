import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Activity, RotateCw } from 'lucide-react';
import { SpeechHandler } from '../lib/speech';

interface VoiceControlProps {
  onSpeechResult: (text: string) => void;
  onAIResponse: (text: string) => string;
  isCallMode?: boolean;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  darkMode: boolean;
}

export default function VoiceControl({ 
  onSpeechResult, 
  onAIResponse, 
  isCallMode = false,
  isSpeaking,
  setIsSpeaking,
  darkMode
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [reloadingVoices, setReloadingVoices] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false); // Track when AI is actively speaking
  
  // Add a new ref to track user-initiated mic changes
  const userInitiatedActionRef = useRef(false);
  const micToggleInProgressRef = useRef(false);
  // Add a ref to track mic state before AI started speaking
  const micStateBeforeAISpeakingRef = useRef(false);
  
  const speechHandlerRef = useRef<SpeechHandler | null>(null);
  const currentStreamSpeechRef = useRef<string>('');
  const lastProcessedLengthRef = useRef<number>(0);
  
  // Initialize the speech handler
  useEffect(() => {
 
    
    const handler = new SpeechHandler((text) => {
      if (text.trim()) {
        onSpeechResult(text);
        if (!isCallMode) {
          setIsListening(false);
        }
      }
    });
    
    speechHandlerRef.current = handler;
    setRecognitionSupported(handler.isRecognitionSupported());
    
    // Short delay to ensure initialization completes


    return () => {
      if (handler) {
        handler.stopListening();
      }
    };
  }, [onSpeechResult, isCallMode]);

  // Handle call mode changes
  useEffect(() => {
    const handler = speechHandlerRef.current;
    if (!handler) return;
    
    // Only auto-start listening if the user hasn't manually toggled the mic
    if (isCallMode && !userInitiatedActionRef.current) {
      if (!isListening) {
        setTimeout(() => {
          if (handler && !isListening && !userInitiatedActionRef.current) {
            handler.startListening();
            setIsListening(true);
          }
        }, 500); // Add delay to ensure clean state
      }
      setIsSpeaking(true);
    } else if (!isCallMode && isListening && !userInitiatedActionRef.current) {
      handler.stopListening();
      setIsListening(false);
    }
  }, [isCallMode, isListening, setIsSpeaking]);

  // Listen for speech events
  useEffect(() => {
    const handleSpeechStarted = () => {
      setIsSpeechActive(true);
      setIsAISpeaking(true);
      
      // Save current mic state before pausing
      micStateBeforeAISpeakingRef.current = isListening;
      
      // Always pause listening when AI speaks to prevent feedback
      if (speechHandlerRef.current && isListening) {
        speechHandlerRef.current.pauseListening();
        // We don't change isListening state here to remember it was on
      }
    };
    
    const handleSpeechEnded = () => {
      setIsSpeechActive(false);
      
      // Use timeout to prevent rapid state changes
      setTimeout(() => {
        setIsAISpeaking(false);
        
        // Resume listening if it was active before AI started speaking
        if (speechHandlerRef.current && micStateBeforeAISpeakingRef.current) {
          setTimeout(() => {
            if (speechHandlerRef.current && !micToggleInProgressRef.current) {
              speechHandlerRef.current.resumeListening();
              // No need to update isListening state as it wasn't changed
            }
          }, 500);
        }
      }, 200);
    };
    
    // Only update listening state from event if not user-initiated
    const handleListeningChanged = (e: any) => {
      if (!userInitiatedActionRef.current) {
        setIsListening(e.detail.isListening);
      }
    };
    
    window.addEventListener('speech-started', handleSpeechStarted);
    window.addEventListener('speech-ended', handleSpeechEnded);
    window.addEventListener('speech-listening-changed', handleListeningChanged);
    
    return () => {
      window.removeEventListener('speech-started', handleSpeechStarted);
      window.removeEventListener('speech-ended', handleSpeechEnded);
      window.removeEventListener('speech-listening-changed', handleListeningChanged);
    };
  }, [isCallMode, isListening]);

  const toggleListening = useCallback(() => {
    const handler = speechHandlerRef.current;
    if (!handler || isAISpeaking || micToggleInProgressRef.current) return;

    // Set the user-initiated flag to prevent auto-behavior from interfering
    userInitiatedActionRef.current = true;
    micToggleInProgressRef.current = true;
    
    if (isListening) {
      handler.stopListening();
      setIsListening(false);
    } else {
      handler.startListening();
      setIsListening(true);
    }
    
    // Reset the flag after a delay
    setTimeout(() => {
      userInitiatedActionRef.current = false;
      micToggleInProgressRef.current = false;
    }, 2000);
  }, [isListening, isAISpeaking]);

  const toggleSpeaking = useCallback(() => {
    setIsSpeaking(!isSpeaking);
    
    // Only start if not listening
    if (!isSpeaking && isCallMode && !isListening && speechHandlerRef.current) {
      speechHandlerRef.current.startListening();
      setIsListening(true);
    }
  }, [isSpeaking, setIsSpeaking, isCallMode, isListening]);

  // Process streaming speech from AI - simplify to reduce state transitions
  const processStreamingSpeech = useCallback((text: string, isStreaming: boolean) => {
    const handler = speechHandlerRef.current;
    if (!handler || (!isSpeaking && !isCallMode)) return;

    // Simplify handling to avoid frequent state changes
    if (isStreaming) {
      // Only process complete sentences to avoid too many speech segments
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      if (!sentences || sentences.length === 0) return;
      
      const textToSpeak = onAIResponse(text);
      if (textToSpeak) {
        if (isListening) {
          handler.pauseListening();
        }
        handler.speakStreaming(textToSpeak, false);
        setIsAISpeaking(true);
      }
    } else {
      // For complete messages
      const textToSpeak = onAIResponse(text);
      if (textToSpeak) {
        if (isListening) {
          handler.pauseListening();
        }
        setIsAISpeaking(true);
        handler.speak(textToSpeak).then(() => {
          setIsAISpeaking(false);
          if (isCallMode && isListening && handler) {
            setTimeout(() => handler.resumeListening(), 1000);
          }
        });
      }
    }
    
    // Reset streaming state
    lastProcessedLengthRef.current = 0;
  }, [isCallMode, isListening, isSpeaking, onAIResponse]);

  // Connect to the AI message event with streaming support
  useEffect(() => {
    const handleNewAIMessage = (e: any) => {
      const { messages, isStreaming, streamContent } = e.detail;
      
      // Only process streaming content if there's actual new content
      if (isStreaming && streamContent) {
        // Only process if we have actual content and it's not already being processed
        if (streamContent && streamContent.trim() !== '') {
          processStreamingSpeech(streamContent, true);
        }
      } else {
        // For completed messages, only process the last one and only if not streamed already
        const assistantMsgs = messages.filter((m: any) => m.role === 'assistant');
        if (assistantMsgs.length > 0) {
          const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1];
          
          // Check if this is a new message we haven't spoken yet
          if (lastAssistantMsg.content && 
              !window.sessionStorage.getItem(`spoken-${lastAssistantMsg.content.substring(0, 50)}`)) {
            processStreamingSpeech(lastAssistantMsg.content, false);
            // Mark this message as spoken to prevent duplicates
            window.sessionStorage.setItem(`spoken-${lastAssistantMsg.content.substring(0, 50)}`, 'true');
          }
        }
      }
    };
    
    // Remove any existing listeners before adding a new one
    window.removeEventListener('new-ai-message', handleNewAIMessage);
    window.addEventListener('new-ai-message', handleNewAIMessage);
    
    return () => window.removeEventListener('new-ai-message', handleNewAIMessage);
  }, [processStreamingSpeech]);
  
  // Reload voices function - useful if voices didn't load correctly
  const reloadVoices = () => {
    if (!speechHandlerRef.current || reloadingVoices) return;
    
    setReloadingVoices(true);
    speechHandlerRef.current.reloadVoices();
    
    setTimeout(() => {
      setReloadingVoices(false);
    }, 1500);
  };



  if (!recognitionSupported) {
    return (
      <div className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
        Speech recognition not supported in your browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isSpeechActive && (
        <div className="flex items-center mr-2">
          <Activity size={16} className="text-green-500 dark:text-accent-green animate-pulse mr-1" />
          <span className="text-xs font-medium text-green-500 dark:text-accent-green">Speaking...</span>
        </div>
      )}
      
      <button
        onClick={toggleListening}
        className={`p-2 rounded-lg ${
          isListening && !isAISpeaking
            ? 'bg-red-500 dark:bg-accent-red' 
            : 'bg-blue-500 dark:bg-accent-blue'
        } text-white hover:opacity-90 transition-opacity ${
          isAISpeaking ? 'opacity-50 cursor-not-allowed' : ''
        } relative`}
        title={isListening ? (isAISpeaking ? 'Mic temporarily muted while AI speaks' : 'Stop listening') : 'Start listening'}
        disabled={isAISpeaking}
      >
        {isListening && !isAISpeaking ? <MicOff size={20} /> : <Mic size={20} />}
        {isListening && !isAISpeaking && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-accent-red rounded-full animate-ping"></span>
        )}
      </button>
      
      <button
        onClick={toggleSpeaking}
        className={`p-2 rounded-lg ${
          isSpeaking 
            ? 'bg-green-500 dark:bg-accent-green' 
            : 'bg-gray-500 dark:bg-dark-500'
        } text-white hover:opacity-90 transition-opacity`}
        title={isSpeaking ? 'Disable AI voice' : 'Enable AI voice'}
      >
        {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      
      <button
        onClick={reloadVoices}
        className={`p-2 rounded-lg ${
          darkMode 
            ? 'bg-dark-400 text-gray-200 hover:bg-dark-500' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${reloadingVoices ? 'animate-spin' : ''}`}
        title="Reload voices (if speech quality is poor)"
        disabled={reloadingVoices}
      >
        <RotateCw size={16} />
      </button>
    </div>
  );
}