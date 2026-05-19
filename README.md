# 🚗 车在这儿 — new.carhere.net 线上网站技术分析

> 基于对 http://new.carhere.net 实际部署版本的探测分析（非本地仓库代码）。

---

## 线上概况

```text
URL:            http://new.carhere.net
服务器:          Nginx/1.10.2
最后部署:        2025-03-10
入口类型:        SPA（单页应用）
前端挂载点:      <div id="app">
构建工具:        Webpack（multi-chunk 拆分，278 个异步块）
```

---

## 技术栈分析

> 以下结论通过分析 HTML 源码、下载解析 vendor.js（1.6MB）和 app.js（376KB）得出。

### 前端核心技术

| 技术 | 版本/特征 | 用途 | 判断依据 |
|------|----------|------|----------|
| **Vue.js** | 2.x | 核心 MVVM 框架 | vendor.js 中 `vue` 关键字出现 151 次，组件定义含 `name`/`props`/`inject`/`computed` 等 Vue 2.x 特征 |
| **Webpack** | 3.x | 模块打包 + chunk 拆分 | `window.webpackJsonp` 特征码，278 个异步 chunk |
| **layui** | 最新版 | UI 组件库（表格/表单/弹窗/导航） | HTML 直接引用 `layui.css` + `layui.all.js` |
| **zTree** | — | 树形控件（设备分组树） | `zTreeStyle.css` 引用 |
| **ECharts** | — | 数据可视化图表 | vendor.js 中检测到 `echarts`/`ECharts` |
| **jQuery** | layui 内置版 | DOM 操作 + Ajax | `layui.jquery` 引用 |
| **lodash** | — | 工具函数库 | vendor.js 中检测到 |
| **CryptoJS** | AES | 前端数据加密 | app.js 中 `AES.encrypt`/`AES.decrypt`，密钥 `"carhere"` |
| **xlsx** | — | Excel 导入导出 | HTML 引用 `xlsx.core.min.js` |
| **hls.js** | — | HLS 视频流播放 | HTML 引用 `hls.js` |

### 国际化

从 app.js 检测到 **11 种语言** 支持：

```
cn | en | vi | fr | pt | en-IN | es | km | th | ru | my
```

### 后端技术（推测）

- 后端 API 路由全部返回 404（后端服务未随 Nginx 一起运行或路径不匹配）
- 从 app.js 中提取到的 API 路径表明后端支持：
  - 设备管理（CRUD + 指令下发 + 图片/视频管理）
  - 支付系统（账户管理）
  - 用户管理
- 后端技术栈无法直接判定（可能 Java / PHP / Node.js）

### 部署架构

```
浏览器
  │
  ▼
Nginx 1.10.2 (:80)
  ├── /                    → SPA 入口 index.html
  ├── /static/js/*         → Webpack 构建产物（manifest / vendor / app + 278 chunks）
  ├── /static/css/*        → 样式文件（layui + zTree + app）
  ├── /static/img/*        → 静态图片（favicon 等）
  └── /api/*               → 反向代理到后端（当前不可达，404）
```

---

## 线上部署文件结构

```
/usr/share/nginx/html/                    # Nginx 静态根目录（推测）
├── index.html                            # SPA 入口
├── static/
│   ├── css/
│   │   ├── app.fd1182656cda916ed26.css   # Webpack 提取的业务 CSS
│   │   ├── zTreeStyle.css                # zTree 树形控件样式
│   │   └── ...
│   ├── js/
│   │   ├── manifest.66d40fd0a753498deabb.js  # Webpack runtime (5KB)
│   │   ├── vendor.fc0fba0d75b193c18ae9.js   # 第三方库 (1.6MB)
│   │   │   └── 包含: Vue + VueRouter + Vuex + jQuery + lodash + ECharts
│   │   ├── app.e56b94efe6d15cb725d2.js      # 业务代码 (376KB)
│   │   │   └── 包含: 路由配置/API请求/组件/国际化/加密
│   │   ├── [0].{hash}.js      ~ [278].{hash}.js  # 278 个异步路由 chunk
│   │   ├── xlsx.core.min.js                # Excel 处理库
│   │   ├── hls.js                          # HLS 视频流播放
│   │   └── linkConfig.min.js               # 外部链接配置
│   ├── img/
│   │   └── autoimage/
│   │       └── ico_ch.ico                  # 网站 Favicon
│   └── html/
│       └── versions.html                   # IE 低版本浏览器跳转页
└── layui/
    ├── css/
    │   └── layui.css
    └── layui.all.js
```

