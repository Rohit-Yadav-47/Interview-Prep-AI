import React, { useState, useEffect, useRef, useCallback } from "react";

const TEMPLATES: Record<string, string> = {
  editor: `// Start writing your React component here...
function App() {
  return (
    <div className="p-6 text-gray-100">
      <h2 className="text-xl font-bold">Welcome to your Editor!</h2>
      <p>Start coding your component...</p>
    </div>
  );
}`,
  counter: `function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-6 max-w-sm mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-2">Interactive Counter</h2>
      <p className="text-gray-300 mb-4">You clicked {count} times</p>
      <button 
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}`,
  todoList: `function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build an app', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { 
      id: Date.now(), 
      text: newTodo, 
      completed: false 
    }]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-4">Todo List</h2>
      
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-r hover:bg-indigo-700 transition-colors"
          onClick={addTodo}
        >
          Add
        </button>
      </div>
      
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center p-2 border border-gray-700 rounded bg-gray-750">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2 text-indigo-600 focus:ring-indigo-500 rounded bg-gray-700 border-gray-600"
            />
            <span className={todo.completed ? 'line-through text-gray-500 flex-1' : 'text-gray-200 flex-1'}>
              {todo.text}
            </span>
            <button
              onClick={() => removeTodo(todo.id)}
              className="px-2 py-1 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
  fetchData: `function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-4">Data Fetching Example</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-pulse text-indigo-400">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : data ? (
        <div className="border border-gray-700 rounded p-4 bg-gray-750">
          <h3 className="font-bold text-lg text-gray-100">{data.title}</h3>
          <p className="mt-2 text-gray-300">{data.body}</p>
        </div>
      ) : null}
    </div>
  );
}`,
};

const extractImports = (code: string): string => {
  const importRegex = /import\s+.*?from\s+['"].*?['"]\s*;?/g;
  const imports = code.match(importRegex) || [];
  return imports.join("\n");
};

const extractComponentCode = (code: string): string => {
  return code.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, "").trim();
};

const generateHTML = (reactCode: string): string => {
  const importStatements = extractImports(reactCode);
  let componentCode = extractComponentCode(reactCode);

  const isFullComponent = componentCode.includes("export default");
  if (isFullComponent) {
    const componentNameMatch = componentCode.match(
      /(?:function|const)\s+([A-Za-z0-9_]+)/
    );
    if (componentNameMatch && componentNameMatch[1]) {
      const componentName = componentNameMatch[1];
      componentCode = componentCode.replace(
        /export\s+default\s+[A-Za-z0-9_]+;?/,
        ""
      );
      componentCode += `\n\nfunction App() { return <${componentName} />; }`;
    }
  }

  // Prepare code with line numbers for error display
  const codeLines = componentCode.split("\n");
  const numberedCode = codeLines
    .map((line, i) => `${(i + 1).toString().padStart(3, " ")}| ${line}`)
    .join("\n");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>React Preview</title>
      <style>
        body { 
          margin: 0; 
          padding: 16px; 
          font-family: system-ui, -apple-system, sans-serif; 
          background-color: #121212; 
          color: #e0e0e0;
        }
        #root { height: 100%; }
        .error { 
          color: #ff6b6b; 
          padding: 16px;
          border: 1px solid rgba(255, 107, 107, 0.5);
          border-radius: 8px;
          margin: 16px auto;
          background-color: rgba(255, 60, 60, 0.1);
          max-width: 90%;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .error-title {
          font-weight: bold;
          margin-bottom: 12px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .error-title::before {
          content: '';
          display: block;
          width: 16px;
          height: 16px;
          background-color: #ff6b6b;
          border-radius: 50%;
        }
        .error-message {
          padding: 12px;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .error-code {
          padding: 12px;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          overflow-x: auto;
          white-space: pre;
          line-height: 1.5;
          margin-bottom: 12px;
          border-left: 3px solid #ff6b6b;
        }
        .error-line-highlight {
          background-color: rgba(255, 107, 107, 0.2);
          padding: 1px 0;
          display: block;
        }
        .error-location {
          color: #ff9999;
          font-size: 0.9em;
          margin-bottom: 12px;
        }
      </style>
      <script>
        // Store the code to use in error displays
        window.sourceCode = ${JSON.stringify(componentCode)};
        window.numberedCode = ${JSON.stringify(numberedCode)};
        
        // Parse error message to extract line and column numbers
        function parseErrorMessage(message) {
          const lineColMatch = message.match(/\\(([0-9]+):([0-9]+)\\)/);
          if (lineColMatch) {
            return {
              line: parseInt(lineColMatch[1]),
              column: parseInt(lineColMatch[2])
            };
          }
          
          // Handle Babel specific syntax errors
          const babelMatch = message.match(/([0-9]+):([0-9]+)\\)/);
          if (babelMatch) {
            return {
              line: parseInt(babelMatch[1]),
              column: parseInt(babelMatch[2])
            };
          }
          
          return null;
        }
        
        // Format error with code context
        function formatErrorWithCode(message, error) {
          const location = parseErrorMessage(message);
          const codeLines = window.sourceCode.split('\\n');
          
          let formattedMessage = '<div class="error-message">' + message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
          
          if (location) {
            const { line, column } = location;
            formattedMessage += '<div class="error-location">Error at line ' + line + ', column ' + column + '</div>';
            
            // Show code context with the error line highlighted
            const startLine = Math.max(0, line - 3);
            const endLine = Math.min(codeLines.length, line + 2);
            let codeContext = '';
            
            for (let i = startLine; i < endLine; i++) {
              const lineNum = i + 1;
              const isErrorLine = lineNum === line;
              const lineContent = codeLines[i] || '';
              
              if (isErrorLine) {
                codeContext += '<span class="error-line-highlight">';
                codeContext += lineNum.toString().padStart(3, ' ') + '| ' + lineContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (column > 0) {
                  codeContext += '\\n' + ' '.repeat(column + 5) + '^';
                }
                codeContext += '</span>\\n';
              } else {
                codeContext += lineNum.toString().padStart(3, ' ') + '| ' + lineContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\\n';
              }
            }
            
            formattedMessage += '<div class="error-code">' + codeContext + '</div>';
          } else {
            // If we can't parse line/column, just show all code
            formattedMessage += '<div class="error-code">' + window.numberedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
          }
          
          return formattedMessage;
        }
        
        // Display formatted error
        function displayError(title, message, error) {
          const formattedMessage = formatErrorWithCode(message, error);
          
          document.body.innerHTML = \`
            <div class="error">
              <div class="error-title">\${title}</div>
              \${formattedMessage}
            </div>
          \`;
          
          // Send the detailed error to parent frame
          window.parent.postMessage({
            type: 'COMPILE_ERROR',
            error: message,
            formattedError: document.body.innerHTML
          }, '*');
        }
        
        // Set up error handling before anything else loads
        window.onerror = function(message, source, lineno, colno, error) {
          console.error("Error caught:", message, source);
          
          if (source && source.includes('babel')) {
            displayError('Babel Syntax Error', message, error);
            return true; // Prevents default error handler
          } else {
            displayError('JavaScript Error', message, error);
            return true;
          }
        };
      </script>
    </head>
    <body class="dark">
      <div id="root"></div>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.development.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.development.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                'gray-750': '#2d3748',
                'gray-850': '#1a202c',
              }
            }
          }
        }
      </script>
      
      <script>
        window.addEventListener('unhandledrejection', function(e) {
          displayError('Promise Rejection', e.reason ? e.reason.toString() : 'Unhandled rejection');
        });
      </script>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js" onerror="displayError('Loading Error', 'Failed to load Babel transpiler')"></script>
      
      <script type="text/babel" data-type="module">
        try {
          // Pre-declare hooks so code using useState, useEffect, etc., works.
          const { useState, useEffect, useRef } = React;
          
          ${componentCode}
          
          ReactDOM.render(
            <App />,
            document.getElementById('root')
          );
        } catch (error) {
          displayError('React Error', error.toString(), error);
        }
      </script>
    </body>
    </html>
  `;
};

