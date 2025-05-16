import React, { useState, useEffect } from "react"; // Import useEffect
import style from "../CreationView.module.css";

// Define the props the CreateAIAgent component expects
// onSubmit: function to call when the form is submitted.
// disabled: boolean to disable the form elements (managed by parent, derived from Redux status).
// creationStatus: string representing the status of the creation thunk ('idle', 'loading', 'succeeded', 'failed').
// creationError: string storing the error message if creation failed.
const CreateAIAgent = ({
  onSubmit,
  disabled,
  creationStatus,
  creationError,
}) => {
  // Added creationStatus and creationError props
  // State to hold the form input values
  const [formData, setFormData] = useState({
    name: "",
    model: "", // State for the selected model
    type: "", // e.g., 'text', 'image generation'
    system_prompt: "", // Corrected key name to match backend (assuming snake_case)
  });

  // Local state for displaying success/error/loading messages based on Redux state props
  const [displayMessage, setDisplayMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // useEffect to watch creationStatus and update local message state
  useEffect(() => {
    if (creationStatus === "loading") {
      setDisplayMessage("Creating AI Agent...");
      setIsError(false);
    } else if (creationStatus === "succeeded") {
      setDisplayMessage("AI Agent created successfully!");
      setIsError(false);
      // Clear form after successful creation
      setFormData({ name: "", model: "", type: "", system_prompt: "" });
    } else if (creationStatus === "failed") {
      // Use the creationError prop from Redux state
      setDisplayMessage(`AI Agent creation failed: ${creationError}`);
      setIsError(true);
    } else {
      // Reset message when status is 'idle'
      setDisplayMessage(null);
      setIsError(false);
    }
  }, [creationStatus, creationError]); // Depend on status and error props

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Create AI form submitted:", formData);

    // Basic frontend validation (optional, backend also validates)
    if (
      !formData.name ||
      !formData.model ||
      !formData.type ||
      !formData.system_prompt
    ) {
      setDisplayMessage("All fields are required.");
      setIsError(true);
      console.log("Frontend validation failed: All fields are required.");
      return; // Stop submission if fields are empty
    }

    // Clear previous messages on new valid submission
    setDisplayMessage(null);
    setIsError(false);

    // Call the onSubmit prop provided by the parent (CreationView)
    // The parent will dispatch the createAgent thunk.
    // We no longer rely on callbacks from onSubmit for feedback.
    onSubmit(formData); // Pass formData
  };

  return (
    <>
      {/* Changed div to form and added onSubmit handler */}
      <form onSubmit={handleSubmit} className={style.creationForm}>
        <h2>Create AI Agent</h2> {/* Added a heading */}
        <div className={style.formGroup}>
          <label htmlFor="aiName">AI Name:</label>
          <input
            type="text"
            id="aiName"
            name="name" // Added name attribute
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={disabled} // Add disabled prop
          />
        </div>
        {/* AI Type Select */}
        <div className={style.formGroup}>
          <label htmlFor="aiType">Type:</label>
          <select
            id="aiType"
            name="type" // Added name attribute
            value={formData.type}
            onChange={handleInputChange}
            required
            disabled={disabled} // Add disabled prop
          >
            <option value="">--Select Type--</option>
            <option value="text">Text Generation</option>
            <option value="image">Image Generation</option>
            <option value="chat">Chat</option>
            {/* Add more options as needed */}
          </select>
        </div>
        {/* AI Model Select */}
        <div className={style.formGroup}>
          <label htmlFor="aiModel">Model:</label>
          <select
            id="aiModel"
            name="model" // Added name attribute
            value={formData.model}
            onChange={handleInputChange}
            required
            disabled={disabled} // Add disabled prop
          >
            <option value="">--Select Model--</option>
            <option value="model-a">Model A</option>
            <option value="model-b">Model B</option>
            <option value="model-c">Model C</option>
            {/* Add actual model options here */}
          </select>
        </div>
        {/* System Prompt Textarea */}
        <div className={style.formGroup}>
          <label htmlFor="systemPrompt">System Prompt:</label>
          <textarea
            className={style.textAreaAI} // Use the class for styling
            id="systemPrompt"
            name="system_prompt" // Added name attribute (assuming backend expects snake_case)
            value={formData.system_prompt}
            onChange={handleInputChange}
            disabled={disabled} // Add disabled prop
          ></textarea>
        </div>
        {/* Display feedback message based on local state */}
        {displayMessage && (
          <p className={isError ? style.error : style.success}>
            {" "}
            {/* Use local state for styling */}
            {displayMessage}
          </p>
        )}
        <button
          type="submit"
          className={style.submitButton}
          disabled={disabled}
        >
          {" "}
          {/* Add disabled prop */}
          Create AI
        </button>
      </form>
    </>
  );
};

export default CreateAIAgent;
