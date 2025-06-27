# 智绘 PPT (SmartDrawPPT)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

> 一款面向法律、医疗、学术等专业领域的智能 PPT 生成工具，强调内容保真、结构化排版、AI 润色/删减、双向溯源等功能。

## 🌟 项目特色

- **内容保真**：确保专业术语和数据不被 AI 改写，保持原文准确性
- **双向溯源**：PPT 与原文双向映射，点击任意一端可跳转到另一端
- **智能润色**：支持全文或单页 AI 润色、删减、插图建议
- **专业模板**：内置商务、学术、简约等多种专业模板
- **实时预览**：PPT 生成后实时预览，支持拖拽调整布局
- **搜索定位**：全文搜索功能，快速定位原文内容

## �� 功能特性

### 核心功能

- ✅ 文档上传与解析（支持.docx、.txt 格式）
- ✅ 智能结构化分析
- ✅ PPT 自动生成与预览
- ✅ AI 润色与删减（全文/单页）
- ✅ 双向溯源与跳转
- ✅ 模板选择与切换
- ✅ 文件下载功能
- ✅ 原文搜索与定位

### 技术特色

- �� 中间页结构设计，原文永不变
- 🎯 精确的映射表机制
- 🤖 蓝心大模型 AI 集成
- �� Material-UI 现代化界面
- �� 响应式布局设计
- ⚡ 实时交互反馈

## 🏗️ 系统架构

```
SmartDrawPPT/
├── client/                 # React前端应用
│   ├── src/
│   │   ├── App.js         # 主应用组件
│   │   ├── components/    # UI组件
│   │   └── ...
│   ├── package.json       # 前端依赖
│   └── ...
├── server/                # FastAPI后端服务
│   ├── routers/          # API路由
│   ├── services/         # 业务逻辑
│   ├── integrations/     # 第三方集成
│   ├── templates/        # PPT模板
│   ├── output/           # 生成文件输出
│   └── main.py           # 服务入口
├── config/               # 配置文件
└── doc/                  # 项目文档
```

## 🚀 快速开始

### 环境要求

- **Python**: 3.8+
- **Node.js**: 16+
- **npm**: 8+

### 后端部署

1. **克隆项目**

```bash
git clone https://github.com/GuardHairline/SmartDrawPPT.git
cd SmartDrawPPT
```

2. **创建虚拟环境**

```bash
# 使用conda
conda create -n SmartDrawPPT python=3.8
conda activate SmartDrawPPT

# 或使用venv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
```

3. **安装后端依赖**

```bash
cd server
pip install -r requirements.txt
```

4. **配置设置**

```bash
# 编辑 config/settings.yaml
cp config/settings.yaml.example config/settings.yaml
# 配置服务器地址、端口等
```

5. **启动后端服务**

```bash
python main.py
# 或使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 前端部署

1. **安装前端依赖**

```bash
cd client
npm install
```

2. **启动开发服务器**

```bash
npm start
```

3. **构建生产版本**

```bash
npm run build
```

## 使用指南

### 基本操作流程

1. **上传文档**

   - 点击"上传文档"按钮
   - 选择.docx 或.txt 文件
   - 系统自动解析文档结构

2. **生成 PPT**

   - 选择 PPT 模板（简约蓝/商务灰/学术紫）
   - 点击"转化并预览 PPT"
   - 查看生成的 PPT 预览

3. **AI 优化**

   - 全文优化：点击"全部润色"或"全部删减"
   - 单页优化：右键 PPT 页面选择操作
   - 查看优化结果并重新生成预览

4. **内容溯源**

   - 鼠标悬停 PPT 页面，右侧原文高亮对应段落
   - 鼠标悬停原文段落，左侧 PPT 页面高亮
   - 点击任意一端可跳转到对应位置

5. **搜索定位**
   - 在搜索框输入关键词
   - 使用上下导航按钮浏览结果
   - 点击结果直接跳转到对应位置

### 高级功能

- **模板管理**：支持自定义 PPT 模板上传
- **API 配置**：通过用户菜单配置 AI 接口参数
- **文件下载**：一键下载生成的 PPT 文件
- **响应式布局**：支持左右分栏拖拽调整

## API 接口

### 主要接口

| 接口                             | 方法 | 功能描述          |
| -------------------------------- | ---- | ----------------- |
| `/upload/`                       | POST | 文档上传          |
| `/layout/analyze`                | POST | 文档结构化分析    |
| `/ppt/generate`                  | POST | PPT 生成          |
| `/ppt/preview_images`            | GET  | 获取 PPT 预览图片 |
| `/ppt/mapping`                   | GET  | 获取映射表        |
| `/polish/polish_all`             | POST | 全文 AI 润色      |
| `/polish/polish_page_structured` | POST | 单页 AI 润色      |
| `/ppt/download`                  | GET  | PPT 文件下载      |

### 详细 API 文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看完整的 API 文档。

## 🎨 UI 设计

### 设计风格

- **Material-UI**：采用 Google Material Design 设计语言
- **蓝色主题**：专业、科技感的蓝色主色调
- **响应式布局**：支持不同屏幕尺寸适配
- **现代化界面**：简洁直观的用户体验

### 主要界面

- **顶部导航栏**：品牌 logo、用户菜单
- **操作按钮区**：文件上传、PPT 生成、AI 操作
- **PPT 预览区**：模板选择、图片轮播、右键菜单
- **原文预览区**：搜索框、段落列表、高亮显示

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd server
python -m pytest

# 前端测试
cd client
npm test
```

