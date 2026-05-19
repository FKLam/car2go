# 🚗 车在这儿 — new.carhere.net 线上网站技术分析

> 基于对 http://new.carhere.net 实际部署版本的探测分析（非本地仓库代码）。

---

## 线上概况

```text
URL:            http://new.carhere.net
服务器:          Nginx/1.10.2
最后部署:        2025-03-10
入口类型:        SPA（单页应用）
路由模式:        Hash 路由（#/index/home）
前端挂载点:      <div id="app">
构建工具:        Webpack（multi-chunk 拆分，278 个异步块）
默认首页:        #/index/home（监控平台）
```

---

## 技术栈分析

> 以下结论通过分析 HTML 源码、下载解析 vendor.js（1.6MB）和 app.js（376KB）得出。

### 前端核心技术

| 技术 | 版本/特征 | 用途 | 判断依据 |
|------|----------|------|----------|
| **Vue.js** | 2.x | 核心 MVVM 框架 | vendor.js 中 `vue` 出现 151 次，组件含 `name/props/inject/computed` |
| **Vue Router** | 3.x | 客户端路由（Hash） | 提取到 94+ 条 `path:"..."` 路由配置 |
| **Vuex** | 3.x | 全局状态管理 | `SET_LEFTMENUSTATE` / `SET_INDEX_MH` / `SET_DEVICEMENUTYPE` 等 mutation |
| **Webpack** | 3.x | 模块打包 + chunk 拆分 | `window.webpackJsonp` 特征码，278 chunk |
| **layui** | 最新版 | UI 组件库（表格/表单/弹窗） | HTML 引用 `layui.css` + `layui.all.js` |
| **zTree** | — | 设备分组树控件 | `zTreeStyle.css` 引用 |
| **ECharts** | — | 数据可视化图表 | vendor.js 检测到 `echarts`/`ECharts` |
| **OpenLayers** | — | 矢量/瓦片地图渲染 | vendor.js 中 `ol.` 出现 82 次 |
| **百度地图 JS API** | — | 默认地图引擎（可切换） | Store 中 `useMapType:"Baidu"` |
| **jQuery** | layui 内置 | DOM 操作 + Ajax | `layui.jquery` 引用 |
| **lodash** | — | 工具函数库 | vendor.js 检测到 |
| **CryptoJS** | AES | 登录密码加密 | `AES.encrypt("carhere")` 密钥硬编码 |
| **xlsx** | — | Excel 导入/导出 | HTML 引用 `xlsx.core.min.js` |
| **hls.js** | — | HLS 视频流播放 | HTML 引用 `hls.js` |

### 国际化

```text
cn | en | vi | fr | pt | en-IN | es | km | th | ru | my
```

### 后端技术（推测）

- 后端 API 全部返回 404（后端服务未运行）
- 从 app.js 提取的 API 涵盖：设备管理、指令下发、视频、支付、OTA 升级
- 后端技术栈无法判定（可能 Java / PHP / Node.js）

---

## 侧边栏菜单系统（12 个一级模块）

从 app.js 提取的侧边栏图标文件揭示完整菜单：

| # | 图标 | 菜单 | 对应路由/页面 |
|---|------|------|-------------|
| 1 | `sidebar-monitor.png` | **监控平台** | `/#/index/home`（默认首页） |
| 2 | `sidebar-alarm.png` | 告警中心 | 实时告警 + 历史告警 + 告警统计 |
| 3 | `sidebar-cmd.png` | 指令管理 | 单设备指令 + 批量指令下发 |
| 4 | `sidebar-data.png` | 数据统计 | 里程统计 + 停留分析 + 报表导出 |
| 5 | `sidebar-fence.png` | 电子围栏 | 围栏 CRUD + 进出告警 |
| 6 | `sidebar-track.png` | 轨迹回放 | 历史轨迹查询 + 动画播放 |
| 7 | `sidebar-video.png` | 视频监控 | 车载摄像头实时视频 + 录像回放 |
| 8 | `sidebar-search.png` | 综合搜索 | 多条件设备/终端搜索 |
| 9 | `sidebar-music.png` | 多媒体 | 音频/对讲/多媒体 |
| 10 | `sidebar-user.png` | 用户管理 | 账户 + 代理 + 权限配置 |
| 11 | `sidebar-set.png` | 系统设置 | 平台配置 + 地图 Key + OTA |
| 12 | `sidebar-pingtai.png` | 平台管理 | 设备导入/转移/续费/库存 |

