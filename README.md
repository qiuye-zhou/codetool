# CodeTool — 浏览器编解码工具面板

一款 Chromium 系浏览器扩展（Manifest V3），在任意页面通过右键菜单或工具栏图标打开独立工具面板，集中提供开发中常用的编码解码、格式转换和校验能力。

## 功能列表

| 标签 | 说明 |
| --- | --- |
| Base64 | 按 UTF-8 编解码；支持标准与 URL-Safe 互转 |
| URL | 标准 `encodeURIComponent` / 解码（解码时容错） |
| Unicode | `\uXXXX` / `\xXX` 互转，保留非 ASCII 可读表示 |
| HTML 实体 | 命名实体 `&amp;` 模式与数字实体 `&#123;` 模式可选 |
| Hex | UTF-8 字节十六进制表示；可选空格 / `0x` / 无分隔三种格式 |
| JWT 解析 | 仅本地解码 Header / Payload / Signature，不校验签名；展示过期状态 |
| 时间戳 | 输入 Unix 秒、毫秒或日期字符串，统一输出 Unix s/ms、ISO 8601、本地、UTC、相对时间；实时展示当前时钟 |
| Hash 加密 | MD5、SHA1、SHA224、SHA256、SHA384、SHA512 六档并行计算；按需复制 |
| 进制转换 | 2 / 8 / 10 / 16 四格联动；基于 `BigInt`，支持任意精度与负数 |

通用交互：所有编解码类面板共享同一「输入 → 方向切换 → 输出」布局，支持交换输入输出、结果复制、一键清空。

### 打开方式

- 浏览器任意位置右键 → **打开编码工具面板**
- 点击扩展工具栏图标
- 两种方式均复用已打开窗口（聚焦而非重复弹出）

面板默认尺寸 `1040 × 720`，可随意调整窗口大小。

## 目录结构

```
codetool/
├─ extension/              # 插件加载目录（构建产物）
├─ public/
│  └─ logo.png             # 128×128 扩展图标（由脚本生成）
├─ scripts/
│  ├─ gen-icon.mjs         # 图标生成：蓝色渐变 + </> 字形
│  ├─ prepare.ts           # 构建后处理：占位 HTML、复制静态资源、写入 manifest
│  ├─ manifest.ts          # Manifest V3 输出逻辑
│  └─ utils.ts             # 路径、端口、DEV 判定、日志工具
├─ src/
│  ├─ background/
│  │  └─ index.js          # Service Worker：右键菜单 + 工具栏按钮 + 窗口复用
│  ├─ panel/
│  │  ├─ App.vue           # 顶栏 / 标签栏 / 底栏 + 主题与标签状态管理
│  │  ├─ index.html · main.ts
│  │  ├─ components/
│  │  │  ├─ TabBar.vue     # 标签切换
│  │  │  ├─ CodecPanel.vue # 通用编解码面板
│  │  │  └─ tabs/          # 9 个标签页组件
│  │  └─ utils/            # codec / jwt / time / hash / radix 纯函数算法
│  ├─ style/main.css       # Tailwind v4 入口 + 字体 + 滚动条 + 深色变体
│  ├─ manifest.ts          # 项目级 MV3 定义
│  ├─ auto-imports.d.ts
│  └─ vite-env.d.ts
├─ vite.config.ts          # @ 别名 / AutoImport / outDir → extension/dist
├─ package.json
└─ tsconfig*.json
```

## 技术栈与约定

- **框架**：Vue 3 `<script setup>` + TypeScript + Vite 7
- **样式**：Tailwind CSS v4（`@tailwindcss/vite` 插件）；主题 `blue-400 → blue-600` 蓝色渐变
- **扩展标准**：Manifest V3 + `webextension-polyfill`
- **全局能力**：
  - `unplugin-auto-import` 自动引入 `vue` API 与 `browser`
  - `@/` 别名指向 `src/`
- **样式约定**：
  - UI 字体：Inter / PingFang SC / Microsoft YaHei 系统栈
  - 输入输出：`.font-mono-code`（JetBrains Mono 系列）
  - 深色模式通过 `<html class="dark">` 切换

## Manifest 权限声明

仅最小权限：

- `contextMenus`：创建右键菜单
- `storage`：面板状态存储扩展

Service Worker 为 ES Module 类型，使用 `chrome.*` API。
