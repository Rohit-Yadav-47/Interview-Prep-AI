# CodeSense AI - AI-Powered Technical Interview Platform

Live link : https://sensecode.netlify.app
![screenshot (5)](https://github.com/user-attachments/assets/372cc383-5e6f-46fe-bc84-b9398aa926a6)
![screenshot (6)](https://github.com/user-attachments/assets/e04e615a-1c84-4cbc-8a92-25a5c29e2d3c)
![screenshot-2](https://github.com/user-attachments/assets/5989fccc-16e0-4769-8f66-bb8f8992eb49)

## Overview
CodeSense AI is an advanced technical interview platform that simulates real-world coding interviews with AI. The platform combines natural voice conversation, real-time code assessment, and interactive programming environments to provide a comprehensive interview experience for software engineers.

## 🚀 Features

- **AI Interview Simulation**: Engage in natural conversations with an AI interviewer specialized in technical assessments
- **Voice-Enabled**: Full speech recognition and text-to-speech capabilities for a hands-free interview experience
- **Real-time Code Editor**: Built-in Monaco editor with syntax highlighting and error detection
- **Code Evaluation**: Submit solutions and receive detailed feedback on correctness, complexity, and quality
- **Frontend React Playground**: Live interactive environment to test and demonstrate React development skills
- **Split View Mode**: Seamlessly switch between chat and code views or use them side by side
- **Adaptive Difficulty**: AI adjusts question difficulty based on candidate responses

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom animations
- **Code Editor**: Monaco Editor (same as VS Code)
- **AI**: Groq API with Llama 3 (70B parameter model)
- **Speech Processing**: Web Speech API with enhanced voice selection
- **Build Tool**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- A modern web browser (Chrome recommended for best speech recognition)
- Groq API key (for AI functionality)

## 🔧 Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/codesense-ai.git
cd codesense-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory with your API keys:
```bash
VITE_GROQ_API_KEY=your_groq_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📚 Usage Guide

### Interview Mode

The Interview Mode simulates a technical interview with an AI interviewer:

1. Click "Start Interview" on the home page or select "Interview Mode" from the header
2. Enable your microphone when prompted to engage in voice conversation
3. Introduce yourself and discuss your background with the AI interviewer
4. The AI will present technical questions and eventually a coding challenge
5. Use the code editor to write your solution and submit for evaluation
6. Receive feedback on your solution and continue the interview

### Frontend Test Mode

The Frontend Test Mode provides a React playground:

1. Select "Frontend Test" from the header
2. Choose a template (Counter, Todo List, etc.) or start from scratch
3. The editor provides real-time compilation as you type
4. Preview your React components in the live preview panel
5. Discuss your approach and code with the AI interviewer
6. Access the interview panel by clicking the "Interview" button in the bottom right

### Voice Controls

- Click the microphone button to start/stop voice recognition
- Click the speaker button to enable/disable AI voice responses
- When the AI is speaking, the microphone will temporarily pause to prevent feedback
- For best results, use headphones during voice conversations

## 🔍 Key Components

### AI Interview Engine

The platform uses Groq's advanced Llama 3 model to simulate a technical interviewer. The AI:

- Maintains context throughout the conversation
- Evaluates coding solutions based on correctness and efficiency
- Provides hints and guidance without revealing complete solutions
- Asks follow-up questions to assess understanding

### Code Editor

The integrated Monaco editor provides:

- Syntax highlighting for JavaScript/TypeScript
- Error highlighting and diagnostics
- Line numbers and proper indentation
- Solution submission with detailed feedback

### Speech Processing

Advanced speech processing capabilities include:

- Automatic voice selection based on quality and naturalness
- Speech-to-text for candidate responses
- Text-to-speech for interviewer questions
- Voice activity detection to avoid interruptions

### React Playground

The React playground offers:

- Multiple starter templates (Counter, Todo List, Data Fetching)
- Live reloading as you type
- Real-time error reporting
- Split view between editor and preview

## ⚙️ Configuration

### Customizing Speech

The speech system automatically selects the highest quality voice available on your system. To manually configure speech:

```typescript
// Get available voices
const speechHandler = new SpeechHandler(handleSpeech);
const voices = speechHandler.getAvailableVoices();
console.log(voices);

// Set a specific voice
speechHandler.setVoice("Google US English");
```

### Adding Interview Questions

New coding questions can be added to the platform by modifying the question database:

```typescript
const newQuestion: CodingQuestion = {
  id: "unique-id",
  title: "Array Sum",
  description: "Write a function that calculates the sum of all elements in an array of integers.",
  timeLimit: 600 // in seconds
};
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Groq](https://groq.com/)
- [Framer Motion](https://www.framer.com/motion/)
