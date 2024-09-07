import React from "react";
import Editor from "react-simple-wysiwyg";
import './TextEditor.css'; // Import the CSS file

function TextEditor({ html, setHtml }) {
  function onChange(e) {
    const newValue = e.target.value.replace(/\n/g, "<br/>");
    setHtml(newValue);
  }

  return (
    <div className="editor-container">
      <Editor
        value={html}
        onChange={onChange}
      />
    </div>
  );
}

export default TextEditor;