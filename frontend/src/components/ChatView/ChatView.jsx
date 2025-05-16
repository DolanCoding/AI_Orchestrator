// src/components/AIChatView/AIChatView.js
import React from "react";
import styles from "./ChatView.module.css";
import ChatThread from "./ChatThread/ChatThread";
import ChatInputArea from "./ChatInputArea/ChatInputArea";

const ChatView = ({
  messages,
  onSendMessage,
  onSelectNextStep,
  isInputDisabled,
}) => {
  return (
    <div className={styles.chatViewContainer}>
      {/* Chat message thread area */}
      <div className={styles.chatThreadArea}>
        <ChatThread messages={messages} onSelectNextStep={onSelectNextStep} />
      </div>
      {/* Chat input area */}
      <div className={styles.chatInputArea}>
        <ChatInputArea
          onSendMessage={onSendMessage}
          isDisabled={isInputDisabled}
        />
      </div>
    </div>
  );
};
export default ChatView;
