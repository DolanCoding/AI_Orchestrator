// src/components/ChatThread/ChatThread.js
import React, { useEffect, useRef } from "react";
import styles from "./ChatThread.module.css";
import UserMessage from "./UserMessage/UserMessage";
import AIMessage from "./AIMessage/AIMessage";

const ChatThread = ({ messages, onSelectNextStep }) => {
  const threadRef = useRef(null);

  messages = [
    { id: "1", type: "user", content: "This is a placeholder message!" },
    { id: "2", type: "ai", content: "This is a placeholder message!" },
    { id: "3", type: "ai", content: "This is a placeholder message!" },
    {
      id: "4",
      type: "user",
      content: "This is a placeholder message!",
    },
  ];

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]); // Dependency array includes messages

  return (
    <div className={styles.chatThreadContainer} ref={threadRef}>
      {messages.map((message) =>
        // Render UserMessage or AIMessage based on message type
        message.type === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AIMessage
            key={message.id}
            message={message}
            onSelectNextStep={onSelectNextStep}
          />
        )
      )}
    </div>
  );
};
export default ChatThread;
