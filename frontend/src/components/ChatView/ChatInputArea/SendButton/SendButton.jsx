// src/components/SendButton/SendButton.js
import React from "react";
import styles from "./SendButton.module.css";

const SendButton = ({ isDisabled = false, children = "Send", ...rest }) => {
  return (
    <button
      className={styles.sendButton}
      disabled={isDisabled}
      {...rest} // Spread other standard button props (onClick, etc.)
    >
      {children}
    </button>
  );
};
export default SendButton;