> 以上结构基于 HTML `<script>`/`<link>` 标签和 Webpack manifest chunk 映射表推断。

---

## 功能模块分析

> 以下功能通过分析 HTML meta、app.js 中的 API 路径、layui 组件特征、vendor.js 库列表综合推断。

### 1. 🔐 用户登录认证
- **入口流程**：主页 → 点击「我要体验」→ 登录页
- **认证方式**：用户名 + 密码登录
- **安全加密**：前端使用 CryptoJS AES 算法加密密码（密钥 `"carhere"`），避免明文传输
- **多语言**：登录页支持 11 种语言切换

### 2. 📍 GPS 实时追踪（核心功能）
- **Meta 定位**：`GPS定位器`、`车载定位终端`、`车在这儿`
- **地图引擎**：推测使用百度地图或高德地图 JS API（CDN 外部加载，未打包进 vendor）
- **设备分组**：zTree 树形控件实现多层级设备分组
- **实时位置**：设备以图标形式标注在地图上，显示经纬度、速度、方向
- **数据刷新**：定时 Ajax 轮询或 WebSocket 推送获取最新 GPS 坐标

### 3. 📱 设备管理
- **设备 CRUD**：添加/编辑/删除 GPS 定位终端
- **设备信息**：IMEI 号、车牌号、SIM 卡号、设备型号、驾驶员姓名/电话
- **分组管理**：zTree 树形结构支持无限层级分组
- **指令下发**：`sendCommand` API — 远程向 GPS 终端发送控制指令
- **设备续费**：`deviceRenew` API — 设备服务续费
- **图标管理**：`updateIconTypeList` API — 自定义设备在地图上的图标类型
- **视频管理**：`videoDelete` API — 管理设备摄像头视频记录
- **图片管理**：`delDevicePicture` API — 管理设备上传的照片

### 4. 📊 数据可视化仪表盘
- **图表引擎**：ECharts
- **统计指标**（推测）：设备总数、在线率、告警趋势、里程统计、设备分布
- **报表组件**：layui 数据表格 + ECharts 图表混合展示

### 5. 🔔 智能告警系统
- **告警类型**（推断）：超速告警、围栏进出、SOS 求救、断电告警、震动告警
- **告警展示**：layui 表格列表 + 状态标签
- **实时通知**：浏览器弹窗或声音提醒

### 6. 💰 支付与账户系统
- **API 接口**（app.js 中实际提取）：
  - `GET /pay/account/list` — 账户列表查询
  - `POST /pay/account/add` — 添加支付账户
  - `POST /pay/account/edit` — 编辑支付账户
  - `POST /pay/account/del/:id` — 删除支付账户
  - `GET /pay/account/allowedPay` — 查询可用支付方式
- **业务场景**：设备续费、套餐购买、发票管理

### 7. 🎥 视频监控
- **视频播放器**：hls.js 实现 HLS 协议视频流播放
- **视频管理**：`videoDelete` API 管理历史视频
- **应用场景**：车载摄像头实时画面、历史录像回放

### 8. 📄 数据导出
- **Excel 导出**：xlsx 库生成 `.xlsx` 文件
- **右键菜单**：VContextmenuItem Vue 组件 — 表格行右键操作（如导出、删除、编辑）

---

## 技术难点

### 1. Webpack 大型 SPA 优化
- **278 个异步 chunk**：每个路由页面独立分包，按需加载
- **vendor 分离**：第三方库（1.6MB）单独打包，利用浏览器长期缓存
- **manifest 提取**：Webpack runtime 独立文件，vendor 内容不变时 hash 不变
- **代码压缩**：vendor.js 和 app.js 均已混淆压缩

