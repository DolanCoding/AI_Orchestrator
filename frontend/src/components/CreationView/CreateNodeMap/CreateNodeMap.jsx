import React, { useState, useEffect } from "react"; // Import useEffect
import style from "../CreationView.module.css"; // Assuming the CSS module is in the parent directory

// Define the props the CreateNodeMap component expects
// onSubmit: function to call when the form is submitted.
// disabled: boolean to disable the form elements (managed by parent, derived from Redux status).
// creationStatus: string representing the status of the creation thunk ('idle', 'loading', 'succeeded', 'failed').
// creationError: string storing the error message if creation failed.
const CreateNodeMap = ({
  onSubmit,
  disabled,
  creationStatus,
  creationError,
}) => {
  // Added creationStatus and creationError props
  // State to manage the form inputs
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    // Add state for image file itself
    mapImage: null,
  });

  // State to hold the URL for the image preview
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Local state for displaying success/error/loading messages based on Redux state
  const [displayMessage, setDisplayMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // useEffect to watch creationStatus and update local message state
  useEffect(() => {
    if (creationStatus === "loading") {
      setDisplayMessage("Creating Nodemap...");
      setIsError(false);
    } else if (creationStatus === "succeeded") {
      setDisplayMessage("Nodemap created successfully!");
      setIsError(false);
      // Clear form after successful creation
      setFormData({ name: "", goal: "", description: "", mapImage: null });
      // Clear image preview
      setImagePreviewUrl(null);
    } else if (creationStatus === "failed") {
      // Use the creationError prop from Redux state
      setDisplayMessage(`Nodemap creation failed: ${creationError}`);
      setIsError(true);
    } else {
      // Reset message when status is 'idle'
      setDisplayMessage(null);
      setIsError(false);
    }
  }, [creationStatus, creationError]); // Depend on status and error props

  // Handler for input changes (for text/textarea inputs)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handler for file input change (for image upload)
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file

    if (file) {
      // Read the file as a Data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set the result as the image preview URL
      };
      reader.readAsDataURL(file); // Read the file as a Data URL

      // Store the actual file in state to be sent to the backend
      setFormData({
        ...formData,
        mapImage: file,
      });
    } else {
      // If no file is selected (e.g., user cancels), clear the state
      setFormData({
        ...formData,
        mapImage: null,
      });
      setImagePreviewUrl(null); // Clear the preview
    }
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser form submission

    // Basic frontend validation (optional, backend also validates)
    if (!formData.name || !formData.goal || !formData.description) {
      // Set local error state for frontend validation message
      setDisplayMessage("All fields are required.");
      setIsError(true);
      console.log("Frontend validation failed: All fields are required.");
      return; // Stop submission if fields are empty
    }

    // Clear previous messages on new valid submission
    setDisplayMessage(null);
    setIsError(false);

    // Call the onSubmit prop function provided by the parent (CreationView.jsx)
    // Pass the form data. If including the image, you will need to use FormData
    // to send files correctly to the backend.
    // Example of creating FormData:
    // const dataToSend = new FormData();
    // dataToSend.append('name', formData.name);
    // dataToSend.append('goal', formData.goal);
    // dataToSend.append('description', formData.description);
    // if (formData.mapImage) {
    //   dataToSend.append('map_image', formData.mapImage); // 'map_image' should match backend expected field name
    // }
    // onSubmit(dataToSend); // Pass FormData to parent

    // For now, we pass the formData object directly.
    // The parent (CreationView) or the thunk will need to handle FormData creation
    // if the backend expects file uploads this way.
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={style.creationForm}>
      {" "}
      {/* Use handleSubmit */}
      {/* Top Section: Image Upload and Name/Goal */}
      <div className={style.topSection}>
        {" "}
        {/* New container for the top section */}
        {/* Left Column: Image Upload */}
        <div className={style.imageUploadArea}>
          {" "}
          {/* Container for image upload */}
          <label htmlFor="mapIMG">Image</label>
          {/* Image preview - src is set by imagePreviewUrl state */}
          <img
            src={imagePreviewUrl || ""} // Use imagePreviewUrl state, default to empty string
            alt="Map Preview"
            className={style.mapImagePreview}
          />{" "}
          {/* Added class for styling */}
          <input
            type="file"
            id="mapIMG"
            name="mapImage" // Added name attribute for the file input
            accept="image/*"
            onChange={handleImageChange} // Add the onChange handler
            disabled={disabled} // Add disabled prop
          />
        </div>
        {/* Right Column: Name and Goal */}
        <div className={style.nameGoalArea}>
          {" "}
          {/* Container for name and goal inputs */}
          <div className={style.formGroup}>
            {" "}
            {/* Keep formGroup for consistent input styling */}
            <label htmlFor="nodemapName">Map Name:</label>
            <input
              type="text"
              id="nodemapName"
              name="name" // Corrected name attribute to match backend key
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={disabled} // Add disabled prop
            />
          </div>
          <div className={style.formGroup}>
            {" "}
            {/* Keep formGroup for consistent input styling */}
            <label htmlFor="nodemapGoal">Goal:</label>
            <textarea // Changed input to textarea for goal
              id="nodemapGoal"
              name="goal" // Corrected name attribute to match backend key
              value={formData.goal}
              onChange={handleInputChange}
              rows="4" // Adjusted rows for a small textarea
              required
              disabled={disabled} // Add disabled prop
            ></textarea>{" "}
            {/* Use textarea for goal */}
          </div>
        </div>
      </div>
      {/* Bottom Section: Description */}
      <div className={style.descriptionArea}>
        {" "}
        {/* New container for the description */}
        <div className={style.formGroup}>
          {" "}
          {/* Keep formGroup for consistent input styling */}
          <label htmlFor="nodemapDescription">Description:</label>
          <textarea
            id="nodemapDescription" // Corrected ID
            name="description" // Corrected name attribute to match backend key
            value={formData.description}
            onChange={handleInputChange}
            rows="5" // Add a default number of rows
            required
            disabled={disabled} // Add disabled prop
            className={style.descriptionTextarea} // Added class for styling
          ></textarea>
        </div>
      </div>
      {/* Display feedback message based on local state */}
      {displayMessage && (
        <p className={isError ? style.error : style.success}>
          {" "}
          {/* Use local state for styling */}
          {displayMessage}
        </p>
      )}
      <button type="submit" className={style.submitButton} disabled={disabled}>
        Create Nodemap {/* Corrected button text */}
      </button>
    </form>
  );
};

export default CreateNodeMap;
