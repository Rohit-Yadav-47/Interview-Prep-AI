import React, { useState, useEffect, useRef } from 'react';

// Default sample code
const DEFAULT_CODE = `function App() {
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
}`;

// Sample templates
const TEMPLATES = {
  counter: DEFAULT_CODE,
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
        // This is a placeholder URL - it returns mock data
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
  reactEmail: `function App() {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Tailwind>
        <Body className="bg-gray-900 my-auto mx-auto font-sans">
          <Container className="border border-gray-700 rounded my-8 mx-auto p-5 max-w-md bg-gray-800">
            <Img
              src="https://react.email/static/icons/react.png"
              width="50"
              height="50"
              alt="React Email"
              className="mx-auto my-4"
            />
            <Heading className="text-2xl font-bold text-center text-gray-100">
              Welcome to React Email
            </Heading>
            <Text className="text-gray-300 my-4">
              This is a simple email template built with React Email and Tailwind CSS.
              You can customize it to suit your needs.
            </Text>
            <Section className="text-center">
              <Button
                href="https://example.com"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Get Started
              </Button>
            </Section>
            <Text className="text-sm text-gray-400 text-center mt-8">
              © 2023 React Email. All rights reserved.
              <br />
              <Link href="https://example.com/unsubscribe" className="text-indigo-400 hover:underline">
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}`,
  loginEmail: `// Current date for the login timestamp
const currentDate = new Date().toLocaleString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZoneName: 'short',
});

function App() {
  return (
    <Html>
      <Head />
      <Preview>Successful login to your account</Preview>
      <Tailwind>
        <Body className="bg-gray-900 font-sans">
          <Container className="mx-auto my-8 max-w-md rounded-lg bg-gray-800 p-5 border border-gray-700">
            {/* Header with Logo */}
            <Section className="mt-8 text-center">
              <Img
                src="https://picsum.photos/600/100"
                alt="Company Logo"
                width="180"
                height="40"
                className="mx-auto"
              />
            </Section>

            {/* Main Content */}
            <Section className="mt-8">
              <Heading className="text-2xl font-bold text-gray-100">
                Login Confirmed
              </Heading>
              <Text className="text-base leading-6 text-gray-300">
                Hey there,
              </Text>
              <Text className="text-base leading-6 text-gray-300">
                We detected a new login to your account. If this was you, no action is needed.
              </Text>

              {/* Login Details */}
              <Section className="my-6 rounded-lg border border-gray-700 bg-gray-750 p-4">
                <Text className="m-0 text-sm font-medium text-gray-300">
                  📅 Date & Time: {currentDate}
                </Text>
                <Text className="m-0 text-sm font-medium text-gray-300">
                  📱 Device: Chrome on Windows
                </Text>
                <Text className="m-0 text-sm font-medium text-gray-300">
                  📍 Location: Bengaluru, India
                </Text>
              </Section>

              <Text className="text-base leading-6 text-gray-300">
                If you didn't log in recently, please secure your account immediately:
              </Text>

              {/* CTA Button */}
              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-indigo-600 px-5 py-3 text-base font-medium text-white no-underline hover:bg-indigo-700"
                  href="https://yoursaas.com/account/security"
                >
                  Secure My Account
                </Button>
              </Section>

              <Text className="text-base leading-6 text-gray-300">
                Or copy and paste this URL into your browser:
                <Link
                  href="https://yoursaas.com/account/security"
                  className="ml-1 text-indigo-400 no-underline"
                >
                  https://yoursaas.com/account/security
                </Link>
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="mt-8 border-t border-gray-700 pt-8">
              <Text className="text-base leading-6 text-gray-300">
                Need help? Contact our support team at{' '}
                <Link
                  href="mailto:support@yoursaas.com"
                  className="text-indigo-400 no-underline"
                >
                  support@yoursaas.com
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 text-center">
              <Text className="text-xs leading-4 text-gray-500">
                © 2025 Your SaaS Company. All rights reserved.
              </Text>
              <Text className="m-0 text-xs leading-4 text-gray-500">
                123 SaaS Street, Tech Park, Bengaluru, India
              </Text>
              <Text className="mt-4 text-xs leading-4 text-gray-500">
                <Link
                  href="https://yoursaas.com/preferences"
                  className="text-gray-500 underline"
                >
                  Email Preferences
                </Link>{' '}
                •{' '}
                <Link
                  href="https://yoursaas.com/unsubscribe"
                  className="text-gray-500 underline"
                >
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}`
};