### 2. GPS 大数据实时处理
- **海量轨迹点**：多设备持续上报 GPS，数据库需要高效写入和索引
- **地图渲染性能**：大量 Marker 同时显示时的 DOM 优化（Marker 聚合或视口裁剪）
- **轨迹回放**：历史数据分段异步加载 + 地图动画播放

### 3. 前端数据安全
- **AES 加密传输**：登录密码用 CryptoJS AES + 固定密钥 `"carhere"` 加密后传输
- **IP 安全校验**：`batchCheckTransferIpResults` API — 校验设备数据传输 IP
- **跨域处理**：Nginx 反向代理统一域名，避免前端跨域问题

### 4. 远程设备指令下发
- **`sendCommand` API**：服务器 → GPS 终端实时指令通道
- **指令类型**：位置上报频率调整、远程重启、电子锁控制、参数配置
- **可靠性要求**：指令送达确认、超时重试、执行结果回执

### 5. 多语言国际化架构
- **11 种语言**：中 / 英 / 越南 / 法 / 葡 / 印度英 / 西 / 高棉 / 泰 / 俄 / 缅甸
- **实现方式**：Vue 组件级别翻译 + 语言包按需加载
- **动态切换**：运行时无刷新切换语言

### 6. 视频流与车载设备集成
- **HLS 协议**：hls.js 在浏览器端解码 HLS 视频流
- **实时视频**：车载摄像头 RTMP/HLS 推流 → CDN 分发 → 浏览器播放

---

## 外部服务依赖

| 服务 | 用途 | 证据 |
|------|------|------|
| **Nginx 1.10.2** | Web 服务器 + 反向代理 | HTTP Response Header `Server: nginx/1.10.2` |
| **地图 API（推测百度/高德）** | 地图瓦片 + 地理编码 + 逆地理编码 | CDN 外部加载，未打包进 vendor |
| **HLS 视频流服务** | 车载摄像头视频直播/回放 | `hls.js` 文件引用 |
| **后端 API 服务** | 业务逻辑 + 数据库交互 | app.js 中的 `/api/*` 路径 |
| **CryptoJS** | 前端 AES 加密 | `AES.encrypt("carhere")` |

---

## 线上部署架构图

```
                              ┌──────────────┐
                              │   用户浏览器   │
                              │ Vue.js SPA    │
                              └──────┬───────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────┐
│                  Nginx 1.10.2 (:80)                 │
│                                                      │
│   /              → index.html                       │
│   /static/*      → 静态资源 (JS/CSS/图片)            │
│   /layui/*       → layui 框架文件                   │
│   /api/*         → proxy_pass http://backend:端口    │
│                                                      │
└──────────────────┬─────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼                         ▼
┌───────────┐          ┌──────────────────┐
│ 静态文件存储│          │   后端应用服务     │
│ /static/  │          │ (推测 Java/PHP)   │
│ /layui/   │          │   ↑ 当前 404      │
└───────────┘          └────────┬─────────┘
                                │
                          ┌─────┴──────┐
                          │   数据库     │
                          │ (推测 MySQL) │
                          └────────────┘
```

---

## 与本地仓库的关系

```
线上版 (new.carhere.net)           本地仓库 (wflCarHere)
═══════════════════════           ═══════════════════
Vue 2.x                           React 18 + TypeScript
Webpack 3.x                       Vite 6
layui + zTree                     Ant Design 5
jQuery                            Zustand
CryptoJS (AES)                    bcryptjs + JWT
CDN 地图 API                       Leaflet + OpenStreetMap
后端: 404 (未知)                    Express + better-sqlite3 + Socket.io
时间: 2025-03                      开发中

结论: 本地仓库是对线上旧版系统的完全重写
```

---

## 待确认项

以下信息因后端 API 不可达而无法直接验证：

- [ ] 后端技术栈语言和框架
- [ ] 数据库类型（MySQL / PostgreSQL / MongoDB）
- [ ] WebSocket 实时通信实现方式
- [ ] 地图 JS SDK 提供商（百度 / 高德 / Google Maps）
- [ ] 实际运行时的完整功能模块

---

> **分析时间**：2026-05-19  
> **分析方法**：HTML 静态分析 + Webpack 产物反查 + API 路径提取
