# Frontend Architectural Plan: AI Orchestration Interface

## Version: 1.1

## Date: May 13, 2025

## Prepared by: Gemini (Senior Frontend Architect)

## General Information

<details>
<summary>Introduction</summary>

This document outlines the frontend architecture for a React-based web application designed to interact with a backend system orchestrating multiple AI models. The application's core feature is a user-directed, non-linear flow through these AI models, visualized and controlled via two main views: an AI Chat View and a Node Map View. The plan emphasizes robust state management, clear data flow, real-time communication, and a responsive, intuitive user experience.

</details>
<details>
<summary>File-Structure</summary>

```markdown
ai-orchestration-frontend/
├── public/
│ └── index.html
├── src/
│ ├── assets/  
│ ├── components/  
│ │ ├── ActionButton/
│ │ │ ├── ActionButton.jsx
│ │ │ └── ActionButton.module.css
│ │ ├── ChatInput/
│ │ │ ├── ChatInput.jsx
│ │ │ └── ChatInput.module.css
│ │ ├── ChatMessage/
│ │ │ ├── ChatMessage.jsx
│ │ │ └── ChatMessage.module.css
│ │ ├── Node/
│ │ │ ├── Node.jsx
│ │ │ └── Node.module.css
│ │ ├── Edge/
│ │ │ ├── Edge.jsx
│ │ │ └── Edge.module.css
│ │ └── ViewToggle/
│ │ ├── ViewSwitcher.jsx
│ │ └── ViewToggle.module.css
│ ├── hooks/  
│ │ └── useAppStore.js
│ ├── store/  
│ │ └── store.js  
│ ├── styles/  
│ │ └── globals.css
│ ├── types/  
│ │ └── index.js
│ ├── utils/  
│ │ └── api.js  
│ ├── views/  
│ │ ├── ChatView/
│ │ │ ├── ChatView.jsx
│ │ │ └── ChatView.module.css
│ │ └── NodeMapView/
│ │ ├── NodeMapView.jsx
│ │ └── NodeMapView.module.css
│ ├── App.jsx # Main application component
│ ├── index.jsx # Entry point
│ └── react-app-env.d.js # TypeScript environment types
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

</details>

## User Interface (UI) / User Experience (UX)

<details>
<summary>User Interface (UI) / User Experience (UX)</summary>

The UI will be clean, intuitive, and responsive, focusing on guiding the user through the complex AI interactions seamlessly.

### 2.1. View Switching

<details>
<summary>2.1. View Switching</summary>

- **Mechanism:** A persistent top navigation bar or a fixed sidebar will contain clear toggles (e.g., "Chat View", "Map View") allowing users to switch between the two primary views at any time.
- **Transition:** View transitions should be smooth (e.g., quick fade or slide) to maintain context. The state of each view (e.g., scroll position in chat, zoom/pan in map) should ideally be preserved when switching.
- **Default View:** The "AI Chat View" will be the default view upon application load or new session initiation.
- **Component:** `ViewSwitcher`

  - **Purpose:** Displays buttons or toggles to switch between the Chat View and the Node Map View.
  - `src/components/ViewSwitcher/ViewSwitcher.js`
      <details>
      <summary>Code: ViewSwitcher.jsx</summary>

    ```javascript
    // src/components/ViewSwitcher/ViewSwitcher.js
    import React from "react";
    import styles from "./ViewSwitcher.module.css";

    const ViewSwitcher = ({ currentView, onViewChange }) => {
      return (
        <div className={styles.viewSwitcherContainer}>
          {/* Button to switch to Chat View */}
          <button
            className={`${styles.viewButton} ${
              currentView === "chat" ? styles.active : ""
            }`}
            onClick={() => onViewChange("chat")}
            disabled={currentView === "chat"} // Disable if already active
          >
            Chat View
          </button>
          {/* Button to switch to Map View */}
          <button
            className={`${styles.viewButton} ${
              currentView === "map" ? styles.active : ""
            }`}
            onClick={() => onViewChange("map")}
            disabled={currentView === "map"} // Disable if already active
          >
            Map View
          </button>
        </div>
      );
    };
    export default ViewSwitcher;
    ```

      </details>

  - `src/components/ViewSwitcher/ViewSwitcher.module.css`
      <details>
      <summary>Code: ViewSwitcher.module.css</summary>

    ```css
    /* src/components/ViewSwitcher/ViewSwitcher.module.css */
    .viewSwitcherContainer {
      display: flex;
      gap: 10px; /* Space between buttons */
      padding: 10px;
      background-color: #f0f0f0; /* Light background */
      border-bottom: 1px solid #ccc;
    }

    .viewButton {
      padding: 8px 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      background-color: #fff;
      color: #333;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }

    .viewButton:hover:not(:disabled) {
      background-color: #e0e0e0;
    }

    .viewButton.active {
      background-color: #007bff; /* Highlight active button */
      color: white;
      border-color: #007bff;
    }

    .viewButton:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    ```

      </details>

</details>

### 2.2. AI Chat View

<details>
<summary>2.2. AI Chat View</summary>

- **Layout (Conceptual Wireframe):**
  - **Main Area:** A scrollable conversational thread occupying the majority of the view.
    - User inputs aligned to one side (e.g., right), styled distinctly.
    - AI outputs aligned to the other side (e.g., left), styled distinctly, possibly with an icon/avatar representing the specific AI model that generated it.
    - Timestamps for all messages.
  - **Input Area:** A fixed text input field at the bottom of the view with a "Send" button. This input is used for the initial prompt and any subsequent text inputs required by specific AI models.
  - **Contextual Action Buttons:** Below each AI output message, a dedicated horizontal container will appear only if the backend indicates available next steps.
- **Interaction Design:**
  - **Initial Input:** User types their initial query/prompt into the input area and submits.
  - **Message Display:** New messages (user or AI) are added to the bottom of the thread, and the view auto-scrolls to keep the latest message visible.
  - **AI Output Streaming:** As AI output is generated, it should stream into its message bubble in real-time (e.g., word by word or sentence by sentence) with a visual indicator (e.g., "AI is thinking..." or a subtle animation on the latest AI message bubble).
  - **Contextual Action Buttons:**
    - **Appearance:** Clearly labeled buttons (e.g., "Analyze Sentiment with AI X", "Summarize with AI Y", "Ask Follow-up to Tutor AI"). Labels will be provided by the backend.
    - **Behavior:** Clicking a button triggers a request to the backend, indicating the user's choice of the next AI model and passing the relevant current AI output (or a reference to it) as input. Once clicked, these buttons might become disabled or visually indicate selection to prevent accidental re-clicks or show the chosen path.
    - **Disappearance:** Once a choice is made and the flow progresses, the previous set of action buttons might fade out or be replaced by a "Choice made: [AI Name]" indicator to keep the chat clean.
- **Responsive Design:**
  - On smaller screens, the chat interface will adapt naturally. The input area remains fixed at the bottom.
  - Font sizes and padding will adjust.
  - If avatars/icons are used for AI models, they might be scaled down.
- **Component:** `AIChatView`

  - **Purpose:** The main container component for the AI Chat interface, arranging the `ChatThread` and `ChatInputArea`.
  - `src/components/AIChatView/AIChatView.js`
      <details>
      <summary>Code: AIChatView.jsx</summary>

    ```javascript
    // src/components/AIChatView/AIChatView.js
    import React from "react";
    import styles from "./AIChatView.module.css";
    import ChatThread from "./ChatThread/ChatThread";
    import ChatInputArea from "./ChatInputArea/ChatInputArea";

    // import { Message, NextStep } from '././types/stateTypes'; // Type import removed
    const AIChatView = ({
      messages,
      onSendMessage,
      onSelectNextStep,
      isInputDisabled,
    }) => {
      return (
        <div className={styles.chatViewContainer}>
          {/* Chat message thread area */}
          <div className={styles.chatThreadArea}>
            <ChatThread
              messages={messages}
              onSelectNextStep={onSelectNextStep}
            />
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
    export default AIChatView;
    ```

      </details>

  - `src/components/AIChatView/AIChatView.module.css`
      <details>
      <summary>Code: AIChatView.module.css</summary>

    ```css
    /* src/components/AIChatView/AIChatView.module.css */
    .chatViewContainer {
      display: flex;
      flex-direction: column;
      height: 100%; /* Take full height of its parent */
      max-width: 800px; /* Optional: limit max width for readability */
      margin: 0 auto; /* Center the chat view */
      border: 1px solid #ccc;
      border-radius: 8px;
      overflow: hidden; /* Hide overflow from rounded corners */
    }

    .chatThreadArea {
      flex-grow: 1; /* Allow thread to take available space */
      overflow-y: auto; /* Enable vertical scrolling */
      padding: 15px;
      background-color: #f9f9f9; /* Light background for chat area */
    }

    .chatInputArea {
      flex-shrink: 0; /* Prevent input area from shrinking */
      padding: 15px;
      background-color: #fff; /* White background for input area */
      border-top: 1px solid #ccc;
    }
    ```

      </details>

* **Component:** `ChatThread`

  - **Purpose:** Renders the list of messages (`UserMessage` and `AIMessage`) in the conversation history, handling scrolling.
  - `src/components/ChatThread/ChatThread.js`
      <details>
      <summary>Code: ChatThread.jsx</summary>

    ```javascript
    // src/components/ChatThread/ChatThread.js
    import React, { useEffect, useRef } from "react";
    import styles from "./ChatThread.module.css";
    import UserMessage from "./UserMessage/UserMessage";
    import AIMessage from "./AIMessage/AIMessage";
    // import { Message, NextStep } from '././types/stateTypes'; // Type import removed

    const ChatThread = ({ messages, onSelectNextStep }) => {
      const threadRef = useRef(null);

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
    ```

      </details>

  - `src/components/ChatThread/ChatThread.module.css`
      <details>
      <summary>Code: ChatThread.module.css</summary>

    ```css
    /* src/components/ChatThread/ChatThread.module.css */
    .chatThreadContainer {
      display: flex;
      flex-direction: column;
      gap: 10px; /* Space between messages */
      overflow-y: auto; /* Ensure scrolling is handled by this container */
      height: 100%; /* Take full height of parent (AIChatView's chatThreadArea) */
    }

    /* No specific styles needed for individual messages here,
       as they are handled by UserMessage and AIMessage modules */
    ```

      </details>

* **Component:** `UserMessage`

  - **Purpose:** Displays a single message sent by the user.
  - `src/components/UserMessage/UserMessage.js`
      <details>
      <summary>Code: UserMessage.jsx</summary>

    ```javascript
    // src/components/UserMessage/UserMessage.js
    import React from "react";
    import styles from "./UserMessage.module.css";
    // import { Message } from '././types/stateTypes'; // Type import removed

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
    ```

      </details>

  - `src/components/UserMessage/UserMessage.module.css`
      <details>
      <summary>Code: UserMessage.module.css</summary>

    ```css
    /* src/components/UserMessage/UserMessage.module.css */
    .userMessageContainer {
      display: flex;
      justify-content: flex-end; /* Align user messages to the right */
    }

    .messageBubble {
      background-color: #007bff; /* Distinct color for user messages */
      color: white;
      padding: 10px 15px;
      border-radius: 15px 15px 0 15px; /* Rounded corners, flat on bottom-right */
      max-width: 70%; /* Limit bubble width */
      word-wrap: break-word; /* Break long words */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    }

    .messageContent {
      margin-bottom: 5px; /* Space between content and timestamp */
    }

    .timestamp {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.8); /* Slightly transparent white */
      text-align: right;
    }
    ```

      </details>

* **Component:** `AIMessage`

  - **Purpose:** Displays a single message received from an AI model, including content, timestamp, potential avatar/icon, loading indicator, and `ContextualActions`.
  - `src/components/AIMessage/AIMessage.js`
      <details>
      <summary>Code: AIMessage.jsx</summary>

    ```javascript
    // src/components/AIMessage/AIMessage.js
    import React from "react";
    import styles from "./AIMessage.module.css";
    import ContextualActions from "./ContextualActions/ContextualActions";
    // import { Message, NextStep } from '././types/stateTypes'; // Type import removed

    const AIMessage = ({ message, onSelectNextStep }) => {
      // Format timestamp (basic example)
      const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      );

      // Determine if actions should be shown (only if not loading and steps are available)
      const showActions =
        !message.isLoading &&
        message.availableNextSteps &&
        message.availableNextSteps.length > 0 &&
        !message.chosenNextStepId;

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
            {/* Contextual actions */}
            {showActions && (
              <ContextualActions
                messageId={message.id}
                actions={message.availableNextSteps || []}
                onSelectNextStep={onSelectNextStep}
              />
            )}
            {/* Indicator if a choice was made */}
            {message.chosenNextStepId && (
              <div className={styles.choiceMadeIndicator}>
                Choice made: {message.chosenNextStepId}{" "}
                {/* Or lookup label from availableNextSteps */}
              </div>
            )}
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
    ```

      </details>

  - `src/components/AIMessage/AIMessage.module.css`
      <details>
      <summary>Code: AIMessage.module.css</summary>

    ```css
    /* src/components/AIMessage/AIMessage.module.css */
    .aiMessageContainer {
      display: flex;
      justify-content: flex-start; /* Align AI messages to the left */
      align-items: flex-start; /* Align items to the top */
      gap: 10px; /* Space between avatar (if used) and bubble */
    }

    .aiAvatar {
      width: 30px;
      height: 30px;
      background-color: #ccc;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: #555;
      flex-shrink: 0; /* Prevent avatar from shrinking */
    }

    .messageContentWrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 70%; /* Limit bubble width */
    }

    .messageBubble {
      background-color: #e9e9eb; /* Distinct color for AI messages */
      color: #333;
      padding: 10px 15px;
      border-radius: 15px 15px 15px 0; /* Rounded corners, flat on bottom-left */
      word-wrap: break-word; /* Break long words */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtle shadow */
      margin-bottom: 5px; /* Space between bubble and actions */
    }

    .senderName {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #555;
    }

    .messageContent {
      margin-bottom: 5px; /* Space between content and timestamp */
    }

    .timestamp {
      font-size: 10px;
      color: #777; /* Grey color for timestamp */
      text-align: left;
    }

    .loadingIndicator {
      display: inline-block;
      animation: pulse 1s infinite; /* Simple loading animation */
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }

    .choiceMadeIndicator {
      font-size: 12px;
      color: #777;
      margin-top: 5px;
      font-style: italic;
    }

    .errorMessage {
      background-color: #f8d7da; /* Light red background for errors */
      color: #721c24; /* Dark red text */
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
      font-size: 14px;
    }
    ```

      </details>

* **Component:** `ChatInputArea`

  - **Purpose:** Contains the `TextInput` field and the `SendButton` for user input.
  - `src/components/ChatInputArea/ChatInputArea.js`
      <details>
      <summary>Code: ChatInputArea.jsx</summary>

    ```javascript
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
    ```

      </details>

  - `src/components/ChatInputArea/ChatInputArea.module.css`
      <details>
      <summary>Code: ChatInputArea.module.css</summary>

    ```css
    /* src/components/ChatInputArea/ChatInputArea.module.css */
    .chatInputContainer {
      display: flex;
      gap: 10px; /* Space between input and button */
      align-items: center; /* Vertically align items */
    }
    ```

      </details>

* **Component:** `TextInput`

  - **Purpose:** The input field where the user types their message.
  - `src/components/TextInput/TextInput.js`
      <details>
      <summary>Code: TextInput.jsx</summary>

    ```javascript
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
    ```

      </details>

  - `src/components/TextInput/TextInput.module.css`
      <details>
      <summary>Code: TextInput.module.css</summary>

    ```css
    /* src/components/TextInput/TextInput.module.css */
    .textInput {
      flex-grow: 1; /* Allow input to take available space */
      padding: 10px 15px;
      border: 1px solid #ccc;
      border-radius: 20px; /* Rounded corners for input field */
      font-size: 16px;
      outline: none; /* Remove default outline */
      transition: border-color 0.3s ease;
    }

    .textInput:focus {
      border-color: #007bff; /* Highlight on focus */
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.2); /* Subtle shadow on focus */
    }

    .textInput:disabled {
      background-color: #f0f0f0;
      cursor: not-allowed;
    }
    ```

      </details>

* **Component:** `SendButton`

  - **Purpose:** The button to submit the user's input from the `TextInput`.
  - `src/components/SendButton/SendButton.js`
      <details>
      <summary>Code: SendButton.jsx</summary>

    ```javascript
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
    ```

      </details>

  - `src/components/SendButton/SendButton.module.css`
      <details>
      <summary>Code: SendButton.module.css</summary>

    ```css
    /* src/components/SendButton/SendButton.module.css */
    .sendButton {
      padding: 10px 20px;
      background-color: #007bff; /* Primary button color */
      color: white;
      border: none;
      border-radius: 20px; /* Rounded corners */
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }

    .sendButton:hover:not(:disabled) {
      background-color: #0056b3; /* Darker on hover */
    }

    .sendButton:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
    ```

      </details>

* **Component:** `ActionButtonArea`

  - **Purpose:** A container that displays a list of `ActionButton` components, representing the available next steps or rather Connected Ai.
  - `src/components/ActionButtonArea/ActionButtonArea.js`
      <details>
      <summary>Code: ActionButtonArea.jsx</summary>

    ```javascript
    // src/components/ActionButtonArea/ActionButtonArea.js
    import React from "react";
    import styles from "./ActionButtonArea.module.css";
    import ActionButton from "./ActionButton/ActionButton";
    // import { NextStep } from '././types/stateTypes'; // Type import removed

    const ActionButtonArea = ({ messageId, actions, onSelectNextStep }) => {
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
    ```

      </details>

  - `src/components/ActionButtonArea/ActionButtonArea.module.css`
      <details>
      <summary>Code: ActionButtonArea.module.css</summary>

    ```css
    /* src/components/ActionButtonArea/ActionButtonArea.module.css */
    .ActionButtonAreaContainer {
      display: flex;
      flex-wrap: wrap; /* Allow buttons to wrap to the next line */
      gap: 8px; /* Space between buttons */
      margin-top: 5px; /* Space above the action buttons */
    }
    ```

      </details>

* **Component:** `ActionButton`

  - **Purpose:** A button representing a specific action or next step suggested by the AI, such as choosing another AI model.
  - `src/components/ActionButton/ActionButton.js`
      <details>
      <summary>Code: ActionButton.jsx</summary>

    ```javascript
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
          className={`${styles.actionButton} ${
            isLoading ? styles.loading : ""
          }`}
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
    ```

      </details>

  - `src/components/ActionButton/ActionButton.module.css`
      <details>
      <summary>Code: ActionButton.module.css</summary>

    ```css
    /* src/components/ActionButton/ActionButton.module.css */
    .actionButton {
      background-color: #e9e9eb; /* Neutral background, distinct from send button */
      color: #333;
      border: 1px solid #ccc;
      padding: 8px 15px;
      border-radius: 15px; /* Rounded pill shape */
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease, opacity 0.3s ease;
    }

    .actionButton:hover:not(:disabled) {
      background-color: #d0d0d0; /* Darker on hover */
    }

    .actionButton:disabled {
      background-color: #f0f0f0;
      color: #999;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .actionButton.loading {
      /* Style for loading state, e.g., change color or add spinner placeholder */
      background-color: #b0c4de; /* Lighter blue or grey */
      color: #555;
      cursor: progress; /* Indicate processing */
    }
    ```

      </details>

</details>

### 2.3. Node Map View

<details>
<summary>2.3. Node Map View</summary>

- **Layout (Conceptual Wireframe):**
  - **Canvas Area:** A large area displaying the nodes and their connections.
  - **Controls (Optional):** Small, unobtrusive controls for zoom in/out, pan, and perhaps a "fit to screen" or "center on active path" button.
- **Visualization Strategy:**
  - **Nodes:**
    - Represented as distinct shapes (e.g., circles, rounded rectangles).
    - Clearly labeled with the AI model's name or function (e.g., "Sentiment Analyzer", "General Tutor", "Math Expert").
    - Could have different colors or icons based on AI type if such metadata is available.
  - **Connections:**
    - Lines or arrows between nodes representing possible pathways.
    - Directionality should be clear if the flow is constrained (e.g., an arrow from AI A to AI B means A can pass output to B).
  - **User's Current Path:**
    - The sequence of nodes the user has traversed in the current session will be visually highlighted (e.g., thicker borders, different node color, highlighted connection lines).
  - **Active/Completed Node:**
    - The most recently completed/active AI node could have a distinct visual state (e.g., a glowing border, a checkmark icon for completed, a "processing" spinner for currently active).
  - **Available Next Steps:** From the currently active node, connections to directly available next AI models (corresponding to the buttons in the chat view) could be subtly emphasized (e.g., pulsating lines or slightly brighter target nodes).
- **Interaction Design:**
  - **Primary Use:** Orientation and understanding the AI ecosystem.
  - **Navigation (Optional):**
    - Clicking a node could potentially display more information about that AI model in a sidebar or tooltip.
    - If desired, and if the user is at a decision point, clicking a valid subsequent node on the map could act as an alternative to clicking the button in the chat view. This would require careful state synchronization.
- **Responsive Design:**
  - On smaller screens, the map will require pan and zoom functionality.
  - Touch gestures (pinch to zoom, drag to pan) will be essential.
  - A simplified list view of nodes might be an alternative for very small screens if the visual map becomes too cluttered, though the preference is to maintain the visual map with good controls.
- **Component:** `NodeMapCanvas`

  - **Purpose:** The main container for the visual representation of the AI orchestration flow using nodes and edges. This component will likely integrate with a graph visualization library.
  - `src/components/NodeMapCanvas/NodeMapCanvas.js`
      <details>
      <summary>Code: NodeMapCanvas.jsx</summary>

    ```javascript
    // src/components/NodeMapCanvas/NodeMapCanvas.js
    import React from "react";
    import styles from "./NodeMapCanvas.module.css";

    // import { Node as NodeType, Edge as EdgeType } from '././types/stateTypes'; // Type import removed
    // Note: This component is a placeholder.
    // A real implementation would integrate a library like 'react-flow-renderer' or similar
    // and define custom nodes/edges using the Node component.

    const NodeMapCanvas = ({
      nodes,
      edges,
      activeNodeId,
      currentPath,
      onNodeClick,
    }) => {
      // In a real implementation, you would use a library like React Flow here.
      // This is a basic placeholder to show the component structure and props.
      return (
        <div className={styles.nodeMapContainer}>
          {/*
            This is where the visualization library (e.g., React Flow) would render the map.
            You would pass nodes, edges, and potentially custom node/edge components to it.
            Visual highlighting based on activeNodeId and currentPath would be handled
            either by the library's features or within the custom Node/Edge components.
          */}
          <div className={styles.placeholderContent}>
            <h2>Node Map Visualization Area</h2>
            <p>Map will be rendered here using a library like React Flow.</p>
            <p>Nodes: {nodes.length}</p>
            <p>Edges: {edges.length}</p>
            <p>Active Node: {activeNodeId || "None"}</p>
            <p>Current Path: {currentPath.join(" -> ")}</p>
            {/* Render basic representation of nodes for now */}
            <div className={styles.nodeListPlaceholder}>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`${styles.nodePlaceholder} ${
                    activeNodeId === node.id ? styles.activeNodePlaceholder : ""
                  }`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
    export default NodeMapCanvas;
    ```

      </details>

  - `src/components/NodeMapCanvas/NodeMapCanvas.module.css`
      <details>
      <summary>Code: NodeMapCanvas.module.css</summary>

    ```css
    /* src/components/NodeMapCanvas/NodeMapCanvas.module.css */
    .nodeMapContainer {
      width: 100%;
      height: 100%; /* Take full size of parent */
      border: 1px solid #ccc;
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff; /* White background for the map canvas */
      position: relative; /* Needed for absolute positioning of controls if any */
    }

    .placeholderContent {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #555;
      text-align: center;
      padding: 20px;
    }

    .nodeListPlaceholder {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .nodePlaceholder {
      padding: 8px 12px;
      border: 1px solid #007bff;
      border-radius: 4px;
      background-color: #e9f5ff;
      font-size: 14px;
    }

    .nodePlaceholder.activeNodePlaceholder {
      border-color: #28a745; /* Green border for active */
      background-color: #e2f9e5; /* Light green background */
      font-weight: bold;
    }
    ```

      </details>

* **Component:** `Node`

  - **Purpose:** A custom component used within the `NodeMapCanvas` to render individual AI model nodes, displaying their label and state. This component is designed to be used with a graph visualization library.
  - `src/components/Node/Node.js`
      <details>
      <summary>Code: Node.jsx</summary>

    ```javascript
    // src/components/Node/Node.js
    import React from "react";
    import styles from "./Node.module.css";

    // This component is designed to be used as a custom node within a graph visualization library
    // like 'react-flow-renderer'. It receives data and potentially position/handlers from the library.
    const Node = ({ data }) => {
      const { label, type, isActive, isCompleted, isError } = data;

      // Determine CSS class based on node state
      const nodeStateClass = isActive
        ? styles.activeNode
        : isError
        ? styles.errorNode
        : isCompleted
        ? styles.completedNode
        : "";

      return (
        <div className={`${styles.nodeContainer} ${nodeStateClass}`}>
          {/* Node label */}
          <div className={styles.nodeLabel}>{label}</div>
          {/* Optional: Display type or icon */}
          {type && <div className={styles.nodeType}>{type}</div>}
          {/* Optional: Add handles for connections if using React Flow */}
          {/* <Handle type="target" position={Position.Left} className={styles.handle} /> */}
          {/* <Handle type="source" position={Position.Right} className={styles.handle} /> */}
        </div>
      );
    };
    export default Node;
    ```

      </details>

  - `src/components/Node/Node.module.css`
      <details>
      <summary>Code: Node.module.css</summary>

    ```css
    /* src/components/Node/Node.module.css */
    /* Basic styling for a node */
    .nodeContainer {
      padding: 10px 15px;
      border: 1px solid #777;
      border-radius: 8px;
      background-color: #f0f0f0;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      min-width: 120px; /* Minimum width for nodes */
      cursor: pointer; /* Indicate interactivity */
      transition: border-color 0.3s ease, background-color 0.3s ease,
        box-shadow 0.3s ease;
    }

    .nodeLabel {
      font-weight: bold;
      font-size: 14px;
      color: #333;
    }

    .nodeType {
      font-size: 10px;
      color: #555;
      margin-top: 3px;
    }

    /* Styles for different node states */
    .activeNode {
      border-color: #007bff; /* Blue border for active */
      background-color: #e9f5ff; /* Light blue background */
      box-shadow: 0 0 8px rgba(0, 123, 255, 0.4); /* Glowing effect */
    }

    .completedNode {
      border-color: #28a745; /* Green border for completed */
      background-color: #e2f9e5; /* Light green background */
    }

    .errorNode {
      border-color: #dc3545; /* Red border for error */
      background-color: #f8d7da; /* Light red background */
      box-shadow: 0 0 8px rgba(220, 53, 69, 0.4); /* Red glowing effect */
    }

    /* Style for connection handles if using React Flow */
    /* .handle {
      width: 8px;
      height: 8px;
      background: #555;
      border: 1px solid #fff;
      border-radius: 50%;
    } */
    ```

      </details>

* **Component:** `MapControls`

  - **Purpose:** (Optional) Component for interactive controls on the Node Map (e.g., zoom, pan).
  - `src/components/MapControls/MapControls.js`
      <details>
      <summary>Code: MapControls.jsx</summary>

    ```javascript
    // src/components/MapControls/MapControls.js
    import React from "react";
    import styles from "./MapControls.module.css";

    // Note: This component is a placeholder.
    // Actual implementation would interact with the graph visualization library's API.
    const MapControls = ({ onZoomIn, onZoomOut, onFitView, onCenterView }) => {
      return (
        <div className={styles.mapControlsContainer}>
          {/* Zoom In Button */}
          <button className={styles.controlButton} onClick={onZoomIn}>
            +
          </button>
          {/* Zoom Out Button */}
          <button className={styles.controlButton} onClick={onZoomOut}>
            -
          </button>
          {/* Fit View Button */}
          <button className={styles.controlButton} onClick={onFitView}>
            Fit
          </button>
          {/* Center View Button (optional) */}
          {onCenterView && (
            <button className={styles.controlButton} onClick={onCenterView}>
              Center
            </button>
          )}
        </div>
      );
    };
    export default MapControls;
    ```

      </details>

  - `src/components/MapControls/MapControls.module.css`
      <details>
      <summary>Code: MapControls.module.css</summary>

    ```css
    /* src/components/MapControls/MapControls.module.css */
    .mapControlsContainer {
      position: absolute; /* Position over the map canvas */
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column; /* Stack buttons vertically */
      gap: 5px; /* Space between buttons */
      background-color: rgba(
        255,
        255,
        255,
        0.8
      ); /* Semi-transparent background */
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      z-index: 10; /* Ensure controls are above the map */
    }

    .controlButton {
      padding: 5px 10px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #fff;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }

    .controlButton:hover {
      background-color: #e0e0e0;
    }
    ```

      </details>

* **Component:** `GlobalLoadingIndicator`

  - **Purpose:** Displays a loading spinner or indicator for application-wide loading states.
  - `src/components/GlobalLoadingIndicator/GlobalLoadingIndicator.js`
      <details>
      <summary>Code: GlobalLoadingIndicator.jsx</summary>

    ```javascript
    // src/components/GlobalLoadingIndicator/GlobalLoadingIndicator.js
    import React from "react";
    import styles from "./GlobalLoadingIndicator.module.css";

    const GlobalLoadingIndicator = ({ isLoading, message = "Loading..." }) => {
      if (!isLoading) {
        return null; // Don't render if not loading
      }
      return (
        <div className={styles.overlay}>
          <div className={styles.spinner}></div>
          {message && <div className={styles.loadingMessage}>{message}</div>}
        </div>
      );
    };
    export default GlobalLoadingIndicator;
    ```

      </details>

  - `src/components/GlobalLoadingIndicator/GlobalLoadingIndicator.module.css`
      <details>
      <summary>Code: GlobalLoadingIndicator.module.css</summary>

    ```css
    /* src/components/GlobalLoadingIndicator/GlobalLoadingIndicator.module.css */
    .overlay {
      position: fixed; /* Cover the entire viewport */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(
        0,
        0,
        0,
        0.5
      ); /* Semi-transparent dark background */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000; /* Ensure it's on top of everything */
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #fff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite; /* Spinning animation */
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loadingMessage {
      margin-top: 15px;
      color: white;
      font-size: 16px;
    }
    ```

      </details>

</details>

</details>

## Data Flow Management

<details>
<summary>Data Flow Management</summary>

Effective data flow is crucial for synchronizing the views and managing the conversation.

### 3.1. State Structure

<details>
<summary>3.1. State Structure</summary>

- `conversationHistory`: An array of message objects. Each object will contain:
  - `id`: Unique identifier for the message.
  - `type`: 'user' | 'ai'.
  - `senderName`: 'user' or the specific AI model's name/ID.
  - `content`: The text of the message.
  - `timestamp`: Time of message creation.
  - `isLoading`: (For AI messages) Boolean, true while streaming/waiting for full response.
  - `availableNextSteps`: (For AI messages, after full response) An array of objects, where each object represents a choice:
    - `label`: User-facing text for the button (e.g., "Analyze with Sentiment AI").
    - `targetModelId`: The ID of the AI model this choice leads to.
    - `payload`: (Optional) Any specific data/context that needs to be sent if this option is chosen, beyond the immediate parent AI output.
  - `chosenNextStepId`: (For AI messages) The `targetModelId` that the user selected, once a choice is made.
- `nodeMapData`: An object describing the AI ecosystem:
  - `nodes`: An array of node objects:
    - `id`: Unique AI model identifier.
    - `label`: Display name of the AI model.
    - `type`: (Optional) Category of AI.
    - `description`: (Optional) Brief description.
    - `position`: (Optional) Predefined x/y coordinates for initial layout, or let the library auto-layout.
  - `edges`: An array of edge objects representing connections:
    - `id`: Unique edge identifier.
    - `source`: id of the source node.
    - `target`: id of the target node.
    - `label`: (Optional) Label for the connection.
- `currentPath`: An array of node ids representing the user's traversal history in the current session (e.g., `['initial_input_node', 'ai_model_A', 'ai_model_C']`).
- `activeNodeId`: The id of the AI model that last provided output or is currently processing.
- `uiState`: Object for managing UI-specific states:
  - `currentView`: 'chat' | 'map'.
  - `isChatLoading`: Boolean, for global chat input disabling during critical backend processing.
  - `error`: Object for storing current global error message/details.

</details>

### 3.2. State Synchronization

<details>
<summary>3.2. State Synchronization</summary>

When a user sends an initial message or selects a next AI model via a button:

- Update `conversationHistory` with the user's input or choice.
- Update `activeNodeId` to the target AI model.
- Add the target AI model's id to `currentPath`.
- Send the request to the backend.

When an AI response chunk arrives:

- Append to or update the relevant AI message content in `conversationHistory`.
- Set `isLoading` appropriately.

When a full AI response arrives (including `availableNextSteps`):

- Finalize the AI message content in `conversationHistory`.
- Populate `availableNextSteps` for that message.
- Set `isLoading` to `false` for that message.

The Node Map View will subscribe to `nodeMapData`, `currentPath`, and `activeNodeId` to re-render its visual representation accordingly.

</details>

### 3.3. Dynamic Presentation of Choices

<details>
<summary>3.3. Dynamic Presentation of Choices</summary>

The `availableNextSteps` array within the last AI message in `conversationHistory` will directly drive the rendering of the contextual action buttons in the Chat View. The frontend will iterate over this array and create a button for each entry, using the `label` for the button text and storing the `targetModelId` (and any payload) for the action when clicked.

</details>

</details>

## Communication Strategy with Backend

<details>
<summary>Communication Strategy with Backend</summary>

A hybrid approach is recommended to leverage the strengths of both REST APIs and WebSockets.

### 4.1. Recommended Strategy: REST for Initial/Static Data, WebSockets for Real-Time Interaction

<details>
<summary>4.1. Recommended Strategy: REST for Initial/Static Data, WebSockets for Real-Time Interaction</summary>

**REST API:**

- **Use Cases:**
  - Fetching the initial `nodeMapData` (all available AI models and their connections).
  - Potentially, user authentication if applicable.
  - Sending the very first user prompt if not immediately establishing a WebSocket.
- **Pros:** Simple, stateless, well-understood, good for cacheable data.
- **Cons:** Not suitable for real-time, streaming updates from AI.

**WebSockets:**

- **Use Cases:**
  - Sending user's choice of the next AI model and the input (derived from previous AI output).
  - Receiving streamed AI responses.
  - Receiving the final AI response along with the `availableNextSteps`.
  - Receiving any error messages from the backend AI processing.
  - Potentially, real-time updates to node statuses on the Node Map if the backend pushes such changes.
- **Pros:** Bi-directional, low-latency, efficient for real-time and streaming data.
- **Cons:** Can be more complex to manage statefully, requires careful handling of connections/disconnections.

</details>

### 4.2. Frontend-to-Backend Interactions & API Contracts (Conceptual)

<details>
<summary>4.2. Frontend-to-Backend Interactions & API Contracts (Conceptual)</summary>

- **GET /api/orchestration/map (REST)**

  - **Frontend Sends:** (Potentially auth token)
  - **Backend Responds (JSON):**
      <details>
      <summary>Code: GET /api/orchestration/map Response (JSON)</summary>

    ```json
    {
      "nodes": [
        { "id": "tutor-general", "label": "General Tutor", "type": "tutor" },
        { "id": "math-solver", "label": "Math Solver", "type": "solver" }
      ],
      "edges": [
        { "id": "e1", "source": "tutor-general", "target": "math-solver" }
      ]
    }
    ```

      </details>

- **WebSocket Messages (after connection is established):**

  - **Client to Server: `SUBMIT_INPUT`**
      <details>
      <summary>Code: WebSocket Message: SUBMIT_INPUT</summary>

    ```json
    {
      "type": "SUBMIT_INPUT",
      "payload": {
        "currentOutputId": null, // or ID of the AI message whose output is being forwarded
        "selectedModelId": "tutor-general", // Target AI model ID
        "inputText": "Can you help me with calculus?" // User's initial text or derived input
      }
    }
    ```

      </details>

  - **Server to Client: `AI_STREAM_CHUNK`**
      <details>
      <summary>Code: WebSocket Message: AI_STREAM_CHUNK</summary>

    ```json
    {
      "type": "AI_STREAM_CHUNK",
      "payload": {
        "messageId": "ai-msg-123", // ID for the AI message being constructed
        "modelId": "tutor-general",
        "chunk": "Calculus is a branch..."
      }
    }
    ```

      </details>

  - **Server to Client: `AI_RESPONSE_COMPLETE`**
      <details>
      <summary>Code: WebSocket Message: AI_RESPONSE_COMPLETE</summary>

    ```json
    {
      "type": "AI_RESPONSE_COMPLETE",
      "payload": {
        "messageId": "ai-msg-123",
        "modelId": "tutor-general",
        "fullText": "Calculus is a branch of mathematics. What specific topic are you interested in?",
        "availableNextSteps": [
          {
            "label": "Derivatives",
            "targetModelId": "calculus-derivatives-explainer"
          },
          {
            "label": "Integrals",
            "targetModelId": "calculus-integrals-explainer"
          },
          {
            "label": "Ask a different question",
            "targetModelId": "tutor-general"
          }
        ]
      }
    }
    ```

      </details>

  - **Server to Client: `PROCESSING_ERROR`**
      <details>
      <summary>Code: WebSocket Message: PROCESSING_ERROR</summary>

    ```json
    {
      "type": "PROCESSING_ERROR",
      "payload": {
        "message": "The 'Math Solver' AI encountered an error.",
        "details": "Error code 500: Internal model failure.",
        "sourceModelId": "math-solver" // Optional: which AI caused it
      }
    }
    ```

      </details>

</details>

</details>

## State Management

<details>
<summary>State Management</summary>

Given the complexity, real-time updates, and need to share state between distinct views (Chat and Node Map), a robust state management library is recommended.

**Recommendation:** Zustand or Redux Toolkit (RTK).

- **Zustand:**
  - **Pros:** Simpler, less boilerplate than classic Redux. Hook-based API feels very natural in React. Easy to set up and manage asynchronous actions (like API calls and WebSocket interactions). Performance is generally good.
  - **Cons:** Less structured middleware ecosystem compared to Redux, though sufficient for most needs.
- **Redux Toolkit (RTK):**
  - **Pros:** Official, opinionated Redux approach that significantly reduces boilerplate. Excellent DevTools support. Robust middleware for handling side effects (RTK Query for REST, custom middleware for WebSockets). Scalable for very large applications.
  - **Cons:** Still slightly more boilerplate than Zustand. The conceptual overhead of Redux (actions, reducers, dispatch) remains.

**Justification:**

- **Centralized Store:** Both provide a single source of truth, crucial for consistency between the Chat and Node Map views.
- **Async Logic:** Both handle asynchronous operations well, which is vital for managing API calls and WebSocket messages.
- **Scalability:** Both can scale to handle increasing complexity in terms of AI models, conversation length, and UI interactions.
- **DevTools:** RTK has excellent DevTools; Zustand can also be integrated with Redux DevTools for easier debugging.

**Implementation Sketch (Zustand example):**

<details>
<summary>Code: Zustand Store Sketch</summary>

```javascript
// store.js
import { create } from "zustand";

const useAppStore = create((set, get) => ({
  conversationHistory: [],
  nodeMapData: { nodes: [], edges: [] },
  currentPath: [],
  activeNodeId: null,
  uiState: { currentView: "chat", isChatLoading: false, error: null },

  // Actions to update state
  addMessage: (message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, message],
    })),
  updateLastMessageChunk: (messageId, chunk, modelId) => {
    /* ... logic to append or create ... */
  },
  finalizeAiMessage: (messageId, fullText, availableNextSteps) => {
    /* ... */
  },
  setNodeMapData: (data) => set({ nodeMapData: data }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),
  // ... other actions for WebSocket handling, error setting, etc.
}));

export default useAppStore;
```

</details>
</details>

## Error Handling and User Feedback

<details>
<summary>Error Handling and User Feedback</summary>

Clear and timely feedback is essential, especially when dealing with potentially long-running or fallible AI processes.

### Backend Error Communication:

<details>
<summary>Backend Error Communication</summary>

- Errors from AI processing will be sent by the backend via WebSocket (e.g., `PROCESSING_ERROR` message as defined above) or as error responses to REST calls.
- These messages should include a user-friendly error message and, if possible, context (e.g., which AI model failed).

</details>

### Displaying Errors:

<details>
<summary>Displaying Errors</summary>

- **Chat View:**
  - A distinct error message item will be added to the `conversationHistory`.
  - This message will be styled differently (e.g., red text, error icon) to be easily identifiable.
  - The error message should clearly state the problem and, if applicable, suggest potential next steps (e.g., "Try again," "Choose a different AI").
  - If an error occurs while waiting for a specific AI's response, the action buttons for next steps might not appear, or specific error guidance will be shown instead.
- **Node Map View:**
  - If an error is associated with a specific AI model, that node on the map could be visually flagged (e.g., border turns red, an error icon appears on the node).
- A global, non-intrusive notification (e.g., a "toast" or "snackbar") can display general backend connection errors or unrecoverable issues.

</details>

### Loading States & Feedback:

<details>
<summary>Loading States & Feedback</summary>

- **Initial Load:** A global loading spinner or skeleton screen while fetching initial `nodeMapData`.
- **Sending User Input:** Disable the chat input field and "Send" button while a message is being processed. Show a loading indicator on the send button.
- **AI "Thinking"/Streaming:**
  - In the chat, the AI's message bubble can show a "typing" indicator (e.g., animated ellipsis) or "AI is processing..." text.
  - Buttons for next steps are hidden until the AI fully responds and provides them.
- **Node Map Activity:** The `activeNodeId` on the map can have a visual "processing" state.
- **Button Clicks:** After clicking a contextual action button, it can show a spinner or change its appearance to indicate the action has been initiated.

</details>

</details>

## Technology Stack & Libraries

<details>
<summary>Technology Stack & Libraries</summary>

- **Core Framework:** React (latest stable version).
- **Language:** JavaScript (as requested).
- **State Management:** Zustand (preferred for simplicity and modern API) or Redux Toolkit.
- **Node Map Visualization:**
  - [React Flow](https://reactflow.dev/): Excellent library for building node-based editors and diagrams. Highly customizable, good performance, and well-suited for this use case.
- **WebSocket Client:**
  - Native WebSocket API.
  - [socket.io-client](https://socket.io/docs/v4/client-api/) if the backend uses Socket.IO (provides fallback mechanisms and auto-reconnection, but adds overhead if not strictly needed).
- **HTTP Client (for REST):**
  - [axios](https://axios-http.com/docs/intro): Popular, feature-rich HTTP client.
  - Native fetch API (can be wrapped for convenience).
- **UI Components & Styling:**
  - **Component Library (Optional but Recommended):**
    - [Material UI (MUI)](https://mui.com/), [Ant Design](https://ant.design/), [Chakra UI](https://chakra-ui.com/), or similar for pre-built, accessible components (buttons, inputs, modals, layout).
  - **Styling:**
    - CSS-in-JS (e.g., Styled Components, Emotion) for component-scoped styles.
    - [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Routing (if more views/pages are added):** [React Router](https://reactrouter.com/en/main).
- **Build Tool:** [Vite](https://vitejs.dev/) (for fast development server and optimized builds) or Create React App (less configuration).
- **Linting/Formatting:** ESLint, Prettier.

</details>

## Architectural Considerations Summary

<details>
<summary>Architectural Considerations Summary</summary>

- **Modularity:** Components for Chat View, Node Map View, message display, input, etc., should be well-encapsulated.
- **Reusability:** Design components (e.g., message bubbles, action buttons) to be reusable.
- **Scalability:** The state management and component structure should accommodate a growing number of AI models and interaction patterns.
- **Performance:**
  - Efficiently render the chat list (virtualization if it becomes extremely long, though likely not an initial concern).
  - Optimize Node Map rendering (React Flow is generally performant).
  - Minimize re-renders through proper state management and component memoization (React.memo, useCallback, useMemo).
- **Testability:** Structure code (especially state logic and API interactions) to be easily testable (unit tests with Jest/Vitest, React Testing Library).

</details>

## Future Considerations (Optional Enhancements)

<details>
<summary>Future Considerations (Optional Enhancements)</summary>

- **Session Persistence:** Saving and restoring conversation state (e.g., using localStorage or backend storage).
- **User Authentication:** If the application requires user accounts.
- **Advanced Node Map Interaction:** Allowing users to rearrange nodes, save custom views, or initiate flows directly from the map.
- **Accessibility (a11y):** Ensure the application is usable by people with disabilities (ARIA attributes, keyboard navigation, color contrast). This should be a primary consideration, not an afterthought.
- **Internationalization (i18n):** Support for multiple languages.

</details>

## Conclusion

<details>
<summary>Conclusion</summary>

This frontend plan provides a comprehensive blueprint for developing the AI orchestration interface. By prioritizing a clear UI/UX, robust data and state management, and effective backend communication, the resulting React application will offer a powerful yet intuitive way for users to navigate and leverage complex AI workflows. The chosen tools and practices aim for a balance of modern development efficiency, scalability, and maintainability. Regular reviews and iterations will be key during the development process.

</details>