const ReactCodeCompiler: React.FC<{
  darkMode?: boolean;
  interviewComponent?: React.ReactNode; // New prop to accept an interview component
  enableSpeech?: boolean; // New prop to control speech functionality
}> = ({ darkMode = false, interviewComponent, enableSpeech = false }) => {
  const [code, setCode] = useState<string>(TEMPLATES.editor);
  const [displayCode, setDisplayCode] = useState<string>(TEMPLATES.editor);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("editor");
  const [error, setError] = useState<string | null>(null);
  const [formattedError, setFormattedError] = useState<string | null>(null);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(true);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showInterview, setShowInterview] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCompileTimeRef = useRef<number>(0);

  // Throttling and debouncing control
  const DEBOUNCE_TIME = 800; // ms to wait after typing stops
  const MIN_COMPILE_INTERVAL = 1500; // minimum ms between compilations

  // Memoized debounced compilation function
  const debouncedCompile = useCallback((newCode: string) => {
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
    }

    setIsTyping(true);

    compileTimeoutRef.current = setTimeout(() => {
      const now = Date.now();
      const timeElapsed = now - lastCompileTimeRef.current;

      if (timeElapsed < MIN_COMPILE_INTERVAL) {
        // If we're compiling too frequently, delay further
        const additionalDelay = MIN_COMPILE_INTERVAL - timeElapsed;

        compileTimeoutRef.current = setTimeout(() => {
          setDisplayCode(newCode);
          setIsTyping(false);
          lastCompileTimeRef.current = Date.now();
        }, additionalDelay);
      } else {
        setDisplayCode(newCode);
        setIsTyping(false);
        lastCompileTimeRef.current = Date.now();
      }
    }, DEBOUNCE_TIME);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "COMPILE_ERROR") {
        setError(event.data.error);
        if (event.data.formattedError) {
          setFormattedError(event.data.formattedError);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Optimized iframe update effect
  useEffect(() => {
    if (!iframeRef.current) return;

    let isMounted = true;

    const updateIframe = async () => {
      try {
        setIsCompiling(true);
        setError(null);
        setFormattedError(null);

        // Generate HTML in a non-blocking way using setTimeout
        setTimeout(() => {
          if (!isMounted) return;

          try {
            const htmlContent = generateHTML(displayCode);
            const iframe = iframeRef.current;
            if (!iframe) return;

            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(htmlContent);
              iframeDoc.close();
            }

            // Reset the compiling state after a slight delay to show the spinner
            setTimeout(() => {
              if (isMounted) {
                setIsCompiling(false);
              }
            }, 300);
          } catch (err) {
            console.error("Failed to update iframe:", err);
            if (isMounted) {
              setError(err instanceof Error ? err.toString() : String(err));
              setIsCompiling(false);
              showToast(
                {
                  title: "Compilation Error",
                  description: "There was an error compiling your code.",
                },
                false
              );
            }
          }
        }, 0);
      } catch (err) {
        if (isMounted) {
          console.error("Error in updateIframe:", err);
          setError(err instanceof Error ? err.toString() : String(err));
          setIsCompiling(false);
        }
      }
    };

    updateIframe();

    return () => {
      isMounted = false;
    };
  }, [displayCode]);

  const showToast = (
    message: { title: string; description: string },
    success: boolean = true
  ) => {
    setIsSuccessToast(success);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modify the handleCodeChange to prevent scrolling
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store scroll position
    const scrollPosition = window.scrollY;
    
    const newCode = e.target.value;
    setCode(newCode);

    if (autoCompile) {
      debouncedCompile(newCode);
    }
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto' // Use 'auto' instead of 'smooth' to prevent visible scrolling
      });
    }, 0);
  };

  // Also update handleTemplateChange to prevent scrolling
  const handleTemplateChange = (template: string) => {
    // Store scroll position
    const scrollPosition = window.scrollY;
    
    setSelectedTemplate(template);
    setCode(TEMPLATES[template]);
    
    if (autoCompile) {
      setDisplayCode(TEMPLATES[template]);
      lastCompileTimeRef.current = Date.now();
    }
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
      });
    }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes("import") && pastedText.includes("from")) {
      setCode(pastedText);
      if (autoCompile) {
        setDisplayCode(pastedText);
      }
      showToast({
        title: "Code Pasted",
        description: "Imports detected and will be handled automatically.",
      });
    }
  };

  const copyError = () => {
    navigator.clipboard.writeText(error || "");
    showToast({
      title: "Error Copied",
      description: "The error message was copied to your clipboard.",
    });
  };

  const dismissError = () => {
    setError(null);
    setFormattedError(null);
  };

  const templateKeys = Object.keys(TEMPLATES);

  return (
    <div className="flex flex-col w-full h-full mx-auto gap-4 text-gray-100 overflow-hidden">
      {/* Keep interview component active but properly hidden for speech recognition */}
      {interviewComponent && !showInterview && (
        <div
          aria-hidden="true"
          data-speech-enabled={enableSpeech ? "true" : "false"}
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
            visibility: "hidden",
          }}
        >
          {interviewComponent}
        </div>
      )}

      {/* Interview floating toggle button - improved position and visibility for mobile */}
      {interviewComponent && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
          <button
            onClick={() => setShowInterview(!showInterview)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
              showInterview
                ? "bg-purple-700 text-white hover:bg-purple-800"
                : "bg-gray-800/80 backdrop-blur-sm text-gray-200 hover:bg-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              {showInterview ? (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span className="hidden sm:inline">Interview</span>
          </button>
        </div>
      )}

      {toastMessage && (
        <div
          className={`fixed top-6 right-6 max-w-sm ${
            isSuccessToast
              ? "bg-gray-800 border-indigo-500"
              : "bg-gray-800 border-red-500"
          } border-l-4 shadow-xl rounded-md p-4 z-50 transition-all duration-300`}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 mr-3 ${
                isSuccessToast ? "text-indigo-400" : "text-red-400"
              }`}
            >
              {isSuccessToast ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 mb-1">
                {toastMessage.title}
              </h4>
              <p className="text-sm text-gray-400">
                {toastMessage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          ReactLab
        </h1>
        <div className="flex gap-2">
          <button
            className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md transition-all duration-200 ${
              autoCompile
                ? "bg-gray-700 text-indigo-300 border border-indigo-500/30"
                : "bg-gray-800 text-gray-300 border border-gray-700"
            }`}
            onClick={() => {
              setAutoCompile(!autoCompile);
              showToast({
                title: autoCompile
                  ? "Auto-Compile Disabled"
                  : "Auto-Compile Enabled",
                description: autoCompile
                  ? "You'll need to manually compile your code now."
                  : "Your code will automatically compile as you type.",
              });
            }}
          >
            {autoCompile ? "Auto" : "Manual"}
          </button>
          {!autoCompile && (
            <button
              className="text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1"
              onClick={handleCompile}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run
            </button>
          )}
        </div>
      </div>

      {/* New layout with improved interview panel and mobile support */}
      <div className="flex-grow flex flex-col relative">
        {interviewComponent && showInterview && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="relative bg-gray-900/95 backdrop-blur-sm p-4">
              <button
                onClick={() => setShowInterview(false)}
                className="absolute top-2 right-4 text-gray-300 hover:text-gray-100 text-xl"
              >
                &times;
              </button>
              {interviewComponent}
            </div>
          </div>
        )}

        {/* React code editor UI - simplified and mobile optimized */}
        <div className="flex flex-col lg:flex-row gap-4 flex-grow h-full">
          {/* Code editor panel */}
          <div className="w-full lg:w-1/2 border border-gray-700 rounded-lg bg-gray-850 shadow-lg overflow-hidden">
            <div className="p-2 sm:p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <h3 className="font-medium text-gray-300 text-xs sm:text-sm ml-0 sm:ml-2">
                  editor.tsx
                </h3>
              </div>
              <div className="flex rounded-md overflow-hidden border border-gray-700">
                {templateKeys.map((tab) => (
                  <button
                    key={tab}
                    className={`px-2 sm:px-3 py-1 text-xs transition-colors ${
                      selectedTemplate === tab
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-750"
                    }`}
                    onClick={() => handleTemplateChange(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gray-900 border-r border-gray-700 flex flex-col items-center pt-2 text-xs text-gray-500">
                {Array.from({ length: 25 }, (_, i) => (
                  <div
                    key={i}
                    className="h-6 w-full text-center text-[10px] sm:text-xs"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] p-2 sm:p-4 pl-8 sm:pl-12 font-mono text-sm bg-gray-900 text-gray-300 focus:outline-none resize-none border-none"
                value={code}
                onChange={handleCodeChange}
                onPaste={handlePaste}
                spellCheck="false"
                style={{ lineHeight: "1.5rem", tabSize: 2 }}
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 border border-gray-700 rounded-lg bg-gray-850 shadow-lg overflow-hidden relative">
            <div className="p-2 sm:p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11.5 1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 9.5a.5.5 0 11-1 0 .5.5 0 011 0zm-4.5.5a.5.5 0 100-1 .5.5 0 000 1zM10 15a 5 5 0 100-10 5 5 0 000 10z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="font-medium text-gray-300 text-xs sm:text-sm">
                  Live Preview
                </h3>
              </div>
              {isTyping && autoCompile && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-yellow-400 animate-pulse">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span className="text-[10px] sm:text-xs">Typing...</span>
                </div>
              )}
              {isCompiling && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-indigo-400 animate-pulse">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-[10px] sm:text-xs">Compiling...</span>
                </div>
              )}
            </div>
            <div className="relative p-2 sm:p-4 bg-gray-900 h-[300px] sm:h-[400px] md:h-[500px]">
              <iframe
                ref={iframeRef}
                title="React Preview"
                className="w-full h-full border-none bg-gray-900"
                sandbox="allow-scripts allow-same-origin"
              />
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 border border-red-800/30 rounded p-2 sm:p-4 z-20 overflow-auto">
                  <>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <strong className="text-red-300 text-base sm:text-lg">
                        Compilation Error
                      </strong>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono bg-gray-800/50 p-2 sm:p-3 rounded border border-red-900/30 mb-2 sm:mb-4 max-h-[200px] overflow-y-auto">
                      {error}
                    </pre>
                  </>
                  <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-4">
                    <button
                      onClick={copyError}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Copy Error
                    </button>
                    <button
                      onClick={dismissError}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-0 left-0 w-16 h-16 bg-indigo-500/10 blur-xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/10 blur-xl rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactCodeCompiler;
