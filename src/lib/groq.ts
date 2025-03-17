import { Groq } from "groq-sdk";

// Initialize Groq client
const client = new Groq({
  apiKey: process.env.GROQ_API, // Replace with your actual Groq API key or use environment variable
  dangerouslyAllowBrowser: true 
});

// Specify preferred model (Llama 3 or Mixtral are recommended options)
const MODEL = "llama3-70b-8192"; // or "mixtral-8x7b-32768"

// Conversation context management
interface ConversationContext {
  messages: { role: string; content: string }[];
  lastUpdated: Date;
}

// In-memory store to persist conversation context across function calls
const conversationStore = new Map<string, ConversationContext>();

// Default context key (can be made dynamic for multiple conversations)
const DEFAULT_CONTEXT_KEY = 'default-interview';

// Maximum number of messages to retain in context (adjust as needed)
const MAX_CONTEXT_MESSAGES = 20;

// System prompt for interview simulation experience
const SYSTEM_PROMPT = `# # Your responses will be converted to speech.

## Conversation Context Awareness
- Maintain detailed awareness of the entire conversation history
- Reference specific details mentioned earlier by the candidate
- Build upon previously discussed topics for a cohesive interview experience
- If the candidate mentions specific technologies or experiences, ask follow-up questions about them
- Address inconsistencies or gaps between current and previous statements
- Adapt your questions based on the candidate's demonstrated knowledge level

## Interview Structure
- You are an experienced technical interviewer conducting a software engineering interview
- Follow this interview structure:
  1. Introduction and brief exchange
  2. Ask about candidate's resume, experience, and background
  3. Ask behavioral/situational questions relevant to their experience
  4. Transition to technical conceptual questions
  5. Present a coding challenge
  6. Evaluate solution and ask follow-up questions

## Conversation Management
- Keep track of the candidate's responses throughout the interview
- Reference previously mentioned experience or projects in your questions
- Adjust difficulty based on candidate's responses
- Use the candidate's name if provided
- Remember key technical skills mentioned and focus questions in those areas
- Create a natural flow by connecting new questions to previous answers
- If the candidate mentions something interesting, follow up on it before moving to the next topic

## Technical Assessment
- Present clear coding challenges
- Ask medium to hard level leetcode or system design questions
- Provide hints if the candidate struggles, never the full solution
- Ask follow-up questions to improve the initial solution
- If discussing code, refer back to design choices or approaches the candidate previously mentioned

## Communication Style
- Use short, clear sentences
- Pause between major topics
- Avoid complex symbols or formatting
- Use simple language patterns
- Break down complex concepts step by step
- Present information in small chunks
- Use numeric markers for lists
- Include natural transition phrases
- Speak professionally but conversationally, like a real interviewer
- Dont use symbols like quotes, asterisks, or backticks
`;

// Helper function to get or create conversation context
function getOrCreateContext(contextKey: string = DEFAULT_CONTEXT_KEY): ConversationContext {
  if (!conversationStore.has(contextKey)) {
    conversationStore.set(contextKey, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }],
      lastUpdated: new Date()
    });
  }
  return conversationStore.get(contextKey)!;
}

// Helper function to update context with new messages
function updateContext(
  newMessages: { role: string; content: string }[], 
  contextKey: string = DEFAULT_CONTEXT_KEY
) {
  const context = getOrCreateContext(contextKey);
  
  // Add new messages that aren't system messages (as we already have system message at the start)
  const filteredNewMessages = newMessages.filter(msg => msg.role !== 'system');
  
  // Update context with new messages
  context.messages.push(...filteredNewMessages);
  
  // Trim context if it exceeds maximum size (keeping system message and most recent messages)
  if (context.messages.length > MAX_CONTEXT_MESSAGES) {
    const systemMessage = context.messages.find(msg => msg.role === 'system');
    const recentMessages = context.messages.slice(-(MAX_CONTEXT_MESSAGES - 1));
    context.messages = systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
  }
  
  context.lastUpdated = new Date();
  conversationStore.set(contextKey, context);
}

