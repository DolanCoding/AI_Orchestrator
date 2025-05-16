// src/components/UserMessage/UserMessage.js
import React from "react";
import styles from "./UserMessage.module.css";
const UserMessage = ({ message }) => {
  // Format timestamp (basic example)
  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div className={styles.userMessageContainer}>
      <div className={styles.messageBubble}>
        {/* Message content */}
        <div className={styles.messageContent}>{message.content}</div>
        {/* Timestamp */}
        <div className={styles.timestamp}>{formattedTimestamp}</div>
      </div>
    </div>
  );
};
export default UserMessage;
