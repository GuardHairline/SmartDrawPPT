import React from "react";

export default function PreviewArea({ previewData, pptUrl }) {
  return (
    <div style={{ border: "1px solid #ccc", minHeight: 200, padding: 10 }}>
      <h3>文档/幻灯片预览</h3>
      {previewData ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(previewData, null, 2)}</pre>
      ) : (
        <span>请先上传文档</span>
      )}
      {pptUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={pptUrl} target="_blank" rel="noopener noreferrer">
            下载PPT
          </a>
        </div>
      )}
    </div>
  );
}