---

## 路由结构（提取 94+ 条）

```
/#/index/home              → 监控平台（默认首页）
/#/index/device            → 设备管理
/#/index/agent             → 代理管理
/#/index/bus               → 公交/班车
/#/index/checkCar          → 车辆检测
/#/index/count             → 数据统计
/#/index/order             → 订单管理
/#/index/pay               → 支付管理
/#/index/system            → 系统设置
/#/login                   → 登录页
/#/loginByCert             → 证书登录
/#/test/*                  → 测试/调试工具（13 个子页面）
```

### 监控平台子路由

```
monitor / home           → 主监控页
  deviceList             → 设备列表
  alarms / alarmsAll     → 告警列表 / 全部告警
  fence                  → 电子围栏
  track                  → 轨迹回放
  videoLive              → 视频直播
  countMileage           → 里程统计
  countStayDetail        → 停留详情分析
  cmdSend / cmdTask      → 指令下发 / 指令任务
  point / area           → 地图点/区域
  subscribe              → 设备订阅
  deviceBatchManage      → 批量管理
  deviceImport           → 设备导入
  deviceRenew            → 设备续费
  mapKey / apiKey        → 地图 Key 管理
  otaList                → OTA 升级列表
  agps                   → AGPS 辅助定位
```

---

## 功能模块详解

### 1. 🖥️ 监控平台（核心首页 — `/#/index/home`）

用户登录后默认进入此页面，左侧菜单栏默认选中「监控平台」。

**地图引擎架构**：
- 默认使用 **百度地图 JS API**（`useMapType: "Baidu"`）
- 辅助 **OpenLayers** 矢量地图（vendor.js 82 处引用）
- 支持地图类型切换：`SET_USEMAPTYPE` mutation + `localStorage` 持久化

**核心组件与实现**：

| 组件 | 实现方式 |
|------|---------|
| 设备列表树 | zTree 树形控件，无限层级分组，点击过滤地图显示 |
| 实时地图 | 百度地图/OpenLayers，设备 Marker + 信息弹窗 |
| 设备状态 | `DEVICE_STATE_MAP` 映射：在线/离线/未激活/过期/未知 5 种状态 |
| 运动检测 | `I.getCarMovingState(location)` 根据速度判断运动/静止 |
| 数据刷新 | 实时更新 lat/lng/speed/direction，增量更新 Marker |
| 右键菜单 | `VContextmenu` Vue 组件，列表和地图上的右键操作 |
| 告警声音 | `alarmSound` 状态 + `setAlarmSound` action，告警时浏览器发声 |
| 指令下发 | 选中设备 → 发送远程指令（重启/模式切换/参数配置） |

**数据流**：
```
GPS 数据到达 → noProcessTerminalIDMap 过滤
            → deviceListMap[terminalID].update(data)  // 增量更新 Marker
            → setSpeed(location)                      // 更新速度显示
            → getCarMovingState()                      // 更新运动状态图标
            → 触发围栏检测 → 触发告警 → alarmSound
```

### 2. 🔐 用户登录认证

- **入口**：主页「我要体验」→ 登录页
- **方式**：用户名 + 密码，CryptoJS AES 加密（密钥 `"carhere"`）
- **多语言**：11 种语言切换
- **证书登录**：`/#/loginByCert` — 证书/硬件密钥登录

### 3. 📍 GPS 实时追踪

- **定位**：GPS + AGPS 辅助
- **分组**：zTree 无限层级树
- **数据**：经纬度、速度、方向、高度、精度
- **刷新**：定时 Ajax 轮询或 WebSocket 推送

### 4. 📱 设备管理

- **CRUD** + **批量操作** + **导入/导出**（Excel）
- **指令下发**：`cmdSend` / `multipleCmd` / `cmdTask`
- **设备转移/重置/续费/类型更新**
- **批量 ICCID 导出**：`deviceExportIccid`

### 5. 📊 数据可视化

- **ECharts** 图表引擎
- 统计：在线率、告警趋势、里程、停留分析、报表导出

### 6. 🔔 告警系统

- 类型：超速、围栏、SOS、断电、震动
- 页面：`alarms`（未处理）/ `alarmsAll`（全部）
- 通知：`alarmSound` 浏览器声音

### 7. 🔵 电子围栏

