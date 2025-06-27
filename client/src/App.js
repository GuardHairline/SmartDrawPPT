import React, { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Backdrop,
  CircularProgress,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PreviewIcon from '@mui/icons-material/Slideshow';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DownloadIcon from '@mui/icons-material/Download';
import axios from "axios";
import SplitPane from 'react-split-pane';
import './App.css';

function App() {
  const [docInfo, setDocInfo] = useState(null);
  const [structure, setStructure] = useState([]);
  const [pptImages, setPptImages] = useState([]);
  const [mapping, setMapping] = useState({});
  const [highlightedPage, setHighlightedPage] = useState(null);
  const [highlightedPara, setHighlightedPara] = useState(null);
  const pptRefs = useRef([]);
  const docRefs = useRef({});
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [pptTemplate, setPptTemplate] = useState('default');
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [appid, setAppid] = useState('');
  const [appkey, setAppkey] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResultIndices, setSearchResultIndices] = useState([]);
  const [searchActiveIdx, setSearchActiveIdx] = useState(0);

  // 上传文件
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/upload/", formData);
      setDocInfo(res.data);
      const res2 = await axios.post("http://localhost:8000/layout/analyze", {
        doc_id: res.data.doc_id,
        filename: res.data.filename,
      });
      setStructure(res2.data.structure);
      setPptImages([]);
      setMapping({});
      setSnackbar({ open: true, message: '上传并解析成功', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: '上传失败: ' + e.message, severity: 'error' });
    }
    setLoading(false);
  };

  // 转化PPT
  const handleConvert = async () => {
    if (!docInfo || structure.length === 0) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/ppt/generate", {
        doc_id: docInfo.doc_id,
        structure,
      });
      const res2 = await axios.get("http://localhost:8000/ppt/preview_images", {
        params: { doc_id: docInfo.doc_id },
      });
      setPptImages(res2.data.images);
      const res3 = await axios.get("http://localhost:8000/ppt/mapping", {
        params: { doc_id: docInfo.doc_id },
      });
      setMapping(res3.data);
      setSnackbar({ open: true, message: 'PPT生成并预览成功', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'PPT生成失败: ' + e.message, severity: 'error' });
    }
    setLoading(false);
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
      setSnackbar({ open: true, message: '操作成功，可点击生成PPT预览！', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: '操作失败: ' + e.message, severity: 'error' });
    }
    setLoading(false);
  };

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
      setSnackbar({ open: true, message: '本页AI操作成功', severity: 'success' });
      setContextMenu(null);
    } catch (e) {
      setSnackbar({ open: true, message: '操作失败: ' + (e.message || e), severity: 'error' });
    }
    setLoading(false);
  }

  // 用户菜单
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // 搜索功能：高亮并滚动到当前匹配段落
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (!value) {
      setSearchResultIndices([]);
      setSearchActiveIdx(0);
      return;
    }
    const indices = structure
      .map((para, idx) => para.text.includes(value) ? idx : -1)
      .filter(idx => idx !== -1);
    setSearchResultIndices(indices);
    setSearchActiveIdx(0);
    if (indices.length > 0 && structure[indices[0]] && docRefs.current[structure[indices[0]].id]) {
      docRefs.current[structure[indices[0]].id].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSearchNav = (direction) => {
    if (searchResultIndices.length === 0) return;
    let nextIdx = searchActiveIdx + direction;
    if (nextIdx < 0) nextIdx = searchResultIndices.length - 1;
    if (nextIdx >= searchResultIndices.length) nextIdx = 0;
    setSearchActiveIdx(nextIdx);
    const idx = searchResultIndices[nextIdx];
    if (structure[idx] && docRefs.current[structure[idx].id]) {
      docRefs.current[structure[idx].id].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f6fa', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <img src="/logo192.png" alt="logo" style={{ width: 40, marginRight: 16 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 2 }}>
            智绘PPT
          </Typography>
          {/* 用户菜单 */}
          <Tooltip title="用户菜单">
            <IconButton color="inherit" onClick={handleUserMenuOpen} size="large">
              <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
            <MenuItem onClick={handleUserMenuClose}>个人中心</MenuItem>
            <MenuItem onClick={() => { setApiDialogOpen(true); handleUserMenuClose(); }}>API配置</MenuItem>
            <MenuItem onClick={handleUserMenuClose}>退出登录</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* 顶部操作按钮区 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, gap: 2, bgcolor: '#fff', boxShadow: 1 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          color="primary"
        >
          上传文档
          <input type="file" accept=".docx,.txt" hidden onChange={handleUpload} />
        </Button>
        <Button
          variant="contained"
          startIcon={<PreviewIcon />}
          color="secondary"
          disabled={!docInfo || !structure.length}
          onClick={handleConvert}
        >
          转化并预览PPT
        </Button>
        <Button
          variant="outlined"
          startIcon={<AutoFixHighIcon />}
          color="primary"
          disabled={!docInfo}
          onClick={() => handlePolish('polish')}
        >
          全部润色
        </Button>
        <Button
          variant="outlined"
          startIcon={<SummarizeIcon />}
          color="warning"
          disabled={!docInfo}
          onClick={() => handlePolish('summarize')}
        >
          全部删减
        </Button>
      </Box>
      {/* 主体内容区：左右可拖拽分栏 */}
      <Box sx={{ p: 3, minHeight: '80vh' }}>
        <SplitPane split="vertical" minSize={300} defaultSize="50%" style={{ position: 'relative' }}>
          {/* PPT预览区（左） */}
          <Box sx={{ height: '75vh', pr: 1, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ p: 2, boxShadow: 3, height: '100%', bgcolor: '#f8f8f8', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>PPT预览</span>
                {/* 下载按钮 */}
                <IconButton
                  size="small"
                  color="primary"
                  onClick={async () => {
                    if (!docInfo) return;
                    try {
                      const res = await fetch(`http://localhost:8000/ppt/download?doc_id=${docInfo.doc_id}`);
                      if (!res.ok) throw new Error('下载失败');
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = (docInfo.filename ? docInfo.filename.replace(/\.[^.]+$/, '') : 'PPT') + '.pptx';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (e) {
                      setSnackbar({ open: true, message: 'PPT下载失败', severity: 'error' });
                    }
                  }}
                  disabled={!docInfo}
                  sx={{ ml: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Typography>
              {/* 模板选择下拉框 */}
              <FormControl size="small" sx={{ minWidth: 140, mb: 2, bgcolor: '#fff', borderRadius: 1 }}>
                <InputLabel id="ppt-template-label">PPT模板</InputLabel>
                <Select
                  labelId="ppt-template-label"
                  id="ppt-template-select"
                  value={pptTemplate}
                  label="PPT模板"
                  onChange={e => setPptTemplate(e.target.value)}
                  input={<OutlinedInput label="PPT模板" />}
                >
                  <MenuItem value="default">无主题</MenuItem>
                  <MenuItem value="simple">简约蓝</MenuItem>
                  <MenuItem value="business">商务灰</MenuItem>
                  <MenuItem value="academic">学术紫</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: pptImages.length === 0 ? 'center' : 'flex-start', alignItems: 'center' }}>
                {pptImages.length === 0 ? (
                  <Typography color="text.secondary" sx={{ opacity: 0.7 }}>
                    暂无PPT内容，请先上传文档并生成PPT
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {pptImages.map((img, idx) => (
                      <Grid item xs={12} key={img}>
                        <Card
                          ref={el => pptRefs.current[idx] = el}
                          sx={{
                            border: getHighlightedPages().includes(idx + 1)
                              ? '3px solid orange'
                              : (highlightedPage === String(idx + 1)
                                ? '2px solid #1976d2'
                                : '1px solid #eee'),
                            boxShadow: getHighlightedPages().includes(idx + 1)
                              ? '0 0 10px orange'
                              : '',
                            cursor: 'pointer',
                            transition: 'border 0.2s',
                            mb: 1
                          }}
                          onMouseEnter={() => setHighlightedPage(String(idx + 1))}
                          onMouseLeave={() => setHighlightedPage(null)}
                          onClick={() => {
                            const paraId = mapping[String(idx + 1)]?.[0];
                            if (paraId && docRefs.current[paraId]) {
                              docRefs.current[paraId].scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          onContextMenu={e => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, page: idx });
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={`http://localhost:8000${img}`}
                            alt={`PPT第${idx + 1}页`}
                            sx={{ width: '100%', borderRadius: 2 }}
                          />
                          <CardContent sx={{ p: 1, textAlign: 'center', fontSize: 14, color: '#888' }}>
                            第{idx + 1}页
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Card>
          </Box>
          {/* 原文预览区（右） */}
          <Box sx={{ height: '75vh', pl: 1, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ p: 2, boxShadow: 3, height: '100%', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                原文预览
              </Typography>
              {/* 搜索框 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="搜索原文内容"
                  value={searchText}
                  onChange={handleSearch}
                  sx={{ flex: 1 }}
                  variant="outlined"
                />
                <IconButton
                  size="small"
                  onClick={() => handleSearchNav(-1)}
                  disabled={searchResultIndices.length === 0}
                  sx={{ ml: 1 }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleSearchNav(1)}
                  disabled={searchResultIndices.length === 0}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                {searchText && searchResultIndices.length > 0 && (
                  <Typography sx={{ ml: 1, fontSize: 13, color: '#1976d2' }}>{searchActiveIdx + 1}/{searchResultIndices.length}</Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: structure.length === 0 ? 'center' : 'flex-start', alignItems: 'center' }}>
                {structure.length === 0 ? (
                  <Typography color="text.secondary" sx={{ opacity: 0.7 }}>
                    暂无原文内容，请先上传文档
                  </Typography>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {structure.map((para, idx) => {
                      const isMatch = searchText && searchResultIndices.includes(idx);
                      const isActive = isMatch && searchResultIndices[searchActiveIdx] === idx;
                      return (
                        <ListItem
                          key={para.id}
                          ref={el => docRefs.current[para.id] = el}
                          sx={{
                            bgcolor: isActive
                              ? '#1976d2'
                              : (isMatch
                                ? '#e3f2fd'
                                : (getHighlightedParas().includes(para.id)
                                  ? '#ffe58f'
                                  : (highlightedPara === para.id ? '#ffd6d6' : ''))),
                            color: isActive ? '#fff' : 'inherit',
                            border: isActive ? '2px solid #1976d2' : undefined,
                            borderRadius: 2,
                            mb: 1,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={() => setHighlightedPara(para.id)}
                          onMouseLeave={() => setHighlightedPara(null)}
                          onClick={() => {
                            const page = Object.entries(mapping).find(([page, ids]) => ids.includes(para.id))?.[0];
                            if (page && pptRefs.current[parseInt(page) - 1]) {
                              pptRefs.current[parseInt(page) - 1].scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                        >
                          <ListItemText primary={para.text} />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Card>
          </Box>
        </SplitPane>
      </Box>
      {/* 右键菜单 */}
      <Menu
        open={!!contextMenu}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
        PaperProps={{ sx: { minWidth: 160 } }}
      >
        {[{ label: "润色本页", mode: "polish" }, { label: "删减本页", mode: "summarize" }, { label: "增添图片建议", mode: "add_image" }].map(item => (
          <MenuItem key={item.mode} onClick={() => handlePagePolish(item.mode)}>
            {item.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => setContextMenu(null)} sx={{ color: '#888' }}>取消</MenuItem>
      </Menu>
      {/* 全局Loading */}
      <Backdrop open={loading} sx={{ color: '#1976d2', zIndex: 2000 }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>处理中，请稍候...</Typography>
      </Backdrop>
      {/* 全局通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      {/* API配置Dialog */}
      <Dialog open={apiDialogOpen} onClose={() => setApiDialogOpen(false)}>
        <DialogTitle>API配置</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="AppID"
            fullWidth
            value={appid}
            onChange={e => setAppid(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="AppKey"
            fullWidth
            value={appkey}
            onChange={e => setAppkey(e.target.value)}
            variant="outlined"
            type="password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiDialogOpen(false)}>取消</Button>
          <Button onClick={() => setApiDialogOpen(false)} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
