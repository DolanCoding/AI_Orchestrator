// src/components/TextInput/TextInput.js
import React from "react";
import styles from "./TextInput.module.css";

const TextInput = ({ isDisabled = false, onKeyPress, ...rest }) => {
  return (
    <input
      type="text"
      className={styles.textInput}
      disabled={isDisabled}
      onKeyPress={onKeyPress}
      {...rest} // Spread other standard input props (value, onChange, placeholder, etc.)
    />
  );
};
export default TextInput;
