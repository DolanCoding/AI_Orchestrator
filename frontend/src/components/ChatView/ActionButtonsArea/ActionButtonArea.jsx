// src/components/ActionButtonArea/ActionButtonArea.js
import React from "react";
import styles from "./ActionButtonArea.module.css";
import ActionButton from "./ActionButton/ActionButton";
// import { NextStep } from '././types/stateTypes'; // Type import removed

const ActionButtonArea = ({ messageId, actions, onSelectNextStep }) => {
  actions = [{ label: "Placeholder" }];
  if (!actions || actions.length === 0) {
    return null; // Don't render if no actions are available
  }
  return (
    <div className={styles.ActionButtonAreaContainer}>
      {actions.map((action, index) => (
        <ActionButton
          key={index} // Using index as key is okay here if the list is static for a given message
          label={action.label}
          onClick={() => onSelectNextStep(messageId, action)}
          // Add disabled or loading state logic here if needed based on global state or props
        />
      ))}
    </div>
  );
};

export default ActionButtonArea;
