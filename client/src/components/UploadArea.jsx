import React, { useRef } from "react";

export default function UploadArea({ onUpload }) {
  const fileInput = useRef();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="file"
        accept=".docx,.txt,.pdf"
        ref={fileInput}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button onClick={() => fileInput.current.click()}>上传文档</button>
    </div>
  );
}