export async function chat(
  messages: { role: string; content: string }[],
  options?: { 
    onStreamChunk?: (chunk: string) => void, 
    signal?: AbortSignal,
    contextKey?: string,
    useContext?: boolean
  }
): Promise<string> {
  const contextKey = options?.contextKey || DEFAULT_CONTEXT_KEY;
  const useContext = options?.useContext !== false; // Default to using context
  
  // Get the current conversation context
  const context = getOrCreateContext(contextKey);
  
  // Format messages for Groq API
  let groqMessages = [];
  
  if (useContext) {
    // Use existing context plus new messages
    groqMessages = [...context.messages];
    
    // Add new messages that aren't already in the context
    // (avoiding duplicates by checking last few messages)
    const newMessages = messages.filter(msg => msg.role !== 'system');
    groqMessages.push(...newMessages);
  } else {
    // Just use the system prompt and the provided messages
    groqMessages.push({
      role: "system",
      content: SYSTEM_PROMPT
    });
    
    // Add all user and assistant messages
    for (const msg of messages) {
      if (msg.role !== 'system') {
        groqMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
  }
  
  // If there are no messages beyond system, return prompt for user input
  if (groqMessages.length <= 1) {
    return "Please provide a message to start the conversation.";
  }

  let fullResponse = '';
  
  try {
    // Handle streaming if requested
    if (options?.onStreamChunk) {
      const stream = await client.chat.completions.create({
        model: MODEL,
        messages: groqMessages,
        stream: true,
        max_tokens: 8000,
      }, {
        signal: options?.signal
      });

      for await (const chunk of stream) {
        const chunkText = chunk.choices[0]?.delta?.content || '';
        if (chunkText) {
          fullResponse += chunkText;
          options.onStreamChunk(chunkText);
        }
      }
    } else {
      // Non-streaming response
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: groqMessages,
        max_tokens: 8000,
      });
      
      fullResponse = response.choices[0]?.message?.content || '';
    }
    
    // Update the context with the new messages and the response
    if (useContext && fullResponse) {
      updateContext([...messages, { role: 'assistant', content: fullResponse }], contextKey);
    }
    
    return fullResponse;
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      console.log('Stream aborted');
    } else {
      console.error('Error in chat stream:', error);
    }
    return fullResponse;
  }
}

export async function analyzeCodingSolution(
  question: string,
  solution: string,
  options?: { 
    onStreamChunk?: (chunk: string) => void,
    signal?: AbortSignal,
    contextKey?: string,
    useContext?: boolean
  }
): Promise<string> {
  // If there's no solution, return an error message
  if (!solution.trim()) {
    return "No code provided for analysis. Please write some code first.";
  }

  const contextKey = options?.contextKey || DEFAULT_CONTEXT_KEY;
  const useContext = options?.useContext !== false; // Default to using context
  
  const prompt = `
    Remember that you are an experienced technical interviewer conducting a software engineering interview.
    
    You should refer to our ongoing interview conversation and the coding question I previously asked.
    ${question ? `The coding question was: "${question}"` : 'Review the recent conversation to identify the coding question I asked.'}
    
    The candidate has submitted this solution:
    ${solution}
    
    As the interviewer, evaluate this code while maintaining your interviewer persona. Your analysis should:
    1. Reference the specific question from our conversation
    2. Evaluate the solution's correctness in solving that specific problem
    3. Analyze time and space complexity
    4. Identify potential optimizations
    5. Note any edge cases that might be missed
    6. Assess overall code quality
    
    Respond as if we are continuing our interview conversation. Your response should feel like a natural follow-up
    to our previous discussion about this problem. Be conversational yet professional as a technical interviewer.
  `;

  let messages = [];
  
  if (useContext) {
    // Get existing context and add our new prompt
    const context = getOrCreateContext(contextKey);
    messages = [...context.messages, { role: "user", content: prompt }];
  } else {
    messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ];
  }

  let fullResponse = '';
  
  try {
    if (options?.onStreamChunk) {
      const stream = await client.chat.completions.create({
        model: MODEL,
        messages: messages,
        stream: true,
        max_tokens: 8000,
      }, {
        signal: options?.signal
      });

      for await (const chunk of stream) {
        const chunkText = chunk.choices[0]?.delta?.content || '';
        if (chunkText) {
          fullResponse += chunkText;
          options.onStreamChunk(chunkText);
        }
      }
    } else {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: messages,
        max_tokens: 8000,
      });
      
      fullResponse = response.choices[0]?.message?.content || '';
    }
    
    // Update the context with the code analysis interaction
    if (useContext && fullResponse) {
      updateContext([
        { role: "user", content: prompt }, 
        { role: "assistant", content: fullResponse }
      ], contextKey);
    }
    
    return fullResponse;
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      console.log('Stream aborted');
    } else {
      console.error('Error in analysis stream:', error);
    }
    return fullResponse;
  }
}

// Helper function to clear conversation context (useful for starting fresh)
export function clearContext(contextKey: string = DEFAULT_CONTEXT_KEY): void {
  conversationStore.delete(contextKey);
}

// Helper function to get current context size
export function getContextSize(contextKey: string = DEFAULT_CONTEXT_KEY): number {
  const context = conversationStore.get(contextKey);
  return context ? context.messages.length : 0;
}
