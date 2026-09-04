# Suze OS

## 项目定位

**Personal Operating System**

Suze OS 是面向个人工作、学习、求职和复盘的本地优先操作系统。当前版本聚焦浏览器端能力，暂不依赖后端服务。

## 当前版本

**V3.1 — 本地数据能力增强**

## 已完成模块

- Dashboard
- AI Workflow
- Job Radar
- Journal
- Review
- Learning Library
- Local Data Layer

## 当前技术架构

### Frontend

Vite + JavaScript

项目采用原生 JavaScript 和 Vite 多页面构建，不使用前端框架。首页与 `career/` 下的职业模块均作为独立入口参与构建。

### Storage

localStorage + storageService

所有浏览器存储访问统一通过 `src/services/storageService.js`。当前使用以下数据键：

- `suze-os-v3`：Dashboard 求职计数、Journal、Review 和更新时间。
- `suze-os-v3-job-radar`：Job Radar 岗位与面试明细。

`suze-os-v3` 保持 V3.0 的原始数据结构和备份兼容性。Job Radar 使用独立键，避免无法还原历史岗位明细时覆盖旧计数。

### Backend

待接入 Supabase。

当前没有登录、云端数据库或跨设备同步能力。

## 本地开发

需要 Node.js 22.12+ 或 24+，以及完整可用的 npm。

```sh
npm install
npm run dev
```

开发地址默认为 `http://localhost:5173`。必须通过开发服务器访问，不能直接双击 `index.html`。

生产构建与本地预览：

```sh
npm run build
npm run preview
```

构建产物输出到 `dist/`。`dist/` 和 `node_modules/` 不提交，`package-lock.json` 应随依赖变更提交。

## 目录结构

```text
index.html                       Dashboard 与主要模块入口
career/                          职业工作台多页面入口及共享样式
src/main.js                      首页初始化和交互
src/jobRadar.js                  Job Radar 页面交互
src/storage.js                   V3 主状态、校验、备份与清除
src/services/storageService.js   统一浏览器存储入口与 key 注册
src/services/jobRadarService.js  Job Radar 数据校验和持久化
src/style.css                    首页样式
src/workflows.js                 AI 工作流配置与启动逻辑
vite.config.js                   Vite 多页面构建配置
vercel.json                      Vercel 构建配置
DEVELOPMENT.md                   当前开发基线与待办
```

## 数据兼容

V3 主状态继续使用无外层封装、无 `schemaVersion` 的结构：

```json
{
  "job": { "applied": 0, "replies": 0, "interviews": 0, "offers": 0 },
  "journal": "",
  "review": "",
  "updatedAt": null
}
```

V3.0 备份可以直接导入，V3.1 导出的主状态备份也可在 V3.0 恢复。localStorage 按浏览器与来源隔离；更换协议、域名或端口前，应先从旧地址导出备份。

## 开发路线

### V3.1

本地数据能力增强。

### V3.2

Supabase Auth + Cloud Sync。

### V3.3

AI Agent 能力。

### V4

多设备个人操作系统。

## 部署

Vercel 使用 `npm ci` 和 `npm run build`，发布目录为 `dist`。当前阶段不包含 Supabase 或其他后端部署。

当前开发状态和未完成事项见 [DEVELOPMENT.md](DEVELOPMENT.md)。
