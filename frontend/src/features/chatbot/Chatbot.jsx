import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { authService } from "../auth/services/authService";
import styles from "./Chatbot.module.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
     
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "Hello! I'm your HR System AI Assistant. How can I help you today? Type 'help' to see all available commands.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await authService.apiCall("/chatbot/chat", {
        method: "POST",
        body: JSON.stringify({ message: inputMessage }),
      });

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast.error("Failed to get response from chatbot");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      toast.error("Error communicating with chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatbotHeader}>
        <h3>🤖 HR AI Assistant</h3>
        <p>Ask me anything about your HR system</p>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.type === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.messageContent}>
              {formatMessage(message.content)}
            </div>
            <div className={styles.messageTime}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
          className={styles.messageInput}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className={styles.sendButton}
        >
          {isLoading ? "⏳" : "📤"}
        </button>
      </div>

      <div className={styles.quickActions}>
        <button
          onClick={() => setInputMessage("statistics")}
          className={styles.quickButton}
        >
          📊 Statistics
        </button>
        <button
          onClick={() => setInputMessage("employee count")}
          className={styles.quickButton}
        >
          👥 Employees
        </button>
        <button
          onClick={() => setInputMessage("department info")}
          className={styles.quickButton}
        >
          🏢 Departments
        </button>
        <button
          onClick={() => setInputMessage("help")}
          className={styles.quickButton}
        >
          ❓ Help
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
