import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock authService (replace with actual API calls in production)
const authService = {
  apiCall: async (url, options) => {
    try {
      if (url === '/chatbot/chat') {
        const { message } = JSON.parse(options.body);
        const lowerMessage = message.toLowerCase().trim();

        // Simulate responses for specific commands
        if (lowerMessage.match(/\b(list|all|show)\s*(employees|employers)?\b/)) {
          return {
            success: true,
            response: "👥 First 10 employees:\n" +
                      "• John Doe - Sales\n" +
                      "• Jane Smith - IT\n" +
                      "• Alice Johnson - HR\n" +
                      "• Bob Wilson - Marketing\n" +
                      "• Sarah Brown - Finance",
            timestamp: new Date().toISOString(),
          };
        }
        if (lowerMessage.match(/\b(recent|new|latest)\s*(employees|employers)?\b/)) {
          return {
            success: true,
            response: "📅 Latest 5 employees added:\n" +
                      "• Bob Wilson - Marketing (Phone: 1234567890)\n" +
                      "• Sarah Brown - Finance (Phone: 0987654321)\n" +
                      "• Emily Davis - IT (Phone: 5551234567)\n" +
                      "• Michael Lee - Sales (Phone: 5559876543)\n" +
                      "• Laura Adams - HR (Phone: 5554567890)",
            timestamp: new Date().toISOString(),
          };
        }
        if (lowerMessage.includes('search by phone')) {
          return {
            success: true,
            response: "👤 Employee Details for John Doe:\n" +
                      "• Phone: 1234567890\n" +
                      "• Department: Sales\n" +
                      "• Nationality: US\n" +
                      "• Contract Date: 2023-01-15\n" +
                      "• Salary: 5,000.00 EGP\n" +
                      "• Gender: Male\n" +
                      "• Address: 123 Main St",
            timestamp: new Date().toISOString(),
          };
        }
        if (lowerMessage.match(/\b(in|employees in|staff in|who is in|in the)\s+([\w\s]+)/)) {
          const deptMatch = lowerMessage.match(/\b(in|employees in|staff in|who is in|in the)\s+([\w\s]+)/i);
          const deptName = deptMatch ? deptMatch[2].trim() : 'Unknown';
          return {
            success: true,
            response: `👥 Employees in ${deptName}:\n` +
                      "• John Doe\n" +
                      "• Jane Smith\n" +
                      "• Alice Johnson",
            timestamp: new Date().toISOString(),
          };
        }
        if (lowerMessage.includes('help')) {
          return {
            success: true,
            response: "🤖 HR AI Assistant Commands:\n\n" +
                      "📊 Statistics\n   - 'statistics' or 'stats': Show system overview.\n\n" +
                      "👥 Employees\n   - 'employee count': Total number of employees.\n" +
                      "   - 'recent employees': List newest employees.\n" +
                      "   - 'list employees': Show first 10 employees.\n" +
                      "   - 'employee [name]': Details for a specific employee.\n" +
                      "   - 'search by phone [number]': Search by phone number.\n\n" +
                      "🏢 Departments\n   - 'department info': List all departments and employee counts.\n" +
                      "   - 'employees in [department name]': List employees in a department.\n\n" +
                      "🏖️ Holidays\n   - 'upcoming holidays': Show upcoming holidays.\n" +
                      "   - 'holiday count': Total number of holidays.\n\n" +
                      "⏰ Attendance\n   - 'today attendance': Today's attendance count.\n" +
                      "   - 'this month attendance': Monthly attendance count.\n" +
                      "   - 'attendance for [name] today': Check employee's attendance.\n\n" +
                      "💰 Salaries\n   - 'total salaries': Total salary amount.\n" +
                      "   - 'salary for [name]': Specific employee's salary.\n\n" +
                      "📄 PDF Upload\n   - Upload a CV for analysis via the upload button.",
            timestamp: new Date().toISOString(),
          };
        }

        // Default mock response
        return {
          success: true,
          response: `Processed: ${message}\n\nTry commands like:\n• statistics\n• recent employees\n• list employees\n• department info\n• upcoming holidays\n• total salaries\n• help`,
          timestamp: new Date().toISOString(),
        };
      } else if (url === '/chatbot/upload-pdf') {
        return {
          success: true,
          response: '📄 PDF processed successfully.\n\nSample analysis:\n• File Size: 123.45 KB\n• Total Words: 500\n• CV Rating: ⭐ Very Good (85%)',
        };
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  },
};

// Styles (using Tailwind-inspired CSS-in-JS)
const styles = {
  chatbotContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '600px',
    margin: '20px auto',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    height: '80vh',
  },
  chatbotHeader: {
    padding: '15px',
    background: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  chatbotHeaderTitle: {
    margin: 0,
    fontSize: '1.5em',
    color: '#333',
  },
  chatbotHeaderText: {
    margin: '5px 0 0',
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    background: '#fafafa',
  },
  message: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '0.95em',
    lineHeight: 1.4,
  },
  userMessageContent: {
    background: '#007bff',
    color: '#fff',
  },
  botMessageContent: {
    background: '#e9ecef',
    color: '#333',
  },
  messageContentCode: {
    display: 'block',
    background: '#f8f9fa',
    padding: '5px',
    borderRadius: '4px',
    fontFamily: '"Courier New", Courier, monospace',
  },
  messageTime: {
    fontSize: '0.75em',
    color: '#888',
    marginTop: '5px',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
  },
  messageInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'none',
    fontSize: '0.95em',
    outline: 'none',
    minHeight: '40px',
    maxHeight: '100px',
  },
  messageInputFocus: {
    borderColor: '#007bff',
  },
  sendButton: {
    marginLeft: '10px',
    padding: '10px 15px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  sendButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  fileUploadContainer: {
    padding: '10px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
  },
  fileInput: {
    marginRight: '10px',
  },
  uploadButton: {
    padding: '10px 15px',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  uploadButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  quickActions: {
    padding: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
  },
  quickButton: {
    padding: '8px 12px',
    background: '#f8f9fa',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
  quickButtonHover: {
    background: '#e9ecef',
  },
  quickButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  typingIndicator: {
    display: 'flex',
    gap: '5px',
  },
  typingIndicatorSpan: {
    width: '8px',
    height: '8px',
    background: '#666',
    borderRadius: '50%',
    animation: 'typing 1.2s infinite',
  },
  typingIndicatorSpan2: {
    animationDelay: '0.2s',
  },
  typingIndicatorSpan3: {
    animationDelay: '0.4s',
  },
};

// Keyframes for typing animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;
document.head.appendChild(styleSheet);

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content:
          'Hello! I\'m your HR System AI Assistant. I can help with employee info, departments, holidays, attendance, salaries, and CV analysis. Try commands like \'recent employees\', \'list employees\', or type \'help\' for all commands.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Handle text message submission
  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      toast.warn('Please enter a message.', { position: 'top-center' });
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await authService.apiCall('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ message: inputMessage.trim() }), // Trim input
      });

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.response,
          timestamp: new Date(response.timestamp),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast.error(response.response || 'Failed to get response from chatbot.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Error communicating with chatbot. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      toast.warn('Please select a PDF file to upload.', { position: 'top-center' });
      return;
    }

    if (!file.type.includes('pdf')) {
      toast.warn('Please upload a valid PDF file.', { position: 'top-center' });
      setFile(null);
      fileInputRef.current.value = null;
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authService.apiCall('/chatbot/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast.error(response.response || 'Failed to process PDF.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error('Error uploading PDF. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setFile(null);
      fileInputRef.current.value = null;
      setIsLoading(false);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message content with support for code blocks
  const formatMessage = (content) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    const formatted = lines.map((line, index) => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return null;
      }
      if (inCodeBlock) {
        return <code key={index} style={styles.messageContentCode}>{line}</code>;
      }
      return (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
    return formatted.filter((line) => line !== null);
  };

  return (
    <div style={styles.chatbotContainer}>
      <div style={styles.chatbotHeader}>
        <h3 style={styles.chatbotHeaderTitle}>🤖 HR AI Assistant</h3>
        <p style={styles.chatbotHeaderText}>Ask about HR data or upload a CV for analysis</p>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.message,
              ...(message.type === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            <div
              style={{
                ...styles.messageContent,
                ...(message.type === 'user' ? styles.userMessageContent : styles.botMessageContent),
              }}
            >
              {formatMessage(message.content)}
            </div>
            <div style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ ...styles.message, ...styles.botMessage }}>
            <div style={styles.typingIndicator}>
              <span style={styles.typingIndicatorSpan}></span>
              <span style={{ ...styles.typingIndicatorSpan, ...styles.typingIndicatorSpan2 }}></span>
              <span style={{ ...styles.typingIndicatorSpan, ...styles.typingIndicatorSpan3 }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here (e.g., 'recent employees', 'list employees')..."
          disabled={isLoading}
          style={styles.messageInput}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          style={{
            ...styles.sendButton,
            ...(isLoading || !inputMessage.trim() ? styles.sendButtonDisabled : {}),
          }}
          title="Send Message"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>

      <div style={styles.fileUploadContainer}>
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.fileInput}
        />
        <button
          onClick={handleFileUpload}
          disabled={isLoading || !file}
          style={{
            ...styles.uploadButton,
            ...(isLoading || !file ? styles.uploadButtonDisabled : {}),
          }}
          title="Upload PDF"
        >
          📎 Upload CV
        </button>
      </div>

      <div style={styles.quickActions}>
        {[
          { text: '📊 Statistics', command: 'statistics' },
          { text: '👥 Recent Employees', command: 'recent employees' },
          { text: '👥 List Employees', command: 'list employees' },
          { text: '🏢 Departments', command: 'department info' },
          { text: '🏖️ Holidays', command: 'upcoming holidays' },
          { text: '❓ Help', command: 'help' },
        ].map(({ text, command }) => (
          <button
            key={command}
            onClick={() => setInputMessage(command)}
            style={{
              ...styles.quickButton,
              ...(isLoading ? styles.quickButtonDisabled : {}),
            }}
            disabled={isLoading}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;