- 创建/编辑/删除 + 圆形/多边形区域
- `map-check-point` / `map-check-area` 地图交互选点

### 8. 🎥 视频监控

- hls.js 播放 HLS 视频流
- `videoLive` 实时画面 + `videoDelete` 录像管理

### 9. 💰 支付与账户

- 账户 CRUD：`/pay/account/*`
- 设备续费：`deviceRenew` / `renewPrice`

### 10. 🔄 OTA 远程升级

- `otaList` + `otaHttp` + `otaUpdateListForUser`
- AGPS 星历数据更新

### 11. 📄 数据导出

- xlsx 库：设备列表、告警、里程报表
- `serialResultManager` 序列号管理

### 12. 🔧 系统配置

- `configPlatformForUser` 平台配置
- `mapKey` / `apiKey` 地图 API Key
- `demoAccountSet` 演示环境

---

## Vuex Store 状态管理架构

```javascript
state: {
  deviceListMap: {},           // 设备 Marker 快速索引 {terminalID: Marker}
  noProcessTerminalIDMap: {},  // 不处理设备黑名单
  agentMap: {},                // 代理数据
  useMapType: "Baidu",         // 地图引擎（默认百度）
  alarmSound: false,           // 告警声音开关
  leftMenuState: true,         // 左侧菜单展开/收起
  indexMh: 0,                  // 菜单高亮索引
  deviceMenuType: 0,           // 设备菜单视图类型
}

// 主要 Mutations
SET_LEFTMENUSTATE       // 折叠/展开菜单
SET_INDEX_MH            // 切换菜单高亮
SET_DEVICEMENUTYPE      // 切换设备菜单
SET_AGENT_MAP           // 更新代理地图
SET_USEMAPTYPE          // 切换地图引擎
SET_ALARM_SOUND         // 开关告警声音
```

---

## 技术难点

### 1. 双地图引擎架构
- 百度地图 + OpenLayers 统一抽象层
- `deviceListMap.update()` 统一 Marker 接口，引擎切换对业务透明

### 2. 海量设备实时监控
- `deviceListMap` O(1) 索引 + 增量更新
- `noProcessTerminalIDMap` 黑名单过滤
- 华翔用户定制过滤逻辑

### 3. 离线指令队列
- 设备离线时指令暂存，上线后自动下发
- 超时转离线指令询问机制

### 4. 278 Chunk 懒加载
- 每个路由页面独立异步 chunk
- vendor 1.6MB 独立缓存

### 5. 车辆运动状态检测
- `getCarMovingState()` 速度阈值判断
- `isFixedDev()` 固定设备识别
- 5 种状态图标：过期/离线/运动/静止/未知

### 6. 前端安全
- AES 加密密码（密钥 `"carhere"`）
- IP 校验 API
- 页面级权限 `permissions: ["main:monitor"]`

---

## 关键依赖清单

| 类型 | 依赖 | 用途 |
|------|------|------|
| 地图 | 百度地图 JS API | 默认地图引擎 |
| 地图 | OpenLayers | 矢量地图备选 |
| 框架 | Vue 2.x + Vue Router + Vuex | 前端架构 |
| UI | layui | 表格/表单/弹窗/导航 |
| UI | zTree | 设备分组树 |
| 可视化 | ECharts | 统计图表 |
| 视频 | hls.js | HLS 视频流 |
| 加密 | CryptoJS (AES) | 密码加密 |
| 导出 | xlsx | Excel 操作 |
| 工具 | jQuery + lodash | DOM / 工具 |

---

## 部署架构

```
浏览器 (Vue SPA, Hash Router)
  │
  ▼
Nginx 1.10.2 (:80)
  ├── /              → index.html
  ├── /static/*      → Webpack 构建产物
  ├── /static/layui/ → layui 框架
  └── /api/*         → proxy_pass 后端 (404)
```

---

## 待确认项

- [ ] 后端技术栈（语言/框架/数据库）
- [ ] 实时通信方式（轮询/WebSocket/MQTT）
- [ ] 视频流后端方案（RTMP/HLS 推流）
- [ ] 指令下发协议（TCP/MQTT/HTTP 长轮询）
- [ ] 运动状态检测具体阈值

---

> **分析时间**：2026-05-19  
> **分析方法**：HTML 静态分析 + Webpack 产物反查 + API 路径提取 + 组件名称枚举 + 侧边栏图标推断