// Function to detect and extract imports from the code
const extractImports = (code: string): string => {
  const importRegex = /import\s+.*?from\s+['"].*?['"]\s*;?/g;
  const imports = code.match(importRegex) || [];
  return imports.join('\n');
};

// Function to extract the actual component code without imports
const extractComponentCode = (code: string): string => {
  // Remove import statements from the code
  return code.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '').trim();
};

// Function to generate complete HTML with React, ReactDOM, and Babel
const generateHTML = (reactCode: string): string => {
  // Extract imports and component code
  const importStatements = extractImports(reactCode);
  const componentCode = extractComponentCode(reactCode);
  
  // Check if the code is a full component or just a function
  const isFullComponent = componentCode.includes('export default');
  
  // If it's a full component, we need to extract the function/component name
  let appCode = componentCode;
  if (isFullComponent) {
    // Attempt to find the component/function name
    const componentNameMatch = componentCode.match(/(?:function|const)\s+([A-Za-z0-9_]+)/);
    if (componentNameMatch && componentNameMatch[1]) {
      const componentName = componentNameMatch[1];
      // Replace the export default line with nothing
      appCode = componentCode.replace(/export\s+default\s+[A-Za-z0-9_]+;?/, '');
      // Add an App function that renders the component
      appCode = `${appCode}\n\nfunction App() { return <${componentName} />; }`;
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>React Preview</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.development.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.development.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
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
          padding: 12px; 
          border: 1px solid #ff6b6b; 
          border-radius: 8px; 
          margin-top: 12px;
          background-color: rgba(255, 60, 60, 0.1);
        }
      </style>
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
    </head>
    <body class="dark">
      <div id="root"></div>
      <script type="text/babel">
        // React and ReactDOM are already loaded
        const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext } = React;
        
        // Import mock for @react-email/components
        const ReactEmail = {};
        
        // Mock the components from @react-email/components
        const {
          Body, Button, Container, Head, Heading, Html, Img, 
          Link, Preview, Section, Tailwind, Text
        } = {
          Body: ({ children, className, ...props }) => <body className={className} {...props}>{children}</body>,
          Button: ({ children, className, href, ...props }) => <a href={href} className={className} {...props}>{children}</a>,
          Container: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
          Head: ({ children, ...props }) => <head {...props}>{children}</head>,
          Heading: ({ children, className, ...props }) => <h1 className={className} {...props}>{children}</h1>,
          Html: ({ children, ...props }) => <html {...props}>{children}</html>,
          Img: ({ src, alt, width, height, className, ...props }) => 
            <img src={src} alt={alt} width={width} height={height} className={className} {...props} />,
          Link: ({ children, href, className, ...props }) => <a href={href} className={className} {...props}>{children}</a>,
          Preview: ({ children, ...props }) => <div style={{ display: 'none' }} {...props}>{children}</div>,
          Section: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
          Tailwind: ({ children, ...props }) => <div {...props}>{children}</div>,
          Text: ({ children, className, ...props }) => <p className={className} {...props}>{children}</p>
        };
        
        // Log that the imports were processed
        console.log("Processed imports:", ${JSON.stringify(importStatements)});
        
        try {
          ${appCode}
          
          ReactDOM.render(
            <App />,
            document.getElementById('root')
          );
        } catch (error) {
          ReactDOM.render(
            <div className="error">
              <strong>Error:</strong>
              <pre>{error.toString()}</pre>
            </div>,
            document.getElementById('root')
          );
          
          // Send error to parent window
          window.parent.postMessage({
            type: 'COMPILE_ERROR',
            error: error.toString()
          }, '*');
        }
      </script>
    </body>
    </html>
  `;
};

const ReactCodeCompiler: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [displayCode, setDisplayCode] = useState<string>(DEFAULT_CODE);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("counter");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ title: string, description: string } | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(true);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Handle window messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COMPILE_ERROR') {
        setError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update iframe content when displayCode changes or on manual compile
  useEffect(() => {
    if (!iframeRef.current) return;
    
    try {
      setIsCompiling(true);
      setError(null);
      const htmlContent = generateHTML(displayCode);
      
      // Write to the iframe
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
      
      setTimeout(() => {
        setIsCompiling(false);
      }, 300); // Short delay to show compilation effect
    } catch (err) {
      console.error("Failed to update iframe:", err);
      setError(err instanceof Error ? err.toString() : String(err));
      setIsCompiling(false);
      
      showToast({
        title: "Compilation Error",
        description: "There was an error compiling your code.",
      }, false);
    }
  }, [displayCode]);

  // Show toast notification
  const showToast = (message: { title: string, description: string }, success: boolean = true) => {
    setIsSuccessToast(success);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    if (autoCompile) {
      setDisplayCode(e.target.value);
    }
  };

  // Manually compile code
  const handleCompile = () => {
    setDisplayCode(code);
    showToast({
      title: "Code Compiled",
      description: "Your code has been compiled and is now running in the preview.",
    });
  };

  // Handle template changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setCode(TEMPLATES[template as keyof typeof TEMPLATES]);
    if (autoCompile) {
      setDisplayCode(TEMPLATES[template as keyof typeof TEMPLATES]);
    }
  };

  // Function to handle pasting code with imports
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // Check if the pasted content has import statements
    if (pastedText.includes('import') && pastedText.includes('from')) {
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

  return (
    <div className="flex flex-col w-full h-full mx-auto gap-4 text-gray-100">
      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 max-w-sm ${isSuccessToast ? 'bg-gray-800 border-indigo-500' : 'bg-gray-800 border-red-500'} border-l-4 shadow-xl rounded-md p-4 z-50 transition-all duration-300 transform`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 mr-3 ${isSuccessToast ? 'text-indigo-400' : 'text-red-400'}`}>
              {isSuccessToast ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 mb-1">{toastMessage.title}</h4>
              <p className="text-sm text-gray-400">{toastMessage.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">ReactLab</h1>
        <div className="flex gap-2">
          <button
            className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${autoCompile ? 'bg-gray-700 text-indigo-300 border border-indigo-500/30' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
            onClick={() => {
              setAutoCompile(!autoCompile);
              showToast({
                title: autoCompile ? "Auto-Compile Disabled" : "Auto-Compile Enabled",
                description: autoCompile 
                  ? "You'll need to manually compile your code now." 
                  : "Your code will automatically compile as you type.",
              });
            }}
          >
            {autoCompile ? "Auto-Compile ON" : "Auto-Compile OFF"}
          </button>
          {!autoCompile && (
            <button 
              className="text-sm px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1"
              onClick={handleCompile}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        {/* Code Editor Side */}
        <div className="w-full lg:w-1/2 border border-gray-700 rounded-lg bg-gray-850 shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="font-medium text-gray-300 text-sm ml-2">editor.tsx</h3>
            </div>
            <div className="flex rounded-md overflow-hidden border border-gray-700">
              {["counter", "todoList", "fetchData", "reactEmail", "loginEmail"].map((tab) => (
                <button 
                  key={tab}
                  className={`px-3 py-1 text-xs transition-colors ${selectedTemplate === tab ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-750'}`}
                  onClick={() => handleTemplateChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-900 border-r border-gray-700 flex flex-col items-center pt-2 text-xs text-gray-500">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="h-6 w-full text-center">{i + 1}</div>
              ))}
            </div>
            <textarea
              className="w-full h-[500px] p-4 pl-12 font-mono text-sm bg-gray-900 text-gray-300 focus:outline-none resize-none border-none"
              value={code}
              onChange={handleCodeChange}
              onPaste={handlePaste}
              spellCheck="false"
              style={{
                lineHeight: "1.5rem",
                tabSize: 2,
              }}
            />
          </div>
        </div>
        
        {/* Preview Side */}
        <div className="w-full lg:w-1/2 border border-gray-700 rounded-lg bg-gray-850 shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11.5 1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 9.5a.5.5 0 11-1 0 .5.5 0 011 0zm-4.5.5a.5.5 0 100-1 .5.5 0 000 1zM10 15a 5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
              </svg>
              <h3 className="font-medium text-gray-300 text-sm">Live Preview</h3>
            </div>
            {isCompiling && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compiling...
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 h-[500px]">
            <div className="rounded-md h-full bg-gray-900 overflow-hidden relative">
              {error ? (
                <div className="text-red-400 p-4 bg-red-900/20 border border-red-800/30 rounded h-full overflow-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong className="text-red-300">Compilation Error</strong>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm font-mono bg-gray-800/50 p-3 rounded border border-red-900/30">{error}</pre>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  title="React Preview"
                  className="w-full h-full border-none bg-gray-900"
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
              
              {/* Glowing corner effects */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-indigo-500/10 blur-xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/10 blur-xl rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
          </div>
        </div>
      </div>
   
    </div>
  );
};

export default ReactCodeCompiler;