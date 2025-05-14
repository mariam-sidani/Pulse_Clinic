'use client';
import { useState, useRef, useEffect } from 'react';
import useUserStore from '@/store/userStore';

const ChatWidget = () => {
  const { isLoggedIn, role, user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const statusPollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus]);

  // Clean up status polling on unmount
  useEffect(() => {
    return () => {
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
      }
    };
  }, []);

  // Only show for patients (role 3) and doctors (role 2)
  if (!isLoggedIn || (role !== 2 && role !== 3)) {
    return null;
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);
    setAgentStatus(null);

    // Clear previous polling interval
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if logged in
      // Get token from user object (where it's actually stored)
      if (isLoggedIn && user && user.token) {
        headers.Authorization = `Bearer ${user.token}`;
        console.log('Using token for auth:', user.token);
      } else {
        console.log('No token available in user store:', user);
      }

      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          message: userMessage,
          role: role // Explicitly send the role in the request body
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the assistant');
      }

      const data = await response.json();
      
      // Check if we got a valid response
      let assistantResponse = 'I apologize, but I encountered an error. Please try again later.';
      
      if (data && data.response) {
        assistantResponse = data.response;
        
        // Store the session ID for status polling
        if (data.trace_id) {
          setSessionId(data.trace_id);
          startStatusPolling(data.trace_id, headers);
        }
        
        if (data.agentStatus) {
          setAgentStatus(data.agentStatus);
        }
      } else {
        console.error('Empty or invalid response from API:', data);
      }
      
      // Add assistant message
      setMessages(prev => [...prev, { text: assistantResponse, isUser: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again later.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start polling for status updates
  const startStatusPolling = (sessionId, headers) => {
    // Poll for status updates every 1 second
    statusPollRef.current = setInterval(async () => {
      if (!isLoading) {
        clearInterval(statusPollRef.current);
        return;
      }

      try {
        const statusResponse = await fetch(`/api/chat/status?session_id=${sessionId}`, {
          headers
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.status) {
            setAgentStatus(statusData.status);
          }
        }
      } catch (error) {
        console.error('Error fetching status update:', error);
      }
    }, 1000);
  };

  // Get friendly agent status info
  const getAgentStatusInfo = () => {
    if (!agentStatus) return null;
    
    const statusMap = {
      coordinator: {
        icon: "🧠",
        title: "Analyzing",
        description: "Understanding your request"
      },
      planner: {
        icon: "📝",
        title: "Planning",
        description: "Organizing the best approach"
      },
      supervisor: {
        icon: "👀",
        title: "Reviewing",
        description: "Ensuring accuracy"
      },
      researcher: {
        icon: "🔍",
        title: "Researching",
        description: "Finding relevant information"
      },
      apiManager: {
        icon: "📊",
        title: "Gathering data",
        description: "Accessing medical records"
      },
      reporter: {
        icon: "✍️",
        title: "Preparing response",
        description: "Creating your answer"
      },
      error: {
        icon: "⚠️",
        title: "Error",
        description: "There was a problem"
      }
    };

    const status = statusMap[agentStatus.agent] || {
      icon: "⏳",
      title: "Processing",
      description: "Working on your request"
    };

    return {
      icon: status.icon,
      title: status.title,
      description: agentStatus.description || status.description
    };
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105"
        aria-label="Chat with us"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-80 md:w-96 bg-white shadow-xl overflow-hidden flex flex-col transition-all duration-300 border-l border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="font-semibold text-lg">Medical Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none transform transition-transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-5 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-4 py-3 rounded-2xl shadow-sm max-w-[80%] ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Agent thinking status indicator */}
            {isLoading && (
              <div className="text-left mb-4">
                {agentStatus ? (
                  <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-4">
                    {(() => {
                      const status = getAgentStatusInfo();
                      return (
                        <div className="flex flex-col">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 text-lg">
                              {status.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-blue-700">{status.title}</div>
                              <div className="text-sm text-gray-600">{status.description}</div>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="ml-3 text-gray-600 text-sm">Processing your request...</span>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`${
                  isLoading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                } text-white px-4 py-3 rounded-r-lg transition-colors duration-300 flex items-center justify-center`}
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 