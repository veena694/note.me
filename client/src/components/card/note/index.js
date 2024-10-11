import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDate } from "../../../utils/formatDate";
import utils from "../../../utils/localstorage";
import styles from "./note.module.scss";

function Note(props) {
  const { id, text, date, color, onDelete } = props;  // Added `onDelete` prop for deleting note from parent
  const [expand, setExpand] = useState(false);
  const [noteText, setNoteText] = useState(text); // Initialize with `text` for editing
  const [isEditing, setIsEditing] = useState(false); // State to track editing mode

  const handleSave = () => {
    console.log("Save button clicked");  // Log when Save is clicked

    const authToken = utils.getFromLocalStorage("auth_key");
    if (!authToken) {
      toast.error("User should be authentic!");
      return;
    }

    if (!noteText.length || noteText.split(" ").length < 2) {
      toast.error("Notes text should contain at least 2 words!");
      return;
    }

    fetch(`http://localhost:8080/api/notes/${id ? id : ""}`, {  // Handle both new and edit
      headers: {
        "Content-Type": "application/json",
        authorization: authToken,
      },
      body: JSON.stringify({
        text: noteText,
        color,
      }),
      method: id ? "PUT" : "POST",  // Use PUT for existing, POST for new
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success === 200) {
          toast.success(id ? "Note updated successfully!" : "Note added successfully!");
          setIsEditing(false);  // Exit edit mode after saving
        } else {
          toast.error(data?.message);
        }
      })
      .catch((err) => {
        console.error(err);  // Log any errors
        toast.error("Notes creation/update failed!");
      });
  };

  const handleDelete = () => {
    console.log("Delete note with id:", id);  // Log the note id

    const authToken = utils.getFromLocalStorage("auth_key");
    if (!authToken) {
      toast.error("User should be authentic!");
      return;
    }

    fetch(`http://localhost:8080/api/notes/${id}`, {  // Ensure id is passed in the URL
      headers: {
        authorization: authToken,
      },
      method: "DELETE",  // HTTP method DELETE
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success === 200) {
          toast.success("Note deleted successfully!");
          onDelete(id);  // Call the parent's function to update the UI
        } else {
          toast.error(data?.message);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to delete note!");
      });
  };

  return (
    <article className={styles.container} style={{ backgroundColor: color }}>
      <div>
        {!isEditing ? (
          <>
            <p className={expand ? styles.expanded : ""}>
              {expand ? text : text.substring(0, 154)}
            </p>
            {text.length > 154 && (
              <button onClick={() => setExpand((prev) => !prev)} aria-label={`Read ${expand ? "less" : "more"}`}>
                Read {expand ? "less" : "more"}
              </button>
            )}
          </>
        ) : (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className={styles.textarea}
          />
        )}
      </div>
      <footer className={styles.footer}>
  <div>{formatDate(date)}</div>
  {!isEditing ? (
    <>
      <button className={styles["edit-btn"]} onClick={() => setIsEditing(true)} aria-label="Edit note">Edit</button>
      <button className={styles["delete-btn"]} onClick={handleDelete} aria-label="Delete note">Delete</button>
    </>
  ) : (
    <button onClick={handleSave} disabled={noteText.length < 10} aria-label="Save note">
      Save
    </button>
  )}
</footer>

    </article>
  );
}

export default Note;
