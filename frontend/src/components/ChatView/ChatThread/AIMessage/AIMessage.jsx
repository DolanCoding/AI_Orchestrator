// src/components/AIMessage/AIMessage.js
import React from "react";
import styles from "./AIMessage.module.css";
import ActionButtonArea from "../../ActionButtonsArea/ActionButtonArea";
const AIMessage = ({ message, onSelectNextStep }) => {
  // Format timestamp (basic example)
  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  );

  // Determine if actions should be shown (only if not loading and steps are available)

  return (
    <div className={styles.aiMessageContainer}>
      {/* Optional: AI Avatar/Icon */}
      {/* <div className={styles.aiAvatar}>AI</div> */}
      <div className={styles.messageContentWrapper}>
        <div className={styles.messageBubble}>
          {/* AI Model Name (optional, based on senderName) */}
          {message.senderName !== "user" && (
            <div className={styles.senderName}>{message.senderName}</div>
          )}
          {/* Message content */}
          <div className={styles.messageContent}>
            {message.content}
            {/* Loading indicator while streaming */}
            {message.isLoading && (
              <span className={styles.loadingIndicator}>...</span>
            )}
          </div>
          {/* Timestamp */}
          <div className={styles.timestamp}>{formattedTimestamp}</div>
        </div>
        <ActionButtonArea
          messageId={message.id}
          actions={message.availableNextSteps || []}
          onSelectNextStep={onSelectNextStep}
        />
        {/* Indicator if a choice was made */}
        {/* Error message display */}
        {message.type === "ai" &&
          typeof message.content === "string" &&
          message.content.startsWith("Error:") && ( // Simple check for error message
            <div className={styles.errorMessage}>
              {message.content} {/* Display error content */}
            </div>
          )}
      </div>
    </div>
  );
};
export default AIMessage;
