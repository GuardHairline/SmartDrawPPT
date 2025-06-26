import React, { useState, useRef } from "react";
import UploadArea from "./components/UploadArea";
import PreviewArea from "./components/PreviewArea";
import axios from "axios";
import SplitPane from "react-split-pane";

function App() {
  const [docInfo, setDocInfo] = useState(null); // {doc_id, filename}
  const [structure, setStructure] = useState([]); // 文档结构
  const [pptUrl, setPptUrl] = useState(""); // PPT下载链接
  const [pptImages, setPptImages] = useState([]);
  const [mapping, setMapping] = useState({});
  const [highlightedPage, setHighlightedPage] = useState(null);
  const [highlightedPara, setHighlightedPara] = useState(null);
  const pptRefs = useRef([]);
  const docRefs = useRef({});
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  const buttonStyle = {
    margin: "0 10px",
    padding: "8px 20px",
    background: "#1677ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 2px 8px #1677ff22",
    transition: "background 0.2s",
    opacity: docInfo ? 1 : 0.5
  };

  // 上传文件
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/upload/", formData);
    setDocInfo(res.data);

    // 获取结构化内容
    const res2 = await axios.post("http://localhost:8000/layout/analyze", {
      doc_id: res.data.doc_id,
      filename: res.data.filename,
    });
    setStructure(res2.data.structure);
    setPptImages([]);
    setMapping({});
  };

  // 转化PPT
  const handleConvert = async () => {
    if (!docInfo || structure.length === 0) return;
    await axios.post("http://localhost:8000/ppt/generate", {
      doc_id: docInfo.doc_id,
      structure,
    });
    // 获取图片
    const res2 = await axios.get("http://localhost:8000/ppt/preview_images", {
      params: { doc_id: docInfo.doc_id },
    });
    // console.log("图片列表：", res2.data.images);
    setPptImages(res2.data.images);
    // 获取映射
    const res3 = await axios.get("http://localhost:8000/ppt/mapping", {
      params: { doc_id: docInfo.doc_id },
    });
    setMapping(res3.data);
  };

  // 获取当前高亮的原文ID列表
  const getHighlightedParas = () => {
    if (highlightedPage && mapping[highlightedPage]) {
      return mapping[highlightedPage];
    }
    return [];
  };

  // 获取当前高亮的PPT页码
  const getHighlightedPages = () => {
    if (!highlightedPara) return [];
    return Object.entries(mapping)
      .filter(([page, ids]) => ids.includes(highlightedPara))
      .map(([page]) => parseInt(page));
  };

  const handlePolish = async (mode) => {
    if (!docInfo) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/polish/polish_all", {
        doc_id: docInfo.doc_id,
        mode,
      });
      setStructure(res.data.new_structure);
      alert("操作成功，可点击生成PPT预览！");
    } catch (e) {
      alert("操作失败：" + e.message);
    }
    setLoading(false);
  };

  function handleContextMenu(e, pageIdx) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, page: pageIdx });
  }

  async function handlePagePolish(mode) {
    setLoading(true);
    try {
      const paraIds = mapping[String(contextMenu.page + 1)];
      // 1. 润色本页
      await axios.post("http://localhost:8000/polish/polish_page_structured", {
        doc_id: docInfo.doc_id,
        para_ids: paraIds,
        mode,
      });

      // 2. 重新生成PPT
      await axios.post("http://localhost:8000/ppt/generate", {
        doc_id: docInfo.doc_id,
        structure: [], // 可传空，后端自动用中间页
      });

      // 3. 获取最新PPT图片列表
      const res2 = await axios.get("http://localhost:8000/ppt/preview_images", {
        params: { doc_id: docInfo.doc_id },
      });
      setPptImages(res2.data.images);

      // 4. 获取最新映射表（如有需要）
      const res3 = await axios.get("http://localhost:8000/ppt/mapping", {
        params: { doc_id: docInfo.doc_id },
      });
      setMapping(res3.data);

      setContextMenu(null);
    } catch (e) {
      alert("操作失败：" + (e.message || e));
    }
    setLoading(false);
  }

  return (
    <div>
      <h2>智绘PPT - 双向溯源预览</h2>
      <input type="file" accept=".docx,.txt" onChange={handleUpload} />
      <button
        onClick={handleConvert}
        disabled={!docInfo || !structure.length}
        style={buttonStyle}
      >
        转化并预览PPT
      </button>
      <button
        onClick={() => handlePolish('polish')}
        disabled={!docInfo}
        style={buttonStyle}
      >
        全部润色
      </button>
      <button
        onClick={() => handlePolish('summarize')}
        disabled={!docInfo}
        style={buttonStyle}
      >
        全部删减
      </button>

      <SplitPane split="vertical" minSize={400} defaultSize={600}>
        {/* 左侧PPT图片预览 */}
        <div style={{ padding: 10, height: "80vh", overflowY: "auto", background: "#f8f8f8" }}>
          <h3>PPT预览</h3>
          {pptImages.map((img, idx) => (
            <img
              key={img}
              ref={el => pptRefs.current[idx] = el}
              src={`http://localhost:8000${img}`}
              alt={`PPT第${idx + 1}页`}
              style={{
                width: "90%",
                margin: "10px 0",
                border: getHighlightedPages().includes(idx + 1) ? "4px solid orange" : (highlightedPage === String(idx + 1) ? "2px solid red" : "1px solid #ccc"),
                cursor: "pointer",
                boxShadow: getHighlightedPages().includes(idx + 1) ? "0 0 10px orange" : ""
              }}
              onMouseEnter={() => setHighlightedPage(String(idx + 1))}
              onMouseLeave={() => setHighlightedPage(null)}
              onClick={() => {
                // 允许点击PPT图片时，右侧自动滚动到第一个对应原文段落
                const paraId = mapping[String(idx + 1)]?.[0];
                if (paraId && docRefs.current[paraId]) {
                  docRefs.current[paraId].scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              onContextMenu={e => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, page: idx });
              }}
            />
          ))}
        </div>
        {/* 右侧原文预览 */}
        <div style={{ padding: 10, height: "80vh", overflowY: "auto", background: "#fff" }}>
          <h3>原文预览</h3>
          {structure.map(para => (
            <div
              key={para.id}
              ref={el => docRefs.current[para.id] = el}
              style={{
                background: getHighlightedParas().includes(para.id) ? "#ffe58f" : (highlightedPara === para.id ? "#ffd6d6" : ""),
                padding: "6px 10px",
                margin: "4px 0",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onMouseEnter={() => setHighlightedPara(para.id)}
              onMouseLeave={() => setHighlightedPara(null)}
              onClick={() => {
                // 允许点击原文时，左侧自动滚动到第一个包含该段的PPT图片
                const page = Object.entries(mapping).find(([page, ids]) => ids.includes(para.id))?.[0];
                if (page && pptRefs.current[parseInt(page) - 1]) {
                  pptRefs.current[parseInt(page) - 1].scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            >
              {para.text}
            </div>
          ))}
        </div>
      </SplitPane>
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 16px #0002",
            zIndex: 1000,
            minWidth: 120,
            padding: "4px 0"
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {[
            { label: "润色本页", mode: "polish" },
            { label: "删减本页", mode: "summarize" },
            { label: "增添图片建议", mode: "add_image" }
          ].map(item => (
            <div
              key={item.mode}
              onClick={() => handlePagePolish(item.mode)}
              style={{
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: "15px",
                color: "#333",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e6f4ff")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </div>
          ))}
          <div
            onClick={() => setContextMenu(null)}
            style={{
              padding: "8px 20px",
              cursor: "pointer",
              color: "#888",
              fontSize: "15px"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            取消
          </div>
        </div>
      )}
      {loading && <div style={{position: "fixed", top: 0, left: 0, right: 0, background: "#fff8", zIndex: 9999, textAlign: "center"}}>处理中，请稍候...</div>}
    </div>
  );
}

export default App;
