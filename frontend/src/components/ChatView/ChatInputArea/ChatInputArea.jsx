// src/components/ChatInputArea/ChatInputArea.js
import React, { useState } from "react";
import styles from "./ChatInputArea.module.css";
import TextInput from "./TextInput/TextInput";
import SendButton from "./SendButton/SendButton";

const ChatInputArea = ({ onSendMessage, isDisabled }) => {
  const [inputText, setInputText] = useState("");

  // Handle sending message
  const handleSend = () => {
    if (inputText.trim() && !isDisabled) {
      onSendMessage(inputText);
      setInputText(""); // Clear input after sending
    }
  };

  // Handle key press for sending on Enter
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Allow Shift+Enter for new line
      event.preventDefault(); // Prevent default form submission
      handleSend();
    }
  };

  return (
    <div className={styles.chatInputContainer}>
      {/* Text input component */}
      <TextInput
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        isDisabled={isDisabled}
      />
      {/* Send button component */}
      <SendButton
        onClick={handleSend}
        isDisabled={isDisabled || !inputText.trim()}
      />
    </div>
  );
};
export default ChatInputArea;
