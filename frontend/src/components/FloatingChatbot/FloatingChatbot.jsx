import React, { useState, useRef } from "react";
import { FaRobot, FaTimes, FaComments, FaPaperclip } from "react-icons/fa";
import { toast } from "react-toastify";
import { authService } from "../../features/auth/services/authService";
import styles from "./FloatingChatbot.module.css";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        content: `Uploading CSV file: ${file.name}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await authService.uploadFile(
          "/chatbot/upload-csv",
          formData
        );

        if (response.success) {
          const botMessage = {
            id: Date.now() + 1,
            type: "bot",
            content: response.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          toast.error(response.response || "Failed to process CSV file.");
        }
      } catch (error) {
        console.error("CSV Upload error:", error);
        toast.error("Error uploading or processing CSV file.");
      } finally {
        setIsLoading(false);
        e.target.value = null;
      }
    }
    // Check if it's a PDF file
    else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        content: `Uploading PDF file: ${file.name}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await authService.uploadFile(
          "/chatbot/upload-pdf",
          formData
        );

        if (response.success) {
          const botMessage = {
            id: Date.now() + 1,
            type: "bot",
            content: response.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          toast.error(response.response || "Failed to process PDF file.");
        }
      } catch (error) {
        console.error("PDF Upload error:", error);
        toast.error("Error uploading or processing PDF file.");
      } finally {
        setIsLoading(false);
        e.target.value = null;
      }
    } else {
      toast.error("Please upload a valid CSV or PDF file.");
      e.target.value = null;
    }
  };

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
    // Split content into lines
    const lines = content.split("\n");

    return lines.map((line, index) => {
      // Handle markdown tables
      if (line.includes("|") && line.trim().startsWith("|")) {
        return (
          <div key={index} className={styles.tableRow}>
            {line.split("|").map((cell, cellIndex) => (
              <span key={cellIndex} className={styles.tableCell}>
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }

      // Handle code blocks
      if (line.trim().startsWith("```")) {
        return <div key={index} className={styles.codeBlock}></div>;
      }

      // Handle regular text with line breaks
      return (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const quickQuestions = [
    "statistics",
    "employee count",
    "department info",
    "help",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              <FaRobot />
              <span>AI Assistant</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <FaComments />
                <p>Hello! How can I help you today?</p>
                <div className={styles.quickQuestions}>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className={styles.quickQuestion}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.type === "user"
                    ? styles.userMessage
                    : styles.botMessage
                }`}
              >
                <div className={styles.messageContent}>
                  {formatMessage(message.content)}
                </div>
                <div
                  className={`${styles.messageTime} ${
                    message.type === "user"
                      ? styles.userMessageTime
                      : styles.botMessageTime
                  }`}
                >
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
          </div>

          <div className={styles.inputContainer}>
            <button
              className={styles.uploadButton}
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <FaPaperclip />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".csv,.pdf,text/csv,application/pdf"
            />
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
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
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