### 测试覆盖

- ✅ 单元测试：核心模块功能验证
- ✅ 集成测试：API 接口和业务流程
- ✅ UI 测试：界面交互和用户体验
- ✅ 性能测试：大文件和并发处理
- ✅ 安全测试：文件上传和权限控制

## 📁 项目结构

```
SmartDrawPPT/
├── client/                     # React前端
│   ├── public/                # 静态资源
│   ├── src/
│   │   ├── App.js            # 主应用
│   │   ├── App.css           # 样式文件
│   │   └── components/       # 组件目录
│   │       ├── PreviewArea.jsx
│   │       └── UploadArea.jsx
│   ├── package.json          # 依赖配置
│   └── README.md
├── server/                    # FastAPI后端
│   ├── routers/              # 路由模块
│   │   ├── upload.py         # 文件上传
│   │   ├── layout.py         # 结构化分析
│   │   ├── ppt.py            # PPT生成
│   │   ├── polish.py         # AI润色
│   │   └── mapping.py        # 映射管理
│   ├── services/             # 业务服务
│   │   ├── input_handler.py  # 输入处理
│   │   ├── layout_engine.py  # 布局引擎
│   │   ├── ppt_generator.py  # PPT生成器
│   │   ├── polish_service.py # AI服务
│   │   └── mapping.py        # 映射服务
│   ├── integrations/         # 第三方集成
│   │   └── bluelm_client.py  # 蓝心大模型
│   ├── templates/            # PPT模板
│   │   ├── academic.pptx     # 学术模板
│   │   ├── business.pptx     # 商务模板
│   │   └── reproduce.pptx    # 简约模板
│   ├── output/               # 输出文件
│   ├── user_input/           # 用户上传文件
│   ├── main.py               # 服务入口
│   └── requirements.txt      # Python依赖
├── config/                   # 配置文件
│   └── settings.yaml         # 系统设置
├── doc/                      # 项目文档
├── .gitignore               # Git忽略文件
├── package-lock.json        # 依赖锁定
└── README.md                # 项目说明
```

## 配置说明

### 环境变量

```bash
# 服务器配置
HOST=0.0.0.0
PORT=8000
RELOAD=true

# AI服务配置
BLUELM_APPID=your_app_id
BLUELM_APPKEY=your_app_key
BLUELM_API_URL=https://aigc.vivo.com.cn/api/v1
```

### 配置文件

编辑 `config/settings.yaml`：

```yaml
server:
  host: "0.0.0.0"
  port: 8000
  reload: true

ai:
  bluelm:
    appid: "your_app_id"
    appkey: "your_app_key"
    api_url: "https://aigc.vivo.com.cn/api/v1"
```

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t smartdrawppt .

# 运行容器
docker run -p 8000:8000 smartdrawppt
```

### 生产环境

1. 配置反向代理（Nginx）
2. 设置 SSL 证书
3. 配置数据库（可选）
4. 设置日志监控
5. 配置备份策略

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目主页：[GitHub Repository](https://github.com/GuardHairline/SmartDrawPPT)
- 问题反馈：[Issues](https://github.com/GuardHairline/SmartDrawPPT/issues)
- 邮箱：2120240827@mail.nankai.edu.cn

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代、快速的 Web 框架
- [React](https://reactjs.org/) - 用户界面库
- [Material-UI](https://mui.com/) - React UI 组件库
- [蓝心大模型](https://aigc.vivo.com.cn/) - AI 服务提供商

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
