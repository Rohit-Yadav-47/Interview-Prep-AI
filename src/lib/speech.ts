export class SpeechHandler {
  private recognition: any;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private isListening = false;
  private isPaused = false;
  private onSpeechResult: (text: string) => void;
  private speechQueue: string[] = [];
  private isSpeaking = false;
  private speechEnqueued = false;
  private lastRecognizedText = ''; // Track last recognized text to prevent duplicates
  private recognitionTimeout: any = null; // For debouncing recognition restarts
  private static instance: SpeechHandler | null = null; // Singleton instance
  
  constructor(onSpeechResult: (text: string) => void) {
    // If an instance already exists, return it (singleton pattern)
    if (SpeechHandler.instance) {
      SpeechHandler.instance.onSpeechResult = onSpeechResult;
      return SpeechHandler.instance;
    }
    
    SpeechHandler.instance = this;
    this.onSpeechResult = onSpeechResult;
    this.synth = window.speechSynthesis;
    this.voices = [];
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const text = result[0].transcript;
          
          // Prevent duplicate recognition by comparing with last processed text
          if (text !== this.lastRecognizedText) {
            this.lastRecognizedText = text;
            this.onSpeechResult(text);
          }
        }
      };
      
      // Add error handler to prevent repeated restarts
      this.recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        // Only change state if it's a fatal error
        if (event.error === 'network' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.isPaused = false;
          window.dispatchEvent(new CustomEvent('speech-listening-changed', { 
            detail: { isListening: false } 
          }));
        }
      };
      
      // Handle end events to prevent auto-restart loops
      this.recognition.onend = () => {
        // Clear any existing timeout to prevent multiple restarts
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }
        
        // Only restart if we're supposed to be listening and not paused
        if (this.isListening && !this.isPaused) {
          // Add delay to prevent rapid restart cycles and clear buffer
          this.recognitionTimeout = setTimeout(() => {
            if (this.isListening && !this.isPaused) {
              try {
                console.log("Restarting speech recognition...");
                this.lastRecognizedText = ''; // Reset last text when restarting
                this.recognition.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
                this.isListening = false;
                window.dispatchEvent(new CustomEvent('speech-listening-changed', { 
                  detail: { isListening: false } 
                }));
              }
            }
          }, 500); // Longer delay to ensure proper cleanup
        }
      };
    }
    
    // Some browsers (like Chrome) load voices asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = this.loadVoices.bind(this);
    } else {
      this.loadVoices();
    }
  }
  
  // Get singleton instance
  public static getInstance(onSpeechResult: (text: string) => void): SpeechHandler {
    if (!SpeechHandler.instance) {
      return new SpeechHandler(onSpeechResult);
    }
    
    // Update the callback if provided
    if (onSpeechResult) {
      SpeechHandler.instance.onSpeechResult = onSpeechResult;
    }
    
    return SpeechHandler.instance;
  }
  
  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    
    // First priority: High-quality neural female voices with expanded keywords
    const neuralKeywords = ['neural', 'premium', 'enhanced', 'wavenet', 'natural', 'studio', 
                           'realistic', 'plus', 'professional', 'ultra', 'advanced', 'hd', 
                           'high quality', 'clear', 'refined', 'expressive', 'nuance', 'lifelike'];
    const femaleIdentifiers = ['female', 'woman', 'girl', 'samantha', 'karen', 'allison', 'amy', 
                              'lisa', 'victoria', 'zira', 'siri', 'alexa', 'madison', 'emma', 
                              'joanna', 'olivia', 'nicole', 'jennifer', 'kate', 'heather', 'sophia'];
    
    // First pass: Look for explicitly high-quality neural female voices
    this.preferredVoice = this.voices.find(voice => 
      femaleIdentifiers.some(term => voice.name.toLowerCase().includes(term)) && 
      (voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en-AU')) &&
      neuralKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
    );
    
    // Second pass: Look for top-tier providers with premium female voices
    if (!this.preferredVoice) {
      const premiumProviders = ['google', 'microsoft', 'apple', 'amazon', 'nuance', 'ibm', 'deepmind'];
      this.preferredVoice = this.voices.find(voice => 
        femaleIdentifiers.some(term => voice.name.toLowerCase().includes(term)) && 
        (voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en-AU')) &&
        premiumProviders.some(provider => voice.name.toLowerCase().includes(provider))
      );
    }
    
    // Third pass: Any female english voice
    if (!this.preferredVoice) {
      this.preferredVoice = this.voices.find(voice => 
        femaleIdentifiers.some(term => voice.name.toLowerCase().includes(term)) && 
        (voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en-AU'))
      );
    }
    
    // Fourth pass: Known good voices with specific names
    if (!this.preferredVoice) {
      const knownGoodVoices = ['Microsoft Zira', 'Google US English Female', 'Alex', 'Samantha', 
                              'Karen', 'Victoria', 'Allison', 'Lisa', 'Siri'];
      this.preferredVoice = this.voices.find(voice => 
        (knownGoodVoices.some(name => voice.name.includes(name))) && 
        (voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en-AU'))
      );
    }
    
    // Fifth pass: Any English voice
    if (!this.preferredVoice) {
      this.preferredVoice = this.voices.find(voice => 
        voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en-AU')
      );
    }
    
    // Last resort - just use the first voice
    if (!this.preferredVoice && this.voices.length) {
      this.preferredVoice = this.voices[0];
    }
    
    console.log("Selected voice:", this.preferredVoice?.name);
  }
  
  public isRecognitionSupported(): boolean {
    return !!this.recognition;
  }
  
  public startListening(): void {
    if (!this.recognition || (this.isListening && !this.isPaused)) return;
    
    try {
      // Clear any existing recognition state
      this.stopListening();
      
      // Reset text tracking to avoid duplicates between sessions
      this.lastRecognizedText = '';
      
      // Short delay to ensure clean start
      setTimeout(() => {
        try {
          this.recognition.start();
          this.isListening = true;
          this.isPaused = false;
          window.dispatchEvent(new CustomEvent('speech-listening-changed', { 
            detail: { isListening: true } 
          }));
        } catch (e) {
          console.error('Error starting speech recognition:', e);
        }
      }, 300);
    } catch (e) {
      console.error('Error starting speech recognition:', e);
    }
  }
  
  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      // Cancel any pending restart
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }
      
      this.recognition.stop();
      this.isListening = false;
      this.isPaused = false;
      window.dispatchEvent(new CustomEvent('speech-listening-changed', { 
        detail: { isListening: false } 
      }));
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }
  
  public pauseListening(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      // Cancel any pending restart
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }
      
      this.recognition.stop();
      this.isPaused = true;
    } catch (e) {
      console.error('Error pausing speech recognition:', e);
    }
  }
  
  public resumeListening(): void {
    if (!this.recognition || !this.isListening) return;
    
    if (this.isPaused) {
      try {
        // Reset text tracking to avoid duplicates when resuming
        this.lastRecognizedText = '';
        
        this.recognition.start();
        this.isPaused = false;
      } catch (e) {
        console.error('Error resuming speech recognition:', e);
      }
    }
  }
  
  private processSpeechQueue(): void {
    if (this.speechQueue.length === 0 || this.isSpeaking) {
      return;
    }
    
    this.isSpeaking = true;
    let textToSpeak = this.speechQueue.shift() || '';
    
    // Only fire the event for the first item in the queue
    if (!this.speechEnqueued) {
      window.dispatchEvent(new Event('speech-started'));
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // Enhanced speech parameters for a more realistic female voice
    utterance.rate = 0.98;    // Slightly slower but more natural
    utterance.pitch = 1.02;   // More subtle pitch adjustment for realism
    utterance.volume = 1.0;   // Full volume
    
    // Advanced text processing for more natural speech patterns
    if (textToSpeak.length > 50) {
      // Add subtle breaks for more natural delivery
      textToSpeak = textToSpeak.replace(/\. /g, '... ');
      textToSpeak = textToSpeak.replace(/! /g, '!... ');
      textToSpeak = textToSpeak.replace(/\? /g, '?... ');
      textToSpeak = textToSpeak.replace(/; /g, ';.. ');
      textToSpeak = textToSpeak.replace(/: /g, ':.. ');
      
      // Add micro-pauses between clauses for a more human-like cadence
      textToSpeak = textToSpeak.replace(/, /g, ',.. ');
      
      // Improve stress patterns for key phrase boundaries
      textToSpeak = textToSpeak.replace(/(\w+)(\s*[-–]\s*)/g, '$1... $2');
    }
    
    utterance.text = textToSpeak;
    
    utterance.onend = () => {
      this.isSpeaking = false;
      
      // If there are more items in the queue, process the next one
      if (this.speechQueue.length > 0) {
        setTimeout(() => this.processSpeechQueue(), 50);
      } else {
        this.speechEnqueued = false;
        window.dispatchEvent(new Event('speech-ended'));
      }
    };
    
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.speechQueue.length === 0) {
        this.speechEnqueued = false;
        window.dispatchEvent(new Event('speech-ended'));
      } else {
        // Try to continue with the next chunk if an error occurs
        setTimeout(() => this.processSpeechQueue(), 50);
      }
    };
    
    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      this.isSpeaking = false;
      this.speechEnqueued = false;
    }
  }
  
  public async speak(text: string): Promise<void> {
    if (!this.synth || !text.trim()) return Promise.resolve();
    
    // Clear and cancel
    this.speechQueue = [];
    this.synth.cancel();
    this.speechEnqueued = false;
    
    return new Promise((resolve) => {
      // No chunking, store full text
      this.speechQueue = [ text ];
      // Set up a one-time event listener for speech ended
      const handleSpeechEnded = () => {
        window.removeEventListener('speech-ended', handleSpeechEnded);
        resolve();
      };
      window.addEventListener('speech-ended', handleSpeechEnded);
      
      // Start speaking
      this.processSpeechQueue();
    });
  }
  
  public speakStreaming(text: string, autoResumeMic: boolean = false): void {
    if (!this.synth || !text.trim()) return;
    
    const isDuplicate = this.speechQueue.includes(text);
    if (isDuplicate) return;
    
    // Store full text instead of chunking
    this.speechQueue.push(text);
    
    if (!this.isSpeaking && !this.speechEnqueued) {
      this.speechEnqueued = true;
      this.processSpeechQueue();
    }
  }
  
  public reloadVoices(): void {
    this.loadVoices();
  }

  // Add a method to let users choose a specific voice
  public setVoice(voiceName: string): boolean {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.preferredVoice = voice;
      return true;
    }
    return false;
  }

  // List available voices for user selection
  public getAvailableVoices(): {name: string, lang: string}[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang
    }));
  }

  // Add a reset method to clear all state
  public reset(): void {
    this.stopListening();
    this.synth.cancel();
    this.speechQueue = [];
    this.lastRecognizedText = '';
    this.isSpeaking = false;
    this.speechEnqueued = false;
  }
}

// Add types for the global window object
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}