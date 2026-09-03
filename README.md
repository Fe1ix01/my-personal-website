# Suze OS

V3.1 第一阶段：将已验收的 V3.0 页面迁移为最小 Vite + 原生 JavaScript 项目。保留 V3.0 的界面、功能、文案和数据格式；尚未接入 Supabase、登录或云同步。

## 本地运行

使用 Node.js 22.12+（22 LTS）或 24+，以及完整可用的 npm：

```sh
npm install
npm run dev
npm run build
npm run preview
```

开发地址默认是 `http://localhost:5173`，构建预览默认是 `http://localhost:4173`。通过终端显示的 HTTP 地址访问，不能直接双击 `index.html`。已有锁文件时可以用 `npm ci` 重现依赖安装。

本次验收使用 Node.js 24.19.0。当前电脑的内置 npm 缺少内部模块，因此验收通过仓库外的官方便携 npm 12.0.2 执行；项目没有依赖该临时路径。后续在普通终端开发前，请确认 `node --version` 和 `npm --version` 均能正常执行。

## 目录与职责

```text
index.html          页面结构、内容与模块入口
src/main.js         页面初始化、DOM 绑定、求职看板、日记、复盘、激励语
src/style.css       从 V3.0 原样抽出的首页样式
src/storage.js     V3 数据结构、localStorage、JSON 备份与清除
src/workflows.js   研究、求职、学习、内容工作流及多窗口启动
career/            原有 6 个 HTML 页面及样式，源文件保持不变
vite.config.js     首页和 career 页面的多入口构建
vercel.json        Vite 构建命令和 dist 输出目录
```

项目唯一的直接开发依赖是 Vite，无前端框架或运行时依赖。`dist/` 和 `node_modules/` 均不提交；`package-lock.json` 应随工程文件提交。

## V3.0 数据兼容

继续使用 `suze-os-v3` 这个 localStorage 键。`DATA_VERSION = 3` 仅用于标明代码支持的数据版本，不向已有数据增加字段。存储与导出仍使用以下无外层封装、无 `schemaVersion` 的格式：

```json
{
  "job": { "applied": 0, "replies": 0, "interviews": 0, "offers": 0 },
  "journal": "",
  "review": "",
  "updatedAt": null
}
```

V3.0 备份可直接导入，新版导出的备份也可在 V3.0 恢复。保留数据校验、存储失败提示、未保存内容离开提醒，以及多标签页覆盖冲突检测。

localStorage 按浏览器与来源（协议、主机、端口）隔离。同一来源升级可以直接读取旧数据；更换域名、端口，或从 `file://` 切换到 HTTP 时，应先在旧地址导出 JSON，再在新地址导入。Vite 迁移本身不提供跨来源或跨设备同步。

## Vercel 构建

`vercel.json` 明确指定 Vite、`npm ci`、`npm run build` 与 `dist`，适用于原先按纯静态 HTML 部署的仓库。项目根目录应为仓库根目录，Node 版本使用 22.12+ 或 24+。

构建会生成 `dist/index.html`、`dist/career/*.html` 和 `dist/assets/`。保留 `/career/jobs.html` 等路径和返回首页链接，不添加 SPA 通配重写。仅发布 `dist`，本地备份与测试文件不会进入构建产物。

本阶段仅进行本地构建和预览，不提交、不推送、不部署。后续发布仍需单独确认。

## 第一阶段验收

2026-09-03：开发服务、生产构建和构建预览通过。迁移前通过 V3.0 页面保存并导出测试数据，在同一浏览器来源切换到 Vite 后直接读取成功，重新导出的 JSON 与迁移前一致（含更新时间）；构建预览也通过旧备份导入验证。

已验证计数增减与零下限、转化率、日记和复盘刷新持久化、四种工作流、多标签启动、JSON 导入导出与错误文件保护、数据清除、6 个 career 页面及返回首页、桌面和手机布局。首页及 career 控制台未见错误。另有 9 项临时模块测试覆盖存储失败、损坏数据、导入回滚、多标签冲突与激励语定时切换，全部通过。测试脚本、数据和截图均保存在仓库外。

Vercel 已准备好构建配置，发布内容限定为 `dist`；本轮未执行远程部署，线上结果尚未验收。

参考：[Vite 多页面构建](https://vite.dev/guide/build#multi-page-app)、[Vercel Vite 支持](https://vercel.com/docs/frameworks/frontend/vite)。
