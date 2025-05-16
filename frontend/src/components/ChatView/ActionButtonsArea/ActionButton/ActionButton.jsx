// src/components/ActionButton/ActionButton.js
import React from "react";
import styles from "./ActionButton.module.css";

const ActionButton = ({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  ...rest
}) => {
  return (
    <button
      className={`${styles.actionButton} ${isLoading ? styles.loading : ""}`}
      onClick={onClick}
      disabled={disabled || isLoading} // Disable if explicitly disabled or loading
      {...rest} // Spread other standard button props
    >
      {/* Display loading text if loading, otherwise display label */}
      {isLoading ? "Processing..." : label}
    </button>
  );
};
export default ActionButton;
