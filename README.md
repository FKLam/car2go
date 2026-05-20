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

## 是否基于开源项目？

**结论：此平台并非基于某个完整的开源 GPS 追踪项目，而是使用以下独立开源库 + 商业 API 自研构建。**

对比市面上主流的开源 GPS 追踪平台：

| 开源项目 | 后端 | 前端 | 与 carhere 匹配度 |
|----------|------|------|-------------------|
| **Traccar** | Java | React (新版) / ExtJS (旧版) | ❌ 完全不同 |
| **OpenGTS** | Java | GWT (Google Web Toolkit) | ❌ 完全不同 |
| **ThingsBoard** | Java | Angular | ❌ 完全不同 |
| **GPS-Tracker** | PHP | Bootstrap + jQuery | ❌ 完全不同 |

**carhere 使用的核心开源库**（均非 GPS 平台专有，而是通用 UI/工具库）：

| 库 | 开源协议 | 在平台中的用途 |
|----|---------|--------------|
| **Vue.js 2.x** | MIT | 前端 MVVM 框架 |
| **Webpack 3.x** | MIT | 模块打包工具 |
| **layui** | MIT | 国产 UI 组件库（表格/表单/弹窗） |
| **zTree** | MIT | jQuery 树形控件（设备分组树） |
| **ECharts** | Apache 2.0 | 百度开源图表库（可视化） |
| **OpenLayers** | BSD 2-Clause | 开源地图引擎 |
| **CryptoJS** | MIT | AES 加密库 |
| **xlsx** | Apache 2.0 | SheetJS Excel 读写库 |
| **hls.js** | Apache 2.0 | HLS 视频流播放 |
| **lodash** | MIT | JavaScript 工具函数库 |
| **jQuery** | MIT | DOM 操作（layui 内置版） |

**商业/外部服务**：

| 服务 | 说明 |
|------|------|
| **百度地图 JS API** | 默认地图引擎（需 API Key，免费额度） |
| **Nginx** | 开源 Web 服务器（BSD-like） |

**判断依据**：
1. app.js 的 94+ 条路由、Vuex Store 状态、组件命名方式均为**高度定制**，不存在指向任何已知开源 GPS 平台的痕迹
2. 业务代码中包含「华祥」客户定制逻辑、代理体系、支付系统等**商业平台特有功能**
3. 平台名称「车在这儿」+ 公司品牌「新源润」指向**商业运营公司**
4. 10+ 种开源库均为通用前端/地图/图表库的组合，非 GPS 业务框架

**结论**：这是一个由「新源润」公司使用 Vue.js + layui + ECharts + OpenLayers/百度地图 等技术栈从零开发的**商业自研 GPS 车辆追踪 SaaS 平台**。

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

### 侧边栏第二块：代理列表 + 语言切换 + 网站标识

在左侧菜单栏底部/顶部区域，还包含以下非导航功能组件：

#### 代理列表（Agent List）

**组件**：
- `index-agent/index-agent.vue` — 代理管理主页
- `index-agent-list/index-agent-list.vue` — 代理列表
- `index-agent-list-export/index-agent-list-export.vue` — 代理列表导出

**Store 状态**：
```
agentList: []            // 代理列表数据
selectAgent              // 选中代理 action
selectAgentId            // 当前选中代理 ID（sessionStorage 持久化）
agentName                // 代理名称（用于显示）
```

**Mutations/Actions**：
- `SET_AGENT_LIST` — 设置代理列表
- `getAgentList` — 获取代理列表数据
- `selectAgent` — 切换当前代理
- `agentName: i.username` — 代理名显示为用户名

**路由**：
- `/#/index/agent` — 代理管理
- `/#/index/agent/agentList` — 代理列表页
- `/#/index/agent/indexAgentListExport` — 代理列表导出

#### 语言切换

**实现方式**：
```javascript
// 语言检测逻辑（从 app.js 提取）
// 默认语言：cn（中文）
// 检测顺序：URL 参数 > localStorage > 浏览器语言
t = navigator.systemLanguage ? navigator.systemLanguage : navigator.language
return e && o(e) ? e : o(t) ? t : o(t = t.substr(0,2)) ? t : "cn"
```

**11 种支持语言**：
```
cn      - 简体中文
en      - 英语
vi      - 越南语
fr      - 法语
pt      - 葡萄牙语
en-IN   - 英语（印度）
es      - 西班牙语
km      - 高棉语（柬埔寨）
th      - 泰语
ru      - 俄语
my      - 缅甸语
```

- 语言包使用 Vue 国际化插件（推测 vue-i18n）
- 切换语言后整个应用动态刷新，无需重新加载页面
- 使用 `t()` 函数包裹所有界面文本（如 `t("体验账号无法使用此功能!")`）

#### 网站 Logo 与名称

**网站标识**：
| 元素 | 内容 | 证据 |
|------|------|------|
| 页面标题 | **车在这儿** | `<title>车在这儿</title>` |
| 关键词 | 车在这儿, 新源润, GPS定位器, 车载定位终端 | `<meta name=keywords>` |
| Logo/Favicon | ico_ch.ico | `/static/img/autoimage/ico_ch.ico` |
| 应用名称 | `appName` | app.js 中 2 处引用 |
| 公司品牌 | **新源润** | meta keywords |

**侧边栏 Logo 区域**：
- 侧边栏顶部展示网站 Logo 和名称「车在这儿」
- 侧边栏收起时仅显示图标

**侧边栏控制**：
```javascript
// 侧边栏展开/收起 State
state: {
  sidebar: {
    opened: !localStorage.getItem("sidebarStatus"),  // localStorage 持久化
    withoutAnimation: false,                          // 动画开关
    hide: false                                       // 是否隐藏
  }
}

// Mutations
TOGGLE_SIDEBAR   // 切换展开/收起（localStorage.setItem 持久化）
CLOSE_SIDEBAR    // 关闭侧边栏
SET_SIDEBAR_HIDE // 隐藏侧边栏
SET_LEFTMENUSTATE // 菜单项展开/折叠（leftMenuState: true/false）
```

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

用户登录后默认进入此页面，左侧菜单栏默认选中「监控平台」图标。页面采用 **左右两栏布局**。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row)
├── 左侧: GlobalSidebar (110px, dark)
│   ├── 主功能菜单组 (top aligned, 8项)
│   │   ├── 监控平台 (active)    ├── 我的设备
│   │   ├── 数据统计             ├── 电子围栏
│   │   ├── 远程指令             ├── 视频直播
│   │   ├── 报警列表             └── 历史轨迹
│   └── 底部系统工具组 (bottom aligned, 3项)
│       ├── 客户列表             ├── 切换语言
│       └── 车在这儿Logo
│
└── 右侧: MainContent (flex:1)
    ├── TopNavbar (60px)
    │   ├── Breadcrumb           # 面包屑导航
    │   ├── SearchBar            # 全局设备搜索
    │   ├── QuickStats           # 客户/服务商/报警快捷统计
    │   └── UserActions          # 用户中心与版本切换
    │
    └── WorkspaceContainer (地图画布, relative)
        ├── MapEngineProvider         # 百度地图 API (zoom:14)
        │   └── MapMarker             # 当前选中车辆标记 (car-blue, stopped)
        │
        ├── FloatingPanel (左侧, 320px) # 客户/设备联动检索面板
        │   ├── AgentSearchSection
        │   │   ├── SearchBar         # 代理商搜索框
        │   │   └── TreeSelect        # 客户组织架构树
        │   ├── Divider
        │   └── DeviceStatusSection
        │       ├── SearchBar         # 精细搜索框
        │       ├── Tabs              # 全部/在线/离线/未激活
        │       └── ListView          # 设备状态列表
        │
        ├── FloatingPanel (地图工具栏)
        │   └── Checkbox              # 公交路线叠加控制
        │
        ├── FloatingPanel (右上角工具箱)
        │   ├── RefreshIndicator      # 自动刷新倒计时
        │   ├── Checkbox              # 显示设备名称开关
        │   └── Select                # 地图源切换 (百度/高德/谷歌)
        │
        ├── FloatingToolbar (右侧测距条)
        │   └── Button                # 测距工具 (icon:ruler)
        │
        ├── InfoWindowOverlay (车辆详情气泡弹窗)
        │   ├── ButtonGroup           # 快捷操作指令组
        │   │   ├── [指令] (primary)  ├── [轨迹] (info)
        │   │   └── [设备信息] (success)
        │   ├── DescriptionList       # 设备元数据 (单列9字段)
        │   │   ├── IMEI/设备号       ├── 车牌号
        │   │   ├── 设备类型          ├── 状态
        │   │   ├── 电压              ├── 定位类型
        │   │   ├── 速度/航向         ├── 通讯时间
        │   │   └── 定位时间
        │   └── Button                # 跳转地图大图 (primary, block)
        │
        └── FloatingWidget (右下角)
            └── StatusBadge           # 静止/运动简报 (warning)
```

#### 左侧导航栏详析

**主功能菜单组** (8 项，按顺序排列)：
| # | 菜单名称 | 对应图标 | 路由 |
|---|---------|---------|------|
| 1 | 监控平台 | `icon:"monitor"` | `/#/index/home` (当前激活) |
| 2 | 我的设备 | `icon:"device"` | `/#/index/device` |
| 3 | 数据统计 | `icon:"chart"` | `/#/index/count` |
| 4 | 电子围栏 | `icon:"fence"` | `/#/index/fence` |
| 5 | 远程指令 | `icon:"command"` | `/#/index/directive` |
| 6 | 视频直播 | `icon:"video"` | `/#/index/videoLive` |
| 7 | 报警列表 | `icon:"alarm"` | `/#/index/alarms` |
| 8 | 历史轨迹 | `icon:"history"` | `/#/index/track` |

**底部系统工具组** (3 项，底部对齐)：
| # | 菜单名称 | 对应图标 | 功能 |
|---|---------|---------|------|
| 1 | 客户列表 | `icon:"users"` | 打开代理/客户管理面板 |
| 2 | 切换语言 | `icon:"global"` | 11 种语言选择 |
| 3 | 车在这儿Logo | `icon:"logo"` | 品牌标识「车在这儿」|

> **注意**：实际部署版本中，侧边栏宽度 110px（窄版图标栏）。与代码中提取的 `sidebar` state（展开/收起）和 `leftMenuState` 一致。子菜单（如「我的设备」→ 设备管理/客户资料）通过 `deviceMenuType` 等状态在右侧工作区切换，而非在左侧展开。

#### 顶部状态栏 (TopNavbar, 60px)

| 组件 | 说明 |
|------|------|
| Breadcrumb | 面包屑导航路径 |
| SearchBar | 全局设备搜索（按 IMEI/车牌/终端ID） |
| QuickStats | 快捷统计：客户数量 / 服务商数量 / 新报警数 |
| UserActions | 用户头像/名称、版本切换、退出登录 |

#### 左侧检索面板 (FloatingPanel, 320px)

这是监控平台最核心的交互区域，位于地图画布左侧，分为上下两部分：

**上半部 — 代理商/客户搜索树**：
- `SearchBar` — 按代理商名称关键字搜索
- `TreeSelect` — 层级树形结构展示所有客户组织（代理 → 子代理 → 终端用户）

**下半部 — 设备状态检索列表**（Divider 分割）：
- `SearchBar` — 精细搜索（按 IMEI、设备名、车牌等）
- `Tabs` — 4 个状态分类页签：
  - **全部** — 所有设备
  - **在线** — `DEVICE_STATE_MAP.zx`
  - **离线** — `DEVICE_STATE_MAP.lx`
  - **未激活** — `DEVICE_STATE_MAP.wjh`
- `ListView` — 设备列表，每条显示设备名/状态/速度等摘要信息

#### 地图画布 (WorkspaceContainer)

**地图引擎**：
- 默认 **百度地图 API**（zoom:14），注册为 `MapEngineProvider`
- 右上角 `Select` 切换地图源：(百度 / 高德 / 谷歌) — 对应 `useMapType` State
- 辅助 **OpenLayers** 矢量地图（vendor.js 82 处引用）

**车辆标记**：
- 当前选中设备以 `car-blue` 图标标注
- 状态 `stopped` / `moving` 动态切换图标样式

**地图右上角工具箱**：
| 组件 | 功能 |
|------|------|
| RefreshIndicator | 自动刷新倒计时（如"3秒后刷新"） |
| Checkbox | 显示/隐藏设备名称标注 |
| Select | 地图源切换下拉框（百度/高德/谷歌） |

**地图右侧测距工具**：
- `Button (icon:"ruler")` — 激活测距模式，在地图上点击两点计算距离

**公交路线叠加**：
- `Checkbox` — 在地图上叠加公交线路图层（对应 `/#/index/bus` 模块）

#### 车辆详情气泡弹窗 (InfoWindowOverlay)

点击地图上任意设备 Marker 弹出，包含三部分：

**1. 快捷操作组 (ButtonGroup)**：
| 按钮 | 样式 | 功能 |
|------|------|------|
| 指令 | `primary` | 跳转远程指令下发页 `/#/index/directive/cmdSend` |
| 轨迹 | `info` | 跳转历史轨迹回放 `/#/index/track` |
| 设备信息 | `success` | 打开设备详情面板 |

**2. 设备元数据 (DescriptionList, 9 字段)**：
| 字段 | 数据来源 | 说明 |
|------|---------|------|
| IMEI/设备号 | `device.imei` | 国际移动设备识别码 |
| 车牌号 | `device.plate_number` | 车辆牌照 |
| 设备类型 | `device.model` | GPS 终端型号 (如 GT06N) |
| 状态 | `DEVICE_STATE_MAP` | 在线/离线/未激活 |
| 电压 | `device.battery_level` | 电池电压 (V) |
| 定位类型 | GPS 数据 | GPS/LBS/WiFi 定位 |
| 速度/航向 | `device.last_speed` / `device.last_direction` | km/h + 方向角 |
| 通讯时间 | `device.last_online_time` | 最后一次与服务器通信 |
| 定位时间 | `gps_records.gps_time` | GPS 定位时间戳 |

**3. 地图大图按钮**：
- 跳转全屏地图模式（不显示左侧检索面板）

#### 右下角状态小部件

`StatusBadge` — 显示当前车辆运动状态简报：
- **静止** — 速度 < 10km/h 且持续 < 1min 或静止 > 1min → `EnumCarState.STOP`
- **运动** — 速度 10-60km/h → `EnumCarState.MOVING`
- **快速** — 速度 60-120km/h → `EnumCarState.FAST`
- **超速** — 速度 > 120km/h → `EnumCarState.OVERSPEED`

#### 地图引擎架构

- 默认使用 **百度地图 JS API**（`useMapType: "Baidu"`）
- 辅助 **OpenLayers** 矢量地图（vendor.js 82 处引用）
- 右上角 `Select` 支持切换地图源：百度 / 高德 / 谷歌
- `SET_USEMAPTYPE` mutation + `localStorage` 持久化用户选择

#### 数据更新流程

```
GPS 数据到达 → noProcessTerminalIDMap 过滤
            → deviceListMap[terminalID].update(data)  // 增量更新 Marker
            → setSpeed(location)                      // 更新速度显示
            → getCarMovingState()                      // 更新运动状态图标
            → 更新 InfoWindow 设备元数据字段
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

### 4. 📱 我的设备（设备管理 — `/#/index/device/*`）

左侧菜单「我的设备」下包含设备管理和客户资料两大入口，以及十余个批量操作工具子页面。

**菜单入口**：
- 点击「我的设备」展开子菜单
- `deviceMenuType` State 控制当前选中的子页面视图（0=设备列表, 1=客户资料, 2=批量修改设备信息...）

#### 4.1 设备管理 `/#/index/device/deviceList`

**组件**：`device-device/device-device-v2.vue`

设备管理的核心页面，左侧菜单「我的设备」高亮激活。页面采用 **三级布局**：
一级侧边栏 (110px) → 二级侧边栏 (180px) → 内容工作区。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row)
├── 左侧: GlobalSidebar (110px, dark)
│   ├── 监控平台              └── 我的设备 (active)
│   └── 底部: 客户列表 + 切换语言
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px, sub-dark)  ← 设备管理二级侧边栏
    │   └── 设备管理子功能列表 (11项)
    │       ├── 设备管理 (active)         ├── 客户资料
    │       ├── 批量修改设备信息          ├── 批量修改设备图标
    │       ├── 设备批量转移              ├── 批量修改查询时间
    │       ├── 导入卡号                  ├── 卡号匹配
    │       ├── 更新设备到期时间          ├── 华特管理平台数据导入
    │       └── 批量修改主机名
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   ├── Breadcrumb     # 面包屑: 我的设备 / 设备管理
        │   ├── SearchBar      # 设备快速搜索
        │   ├── QuickStats     # 基础信息快捷统计
        │   └── UserActions    # 用户中心
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)  # 客户与设备联动检索树
            │   ├── AgentSearchSection
            │   │   ├── SearchBar        # 代理商搜索框
            │   │   └── TreeSelect       # 客户级联树
            │   ├── Divider
            │   └── DeviceStatusSection
            │       ├── SearchBar        # 设备号搜索框
            │       ├── Tabs             # 全部/在线/离线/未激活
            │       └── ListView         # 设备状态快捷列表
            │
            └── CardPanel (右侧, flex:1)  # 主数据表格面板
                ├── FilterBar             # 过滤器工具栏
                │   ├── Input             # IMEI/设备名称/车牌号
                │   ├── Select            # 设备状态下拉框
                │   ├── Select            # 设备类型下拉框
                │   └── Button            # [查询] (primary)
                │
                ├── ActionBar             # 批量操作按钮组
                │   ├── Button [设备批量转移] (primary, icon:transfer)
                │   ├── Button [导出表格]   (outlined, icon:export)
                │   └── Button [导出更多]   (outlined, icon:more)
                │
                ├── DataTable (checkbox选择, 8列)
                │   ├── 复选框列 (50px)
                │   ├── IMEI号            # prop: imei
                │   ├── 设备名称           # prop: deviceName
                │   ├── 设备卡号(SIM卡号)  # prop: simCard
                │   ├── 车牌号             # prop: plateNumber
                │   ├── 设备类型           # prop: deviceType
                │   ├── 用户到期           # prop: expireDate
                │   └── 操作列 (align:center)
                │       ├── Button [修改] (small)
                │       └── DropdownButton [更多操作] (small)
                │
                └── Pagination (右对齐)
                    ├── showSizeChanger: true
                    ├── showJumper: true
                    └── pageSizeOptions: [15, 30, 50]
```

#### 三级侧边栏体系

与监控平台不同，设备管理页面引入了 **二级侧边栏 (SubSidebar)**，形成三层导航：

```
一级 (GlobalSidebar, 110px)    二级 (SubSidebar, 180px)       三级 (ContentWorkspace)
─────────────────────────    ─────────────────────────    ─────────────────────────
 监控平台                       设备管理 (active) →          设备列表 + 表格
 我的设备 (active) →           客户资料                      客户资料表单
 数据统计                       批量修改设备信息               批量编辑表单
 电子围栏                       批量修改设备图标               图标选择器
 远程指令                       设备批量转移                   转移目标选择
 视频直播                       批量修改查询时间               时间参数设置
 报警列表                       导入卡号                      文件上传
 历史轨迹                       卡号匹配                      匹配结果表
                               更新设备到期时间               日期选择器
                               华特平台数据导入               导入工具
                               批量修改主机名                 主机名编辑
```

**二级侧边栏菜单项** (11 项)：
| # | 菜单名称 | 路由 fragment | 焦点状态 |
|---|---------|-------------|---------|
| 1 | 设备管理 | `deviceList` | `active: true` |
| 2 | 客户资料 | `userInfo` | |
| 3 | 批量修改设备信息 | `deviceUpdateDeviceInfo` | |
| 4 | 批量修改设备图标 | `deviceBatchIcon` | |
| 5 | 设备批量转移 | `deviceTransform` | |
| 6 | 批量修改查询时间 | `deviceUpdateTime` | |
| 7 | 导入卡号 | `deviceUpdateIccid` | |
| 8 | 卡号匹配 | `deviceExportIccid` | |
| 9 | 更新设备到期时间 | `deviceUpdateExpireType` | |
| 10 | 华特管理平台数据导入 | `huaXiangDataImport` | |
| 11 | 批量修改主机名 | `deviceUpdateHost` | |

#### 左侧检索面板 (CardPanel, 300px)

与监控平台相同的结构：
- **上半部** — 代理商搜索框 + 客户级联树 (TreeSelect)
- **下半部** — 设备号搜索框 + 状态 Tabs (全部/在线/离线/未激活) + 设备快捷列表

#### 主数据表格 (DataTable)

**过滤器 (FilterBar)**：
- `Input` — IMEI / 设备名称 / 车牌号 三合一搜索输入框
- `Select` — 设备状态下拉框（全部/在线/离线/未激活）
- `Select` — 设备类型下拉框（GT06N / GT06 / 其他）
- `Button` — 查询动作按钮 (primary)

**批量操作栏 (ActionBar)**：
| 按钮 | 样式 | 图标 | 功能 |
|------|------|------|------|
| 设备批量转移 | `primary` | `transfer` | 选中多设备后批量转移分组 |
| 导出表格 | `outlined` | `export` | 导出当前筛选结果到 Excel |
| 导出更多 | `outlined` | `more` | 导出扩展数据（含 ICCID 等） |

**表格列 (8 列)**：

| 列名 | prop | 宽度 | 说明 |
|------|------|------|------|
| 复选框 | `selection` | 50px | 批量选择设备 |
| IMEI号 | `imei` | auto | 国际移动设备识别码 |
| 设备名称 | `deviceName` | auto | 自定义设备名 |
| 设备卡号 | `simCard` | auto | SIM 卡 ICCID 号 |
| 车牌号 | `plateNumber` | auto | 车辆牌照号 |
| 设备类型 | `deviceType` | auto | GPS 终端型号 |
| 用户到期 | `expireDate` | auto | 服务到期日期 |
| 操作 | `actions` | center | 修改 + 更多操作下拉菜单 |

**操作列**：
- `Button [修改] (small)` — 弹出编辑设备信息弹窗
- `DropdownButton [更多操作] (small)` — 更多操作菜单：
  - 发送指令 / 删除设备 / 续费 / 重置设备 / 查看详情

**分页器 (Pagination)**：
- 位置：表格底部右对齐
- 每页条数：15 / 30 / 50（可选择）
- 支持跳转到指定页码（showJumper）
- 显示总条数

#### Store 状态

```
deviceList: []              // 设备列表（Array<Device>）
deviceListDataInfo: null     // 设备列表元数据
originDeviceListLen: 0       // 原始列表长度
isUpdateDeviceList: false    // 是否正在更新
loadingDeviceList: false     // 加载状态
deviceMenuType: 0            // 当前菜单视图类型 (0=设备列表)
```

#### 数据流

```
getDeviceList action
  → 拉取后端设备数据
  → 过滤华祥未处理设备 (isHuaXiangUsers && isAgent)
  → noProcessTerminalIDMap 黑名单过滤
  → deviceListMap[terminalID] 同步更新地图 Marker
  → deviceList.unshift(newDevice) 新设备加入列表头部
  → DataTable 重渲染
```

#### 设备状态驱动

- `DEVICE_STATE_MAP.zx` → 在线（绿色标记）
- `DEVICE_STATE_MAP.lx` → 离线（灰色标记）
- `DEVICE_STATE_MAP.wjh` → 未激活（无色标记）
- `EnumCarState.EXPIRE` → 已过期（红色标记，用户到期列红色高亮）
- `EnumCarState.UNKNOWN` → 未知（默认状态）

#### 设备图标

- `device.iconType` 字段控制设备在地图上的图标类型
- `setMarkerIcon(this.device.iconType)` 根据类型渲染不同图标
- `getCarStateIconOptions()` 获取可用图标选项列表
- `isFixedDev()` 判断是否为固定点位设备

#### 4.2 客户资料 `/#/index/device/userInfo`

**组件**：`device-userinfo/device-userinfo.vue`

管理设备关联的客户/用户信息。二级侧边栏「客户资料」高亮激活，与设备管理共用左侧检索面板。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row)
├── 左侧: GlobalSidebar (110px, dark)
│   ├── 监控平台              └── 我的设备 (active)
│   └── 底部: 客户列表 + 切换语言
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px, sub-dark)
    │   └── 设备管理子功能列表
    │       ├── 设备管理              ├── 客户资料 (active)
    │       ├── 批量修改设备信息      └── ... (其余8项)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   ├── Breadcrumb     # 面包屑: 我的设备 / 客户资料
        │   ├── SearchBar      # 全局设备搜索
        │   ├── QuickStats     # 业务快捷统计
        │   └── UserActions    # 用户中心
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)  # 客户与设备联动检索树
            │   ├── AgentSearchSection
            │   │   ├── SearchBar        # 代理商搜索
            │   │   └── TreeSelect       # 客户级联树
            │   ├── Divider
            │   └── DeviceStatusSection
            │       ├── SearchBar        # 设备号搜索
            │       ├── Tabs             # 状态切页 (全部/在线/离线/未激活)
            │       └── ListView         # 设备状态列表
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 主表单容器
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:600px)
                    ├── FormItem [用户名] (required)
                    │   └── Input (disabled:false)
                    ├── FormItem [用户昵称]
                    │   └── Input
                    ├── FormItem [联系地址]
                    │   └── TextArea (rows:4)
                    ├── FormItem [联系电话]
                    │   └── Input (type:"tel")
                    ├── FormItem [车牌号]
                    │   └── Input
                    ├── FormItem [备注]
                    │   └── Input
                    └── FormItem [表单操作域]
                        └── Button [修改提交] (primary)
```

#### 表单字段详析 (7 个字段)

| # | 字段标签 | 组件类型 | 必填 | 说明 |
|---|---------|---------|------|------|
| 1 | 用户名 | `Input` | ✅ required | 登录用户名，可编辑 |
| 2 | 用户昵称 | `Input` | | 显示名称 |
| 3 | 联系地址 | `TextArea` (4行) | | 客户详细地址 |
| 4 | 联系电话 | `Input (type:tel)` | | 电话号码，调起数字键盘 |
| 5 | 车牌号 | `Input` | | 绑定到用户的主要车牌 |
| 6 | 备注 | `Input` | | 备注信息 |
| 7 | — | `Button [修改提交]` | | 主操作按钮 (primary) |

**表单样式**：`labelWidth:100px` / `labelAlign:right` / `maxWidth:600px`

#### 左侧检索面板

与设备管理页面相同的 **300px 单例复用组件**：
- 上半部：代理商搜索 + 客户级联树 — 选择客户后右侧表单加载对应数据
- 下半部：设备号搜索 + 状态 Tabs + 设备快捷列表

#### Store 状态

```
userInfo: null              // 客户资料对象
selectUser: null            // 当前选中用户
```

#### Store Mutations/Actions

- `SET_USERINFO` — 设置用户信息（初始化）
- `UPDATE_USERINFO` — 更新用户信息（修改提交后）
- `setUserInfo` / `updateUserInfo` / `clearUserInfo` actions
- 用户信息持久化到 `sessionStorage`

#### 4.3 批量修改设备信息 `/#/index/device/deviceUpdateDeviceInfo`

**组件**：`device-update-device-info/device-update-device-info.vue`

通过 Excel 模板批量导入的方式更新设备属性信息，二级侧边栏「批量修改设备信息」高亮激活。另有华祥定制版：`device-update-device-info-custom-for-huaxiang`。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 与设备管理相同的三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 批量修改设备信息 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 批量修改设备信息
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 批量导入主面板
                ├── HeaderActionBar                  # 前置指引与下载区
                │   ├── AlertInfo [模板使用提示]       (type:info, showIcon)
                │   └── Button [下载模板文件]          (primary, icon:download)
                │
                ├── MetaInfoBar                      # 操作限制说明
                │   └── AlertInfo [单次上限5000台]    (type:warning, plain)
                │
                └── UploadDragger                    # 拖拽解析上传核心域
                    ├── accept: .xlsx, .xls
                    ├── multiple: false
                    ├── drag: true
                    ├── height: 240px
                    ├── Icon [cloud-upload] (large)
                    └── Text [上传Excel文件]  (variant:h3)
```

#### 操作流程

```
① 点击「下载模板文件」→ 下载预置 Excel 模板
② 按模板格式填写设备信息（名称 / 分组 / 驾驶员 / 联系电话等）
③ 拖拽（或点击）上传填好的 Excel 文件到 UploadDragger
④ 系统解析并校验数据 → 单次上限 5000 台设备
⑤ 校验通过后批量写入数据库
```

#### 关键参数

| 参数 | 值 | 说明 |
|------|----|------|
| 文件格式 | `.xlsx` / `.xls` | 仅限 Excel |
| 上传方式 | 拖拽 / 点击 | `drag: true` |
| 单次上限 | **5000 台** | 超过上限需分批导入 |
| 多文件 | false | 每次仅一个文件 |
| 模板提供 | ✅ | 下载预置模板文件 |

#### 华祥定制版

`device-update-device-info-custom-for-huaxiang` — 针对「华祥」客户的字段映射和校验逻辑定制版本（对应 `isHuaXiangUsers` 标志）。

#### 4.4 批量修改设备图标 `/#/index/device/deviceBatchIcon`

**组件**：`device-batch-icon/device-batch-icon.vue`

批量修改设备在地图上的标识图标。二级侧边栏「批量修改设备图标」高亮激活。`icon` 关键词在 vendor.js 中出现 323 次。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 批量修改设备图标 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 批量修改设备图标
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 批量配置表单
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [标识图标] (required)
                    │   └── GridSelectGroup (column:5, gap:20px, value:"car")
                    │       ├── SelectItem [轿车]    (car,       car-icon)
                    │       ├── SelectItem [摩托车]  (motorcycle, motor-icon)
                    │       ├── SelectItem [客车]    (bus,       bus-icon)
                    │       ├── SelectItem [卡车]    (truck,     truck-icon)
                    │       ├── SelectItem [警车]    (police,    police-icon)
                    │       ├── SelectItem [轮船]    (ship,      ship-icon)
                    │       ├── SelectItem [人员]    (person,    person-icon)
                    │       └── SelectItem [宠物]    (pet,       pet-icon)
                    │
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6, resize:vertical)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    └── FormItem [操作按钮组]
                        ├── Button [提交] (primary)
                        └── Button [重置] (outlined)
```

#### 8 种设备图标类型

| 图标 | value | 适用场景 |
|------|-------|---------|
| 🚗 轿车 | `car` | 默认图标，普通乘用车 |
| 🏍️ 摩托车 | `motorcycle` | 摩托车/电动车 |
| 🚌 客车 | `bus` | 大巴/中巴/公交车 |
| 🚛 卡车 | `truck` | 货运卡车/物流车辆 |
| 🚓 警车 | `police` | 执法车辆 |
| 🚢 轮船 | `ship` | 船舶/水上设备 |
| 🧑 人员 | `person` | 人员定位器/可穿戴设备 |
| 🐾 宠物 | `pet` | 宠物追踪器 |

**默认值**：`car`（轿车）

#### 交互方式

- **图标选择**：5 列网格卡片单选（`GridSelectGroup`），卡片式可视化选择
- **IMEI 输入**：大文本域 (6 行)，支持换行输入多个 IMEI 号
- **操作**：[提交] 批量应用图标 / [重置] 清空选择

#### 表单样式
`maxWidth:800px`（比客户资料 600px 更宽，容纳 5 列图标网格）

#### 4.5 设备批量转移 `/#/index/device/deviceTransform`

**组件**：`device-transform/device-transform`

将设备从一个代理商/账户批量转移到另一个。二级侧边栏「设备批量转移」高亮激活。目标代理商通过左侧检索面板选定。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 设备批量转移 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 设备批量转移
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │                               # ← 在此选择目标代理商
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 转移表单
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [代理商：]
                    │   └── Text [目标代理商名称] (body1, strong)  # 只读展示
                    │
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6, resize:vertical)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    └── FormItem [操作按钮组]
                        ├── Button [提交] (primary)
                        └── Button [重置] (outlined)
```

#### 操作流程

```
① 在左侧检索面板 TreeSelect 中选择目标代理商
② 目标代理商名称实时显示在右侧表单顶部
③ 在 TextArea 中换行输入要转移的设备 IMEI 号
④ 点击 [提交] → 批量将设备归属转移到目标代理商
⑤ [重置] 清空 IMEI 输入
```

#### 关键参数

| 参数 | 说明 |
|------|------|
| 目标代理商 | 左侧 TreeSelect 选中 → 右侧 Text 只读展示 |
| IMEI 输入 | TextArea，换行分隔，最多 6 行可见 |
| 提交动作 | 批量转移设备归属关系 |
| 重置动作 | 清空 IMEI 输入框

#### 4.6 批量修改设备时间 `/#/index/device/deviceUpdateTime`

**组件**：
- `device-update-time/device-update-time.vue` — 修改时间
- `device-update-all-time/device-update-all-time.vue` — 修改全部时间

批量调整设备的用户到期时间。二级侧边栏「批量修改设备时间」高亮激活。另有「修改全部时间」变体组件。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 批量修改设备时间 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 批量修改设备时间
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 时间修改表单
                ├── AlertBar (type:info, plain, marginBottom:30px)
                │   └── Text [策略影响说明文本]
                │
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [时间类型：]
                    │   └── Input (value:"用户到期", disabled)  # 只读
                    │
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6, resize:vertical)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    ├── FormItem [到期时间：]
                    │   └── Select (value:"half-year")
                    │       ├── Option [半年]    (half-year)
                    │       └── Option [一年]    (one-year)
                    │
                    └── FormItem [操作按钮]
                        └── Button [提交] (primary)
```

#### 表单字段

| 字段 | 组件 | 值/选项 | 说明 |
|------|------|--------|------|
| 时间类型 | `Input (disabled)` | "用户到期" | 固定不可修改 |
| IMEI号 | `TextArea` (6行) | 换行输入 | 必填 |
| 到期时间 | `Select` | 半年 / 一年 | 默认半年 |
| 提交 | `Button (primary)` | — | 批量生效 |

#### 策略警示

表单顶部 AlertBar (type:info) 展示业务策略影响说明，提醒用户此操作会批量变更设备服务到期时间。

#### 变体组件

`device-update-all-time/device-update-all-time.vue` — 修改全部时间参数（时区、上报间隔等），字段更丰富。

#### 4.7 导入卡号 `/#/index/device/deviceUpdateIccid`

**组件**：`device-update-iccid/device-update-iccid`

批量导入 SIM 卡的 ICCID 号，用于设备 SIM 卡绑定。页面融合了「上传导入」与「表格查询」两种交互模式。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 导入卡号 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 导入卡号
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)  # 复合数据操作面板
                ├── HeaderActionBar
                │   ├── AlertInfo [卡号引导提示]        (type:info, plain)
                │   └── Button [下载模板文件]            (primary, icon:download)
                │
                ├── UploadDragger (180px, .xlsx/.xls)
                │   ├── Icon [cloud-upload]
                │   └── Text [拖拽上传文案]
                │
                ├── FilterInlineBar                    # 内联检索条
                │   ├── Text [检索前缀:] (label)
                │   ├── Input [请输入Iccid] (width:200px)
                │   └── Button [查询] (primary)
                │
                └── DataTable (flex:1)                 # 导入结果明细表
                    ├── TableColumn [设备卡号(SIM卡号)] (prop:simCard)
                    ├── TableColumn [iccid]             (prop:iccid)
                    └── EmptyState
                        ├── Icon [document-empty]
                        └── Text [没有查询到相关数据]
```

#### 操作流程

```
① 点击「下载模板文件」→ 下载 ICCID 导入 Excel 模板
② 按模板填写设备卡号与 ICCID 对应关系
③ 拖拽/点击上传 Excel 到 UploadDragger
④ 系统解析并写入数据库
⑤ 上传后在下方 DataTable 中查看导入结果
⑥ 使用 FilterInlineBar 按 ICCID 检索已导入数据
```

#### 组件参数

| 组件 | 参数 | 说明 |
|------|------|------|
| UploadDragger | `height:180px` | 比批量导入设备信息 (240px) 更紧凑 |
| UploadDragger | `accept:.xlsx/.xls` | Excel 文件 |
| FilterInlineBar | `Input width:200px` | ICCID 搜索框 |
| DataTable | 2 列 | simCard + iccid |
| EmptyState | `document-empty` | 无数据空状态图标 |

#### 数据列

| 列名 | prop | 说明 |
|------|------|------|
| 设备卡号(SIM卡号) | `simCard` | SIM 卡标识 |
| iccid | `iccid` | 集成电路卡识别码（20 位） |

#### 4.8 卡号匹配 `/#/index/device/deviceExportIccid`

**组件**：`device-export-iccid/device-export-iccid`

根据 IMEI 查询匹配的 SIM 卡 ICCID 号并导出结果。页面极度精简，仅 1 个输入域 + 2 个按钮。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 卡号匹配 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 卡号匹配
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6, resize:vertical)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    └── FormItem [操作按钮]
                        ├── Button [提交] (primary)
                        └── Button [重置] (outlined)
```

#### 操作流程

```
① 在 TextArea 中换行输入设备 IMEI 号
② 点击 [提交] → 后端查询 ICCID 匹配结果
③ 返回结果 → 弹出下载或直接导出 Excel
④ [重置] 清空输入
```

#### 与导入卡号页面的关系

| 页面 | 方向 | 输入 | 输出 |
|------|------|------|------|
| 导入卡号 | IMEI → ICCID 写入 | Excel 文件 | 表格展示 |
| 卡号匹配 | IMEI → ICCID 查询 | 文本 IMEI | 导出文件 |

#### 4.9 刷新设备到期时间 `/#/index/device/deviceUpdateExpireType`

**组件**：`device-update-expire-type/device-update-expire-type`

根据设备激活时间重新校准到期日期。设备过期后图标变为 `EnumCarState.EXPIRE`。与"批量修改设备时间"的区别：前者直接设置到期时间，本功能按激活时间 + 使用期限重新计算。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 刷新设备到期时间 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 刷新设备到期时间
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)
                ├── AlertBar (type:info, plain, marginBottom:30px)
                │   └── Text [该功能会使系统根据设备的激活时间来重新校准...]
                │
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6, resize:vertical)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    ├── FormItem [使用期限：]
                    │   └── Select (value:"half-year", width:"100%")
                    │       ├── Option [半年]    (half-year)
                    │       └── Option [一年]    (one-year)
                    │
                    └── FormItem [操作按钮]
                        └── Button [提交] (primary)
```

#### 与「批量修改设备时间」的区别

| 维度 | 批量修改设备时间 | 刷新设备到期时间 |
|------|---------------|--------------|
| 标签 | 到期时间 | 使用期限 |
| 逻辑 | 直接设置到期日期 | 激活时间 + 期限 → 重新计算 |
| 提示 | 策略影响说明 | 系统根据激活时间校准 |
| 按钮 | 提交 + 重置 | 仅提交 |

#### 关键参数

| 字段 | 组件 | 值/选项 | 说明 |
|------|------|--------|------|
| IMEI号 | `TextArea` (6行) | 换行输入 | 必填 |
| 使用期限 | `Select (width:100%)` | 半年 / 一年 | 默认半年 |
| 提交 | `Button (primary)` | — | 重新计算并生效 |

#### 4.10 华祥管理平台数据导入 `/#/index/device/huaXiangDataImport`

**组件**：`huaXiangDataImport`（独立页面组件）

专门为「华祥」客户定制的数据导入工具。权限 `main:devices_huaxiang_import`，华祥客户通过 `isHuaXiangUsers` 标志启用特殊处理。与批量修改设备信息页面结构相似，但限制为 500 台 vs 5000 台。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 华祥管理平台数据导入 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 华祥管理平台数据导入
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)
                ├── HeaderActionBar
                │   ├── AlertInfo [为了保证上传无误，请使用提供的模板] (type:info, plain)
                │   └── Button [下载模板文件] (primary, icon:download)
                │
                ├── NotificationText [最多只能操作500台设备] (type:secondary)
                │
                └── UploadDragger (240px, .xlsx/.xls)
                    ├── Icon [cloud-upload] (large)
                    └── Text [上传Excel文件文案] (variant:h3)
```

#### 与「批量修改设备信息」的对比

| 维度 | 批量修改设备信息 | 华祥管理平台数据导入 |
|------|---------------|-----------------|
| 目标用户 | 所有客户 | 仅华祥客户 |
| 权限 | 无特殊限制 | `main:devices_huaxiang_import` |
| 单次上限 | **5000 台** | **500 台** |
| 模板 | 通用模板 | 华祥定制模板 |
| 定制组件 | 通用版 | `device-update-device-info-custom-for-huaxiang` |

#### 关键参数

| 参数 | 值 | 说明 |
|------|----|------|
| 文件格式 | `.xlsx` / `.xls` | 仅限 Excel |
| 上传方式 | 拖拽 / 点击 | `drag:true` |
| 单次上限 | **500 台** | 华祥客户更严格的限制 |
| UploadDragger | `height:240px` | 大尺寸上传区 |

#### 4.11 批量修改主机名 `/#/index/device/deviceUpdateHost`

**组件**：`device-update-host/device-update-host.vue`

批量更新设备的通信主机名/IP 地址。`host` 关键词在 vendor.js 中出现 40 次。本页面是「我的设备」子菜单中最复杂的表单，含 6 个字段。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 批量修改主机名 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 我的设备 / 批量修改主机名
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)     # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)
                └── Form (labelWidth:100px, labelAlign:right, maxWidth:800px)
                    ├── FormItem [设备类型：]
                    │   └── Select (value:"4G27", width:"100%")
                    │       └── Option [4G27]
                    │
                    ├── FormItem [IMEI号：] (required)
                    │   └── TextArea (rows:6)
                    │       └── placeholder: "如果需要输入多个IMEI，请换行输入"
                    │
                    ├── FormItem [操作类型：]
                    │   └── RadioGroup (value:"default", horizontal)
                    │       ├── Radio [默认]   (default)
                    │       └── Radio [自定义] (custom)
                    │
                    ├── FormItem [转移类型：]
                    │   └── RadioGroup (value:"server", horizontal)
                    │       ├── Radio [server]
                    │       ├── Radio [qserver]
                    │       └── Radio [gserver]
                    │
                    ├── FormItem [ip/域名：]
                    │   └── InlineRow (align:center, gap:12px)
                    │       ├── Input (placeholder:"请输入ip/域名", width:240px)
                    │       └── Text [输入格式：0.0.0.0:8080] (secondary)
                    │
                    └── FormItem [操作按钮]
                        └── Button [提交] (primary)
```

#### 表单字段详解（6 个字段）

| # | 字段 | 组件 | 选项/值 | 说明 |
|---|------|------|--------|------|
| 1 | 设备类型 | `Select` | 4G27 | 固定选项，GPS 终端型号 |
| 2 | IMEI号 | `TextArea` (6行) | 换行输入 | 必填 |
| 3 | 操作类型 | `RadioGroup` | 默认 / 自定义 | 默认=使用预设主机，自定义=手工指定 |
| 4 | 转移类型 | `RadioGroup` | server / qserver / gserver | 主机类型 |
| 5 | ip/域名 | `Input (240px)` | 如 0.0.0.0:8080 | 当操作类型=自定义时填写 |
| 6 | — | `Button [提交]` | primary | 批量生效 |

#### 转移类型说明

| 类型值 | 全称（推测） | 用途 |
|--------|-----------|------|
| `server` | 主服务器 | 设备上报数据的目标服务器 |
| `qserver` | 快速服务器 | 备用/快速通信服务器 |
| `gserver` | 通用服务器 | 通用数据服务器 |

#### 交互逻辑

```
① 选择设备类型 (4G27)
② 输入 IMEI 号（批量换行）
③ 选择操作类型：
   - 默认 → 提交后使用系统预设主机
   - 自定义 → 填写 ip/域名 如 "0.0.0.0:8080"
④ 选择转移类型 (server/qserver/gserver)
⑤ 点击 [提交] → 批量更新设备主机配置
```

#### 4.12 其他设备子页面（从组件提取）

| 路由 | 组件文件 | 功能 |
|------|---------|------|
| `deviceUpdatePassword` | `device-update-password/device-update-password.vue` | 设备密码批量更新 |
| `deviceUpdateZone` | `device-update-zone` | 设备所属区域批量更新 |
| `deviceUpdateDeviceType` | `device-update-device-type` | 设备型号批量更新 |
| `deviceConfig` | `device-config/device-config.vue` | 设备参数配置（上报频率等） |
| `deviceImport` | `device-import/device-import.vue` | 设备 Excel 批量导入 |
| `deviceRenew` | `device-renew/device-renew.vue` | 设备服务续费管理 |
| `deviceReset` | `device-reset/device-reset` | 远程重置设备配置 |
| `deviceBatchManage` | `device-batch-manage/device-batch-manage` | 设备批量管理总入口 |
| `miltiInfoSearch` | `device-milti-info-search/device-milti-info-search` | 多条件设备信息搜索 |
| `mutiCmd` | `device-muti-cmd/device-muti-cmd` | 批量指令下发（含香港版 `-hk`） |
| `searchResultCmd` | `device-search-result-cmd/device-search-result-cmd` | 搜索结果指令操作（含香港版） |

**完整组件清单**：共提取 19 个与设备管理相关的 Vue 组件文件。

### 5. 📊 数据统计（`/#/index/count/*`）

左侧菜单「数据统计」（图标 `sidebar-data.png`）下包含里程统计、报警统计、停留详情、到期统计和导出五大子页面。`count` 关键词在 app.js 中出现 95 次。

**路由树**：
```
index-count/index-count.vue (父路由)
├── countMileage      里程统计 (权限: main:stat_mileage)
├── countAlarms       报警统计
├── countStayDetail   停留点详细
├── countPastDue      到期统计 (额外发现)
└── countExport       统计数据导出
```

**核心实现细节**（从 app.js 提取）：

```javascript
// 里程格式化函数
t.formatTrackMileage = function(e) {
    return e < 1000 
        ? parseInt(e).toString() + " m"   // <1km → 显示米
        : (e / 1000).toFixed(1) + " km"   // ≥1km → 显示千米
}
t.getMileage = function(e) {
    return (e / 1000).toFixed(1)  // 千米值保留 1 位小数
}
```

**多语言标题**：
- `statistics.mileageTitle` — 里程统计
- `statistics.stayDetailTitle` — 停留详情

#### 5.1 里程统计 `/#/index/count/countMileage`

**组件**：`count-mileage/count-mileage.vue`  
**权限**：`main:stat_mileage`  
**数据来源**：`gps_records` 表 Haversine 距离累加 → `formatTrackMileage()` 格式化

统计设备的行驶里程与油耗数据，是「数据统计」模块的核心页面。二级侧边栏「里程统计」高亮激活。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px, sub-dark)          # 数据统计子菜单 (4项)
    │   ├── 里程统计 (active)                 ├── 报警统计
    │   ├── 停留点详细                        └── 统计数据导出
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 数据统计 / 里程统计
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)       # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:24px)  # 可视化报表面板
                ├── FilterBar (报表时段工具条)
                │   ├── RadioGroup [快捷时间切页] (type:button, value:"today")
                │   │   ├── RadioButton [昨天]     (yesterday)
                │   │   ├── RadioButton [三天]     (three-days)
                │   │   ├── RadioButton [一周]     (week)
                │   │   ├── RadioButton [近30天]   (month)
                │   │   └── RadioButton [自定义]   (custom)
                │   ├── DatePicker [日期范围] (daterange, ["2026-05-19","2026-05-20"])
                │   ├── Select [油耗标准]     (value:"10.0L", width:100px)
                │   ├── Button [查询]         (primary)
                │   └── Button [导出表格]     (outlined)
                │
                ├── ChartContainer (280px, marginBottom:24px)
                │   ├── ChartHeader
                │   │   ├── Text [当前车辆里程统计标题] (h4)
                │   │   └── Legend [里程, 油耗]
                │   └── BaseChart [ECharts 柱状折线复合图] (type:bar-line)
                │
                └── DataTable (flex:1)              # 里程油耗明细表
                    ├── TableColumn [IMEI号]   (prop:imei, width:180)
                    ├── TableColumn [里程 (km)] (prop:mileage, sortable)
                    ├── TableColumn [油耗 (L)]  (prop:fuel, sortable)
                    ├── TableColumn [统计日期]  (prop:date, width:160)
                    └── Pagination (pageSize:10, layout: total/prev/pager/next/sizes)
```

#### FilterBar 时段工具条

| 组件 | 参数 | 说明 |
|------|------|------|
| RadioGroup | `type:button`, 5 预设 | 昨天/三天/一周/近30天/自定义 |
| DatePicker | `type:daterange` | 自定义日期范围选择 |
| Select | `value:"10.0L"`, width:100px | 油耗标准（L/100km） |
| Button [查询] | primary | 按筛选条件查询 |
| Button [导出表格] | outlined | 导出当前数据到 Excel |

#### ECharts 双轴图表

- **类型**：`bar-line`（柱状图 + 折线图复合）
- **双轴**：左轴—里程 (km)，右轴—油耗 (L)
- **图例**：Legend [里程, 油耗]
- **高度**：280px

#### DataTable 明细列 (4 列)

| 列名 | prop | 特性 | 说明 |
|------|------|------|------|
| IMEI号 | `imei` | width:180px | 设备标识 |
| 里程 (km) | `mileage` | sortable | 可排序 |
| 油耗 (L) | `fuel` | sortable | 可排序 |
| 统计日期 | `date` | width:160px | 统计周期 |

#### 分页器配置

`layout: "total, prev, pager, next, sizes"` — 显示总条数 + 上一页 + 页码 + 下一页 + 每页条数选择，`pageSize: 10`

#### 里程格式化

```javascript
// <1000 米 → "xxx m" ; ≥1000 米 → "xxx.x km"
formatTrackMileage(e) = e < 1000 ? parseInt(e) + " m" : (e/1000).toFixed(1) + " km"
```

#### 5.2 报警统计 `/#/index/count/countAlarms`

**组件**：`count-alarms/count-alarms.vue`

统计设备的 13 种报警类型数据。二级侧边栏「报警统计」高亮激活。与里程统计共用相同的 FilterBar 时段工具条。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 报警统计 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 数据统计 / 报警统计
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)       # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:24px)
                ├── FilterBar                  # 与里程统计相同的时段工具条
                │   ├── RadioGroup [5 快捷时间] (yesterday/three-days/week/month/custom)
                │   ├── DatePicker [日期范围]
                │   └── Button [查询] (primary)
                │
                ├── ChartContainer (300px)
                │   ├── ChartHeader
                │   │   ├── Text [设备报警统计主标题] (h4)
                │   │   └── Text [该时间段内的报警总数提示] (secondary, small)
                │   └── BaseChart [ECharts 多类目离散柱状图] (type:bar, xAxisType:category)
                │
                └── DataTable (flex:1, density:compact)  # 13 列稠密表格
                    ├── TableColumn [统计日期]    (date, fixed:left, width:120)
                    ├── TableColumn [电池报警]    (alarm_battery)
                    ├── TableColumn [切断报警]    (alarm_cut)
                    ├── TableColumn [盲区报警]    (alarm_blind)
                    ├── TableColumn [拆除报警]    (alarm_remove)
                    ├── TableColumn [位移报警]    (alarm_move)
                    ├── TableColumn [围栏报警]    (alarm_fence)
                    ├── TableColumn [SOS报警]     (alarm_sos)
                    ├── TableColumn [正常报警]    (alarm_normal)
                    ├── TableColumn [开机报警]    (alarm_poweron)
                    ├── TableColumn [超速报警]    (alarm_overspeed)
                    ├── TableColumn [震动报警]    (alarm_vibration)
                    ├── TableColumn [离线报警]    (alarm_offline)
                    └── Pagination (pageSize:10)
```

#### 13 种报警类型完整列表

| # | 列名 | prop | 说明 |
|---|------|------|------|
| 1 | 统计日期 | `date` | 固定左侧列 (fixed:left) |
| 2 | 电池报警 | `alarm_battery` | 电池异常/低电量 |
| 3 | 切断报警 | `alarm_cut` | 电源被切断 |
| 4 | 盲区报警 | `alarm_blind` | 进入无信号区域 |
| 5 | 拆除报警 | `alarm_remove` | 设备被拆除 |
| 6 | 位移报警 | `alarm_move` | 车辆异常移动 |
| 7 | 围栏报警 | `alarm_fence` | 进出电子围栏 |
| 8 | SOS报警 | `alarm_sos` | 紧急求救按钮 |
| 9 | 正常报警 | `alarm_normal` | 常规状态报告 |
| 10 | 开机报警 | `alarm_poweron` | 设备开机 |
| 11 | 超速报警 | `alarm_overspeed` | 速度 > 120km/h |
| 12 | 震动报警 | `alarm_vibration` | 震动传感器 |
| 13 | 离线报警 | `alarm_offline` | 设备离线 |

#### 与里程统计的差异

| 维度 | 里程统计 | 报警统计 |
|------|---------|---------|
| 图表类型 | bar-line 双轴复合 | bar 多类目离散 |
| 图表高度 | 280px | 300px |
| 导出按钮 | ✅ 有 | ❌ 无 |
| 油耗 Select | ✅ 10.0L | ❌ 无 |
| 表格密度 | 普通 | `density:compact` |
| 表格列数 | 4 列 | **13 列** |
| 首列固定 | 否 | 是 (fixed:left) |

#### 5.3 停留点详细 `/#/index/count/countStayDetail`

**组件**：`count-stay-detail/count-stay-detail.vue`

分析设备的停留行为。纯表格视图，无图表。二级侧边栏「停留点详细」高亮激活。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 停留点详细 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 数据统计 / 停留点详细
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)
            │
            └── CardPanel (右侧, flex:1, padding:24px)
                ├── FilterActionBar (极简条件工具条)
                │   ├── InlineGroup
                │   │   ├── Select [日期预设] (value:"today", width:160px)
                │   │   └── Button [查询] (primary)
                │   └── Button [导出表格] (text-link, icon:download)
                │
                └── DataTable (flex:1, border:true, stripe:false)  # 9 列表格
                    ├── TableColumn [IMEI号]      (imei, width:140)
                    ├── TableColumn [起始日期]     (startDate, width:160)
                    ├── TableColumn [定位类型]     (locationType, width:100)
                    ├── TableColumn [结束日期]     (endDate, width:160)
                    ├── TableColumn [停留点位置]   (address, minWidth:240)
                    │   └── showOverflowTooltip: true  # 长文本气泡提示
                    ├── TableColumn [天]           (durationDay, 70px, center)
                    ├── TableColumn [小时]         (durationHour, 70px, center)
                    ├── TableColumn [分钟]         (durationMinute, 70px, center)
                    ├── TableColumn [操作栏]       (fixed:right, width:120)
                    │   └── Button [停留点详情] (type:text, small)
                    └── Pagination (total:17, pageSize:20,
                          layout: prev/pager/next/jumper/sizes/total)
```

#### 表格列详解 (9 列)

| 列名 | prop | 宽度 | 特性 | 说明 |
|------|------|------|------|------|
| IMEI号 | `imei` | 140px | | 设备标识 |
| 起始日期 | `startDate` | 160px | | 停留开始时间 |
| 定位类型 | `locationType` | 100px | | GPS/LBS/WiFi |
| 结束日期 | `endDate` | 160px | | 停留结束时间 |
| 停留点位置 | `address` | minWidth:240 | `showOverflowTooltip` | 逆地理编码地址 |
| 天 | `durationDay` | 70px | center | 停留时长—天 |
| 小时 | `durationHour` | 70px | center | 停留时长—小时 |
| 分钟 | `durationMinute` | 70px | center | 停留时长—分钟 |
| 操作栏 | — | 120px | fixed:right | 查看详情 |

#### 停留时长显示

停留时长被拆分为 **天 / 时 / 分** 三列独立显示，而非单一格式化字符串。三列均居中对齐 (align:center)。

#### 与其他统计页的 Filter 差异

| 页面 | 时间选择 | 导出按钮样式 |
|------|---------|------------|
| 里程统计 | RadioGroup (5按钮) + DatePicker | outlined |
| 报警统计 | RadioGroup (5按钮) + DatePicker | ❌ 无 |
| 停留点详细 | Select（下拉框） | text-link |

#### 5.4 到期统计 `/#/index/count/countPastDue`

**组件**：`count-past-due/count-past-due`

额外发现的子页面，统计设备服务到期情况：
- 即将到期设备列表
- 已过期设备列表
- 到期时间倒计时
- 批量续费入口跳转

#### 5.5 统计数据导出 `/#/index/count/countExport`

**组件**：`count-export/count-export`

数据统计模块唯一的纯表单页面，通过配置表单异步导出报表。二级侧边栏「统计数据导出」高亮激活。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 三级布局
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px)
    │   └── 统计数据导出 (active)
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 数据统计 / 统计数据导出
        │
        └── GridContainer (row, flex:1, gap:15px)
            ├── CardPanel (左侧, 300px)       # 复用客户/设备检索树
            │
            └── CardPanel (右侧, flex:1, padding:40px)
                └── Form (labelWidth:120px, labelPosition:right, rules:exportRules)
                    ├── FormItem [要导出] (required, prop:exportType)
                    │   └── Select [统计类型] (width:400px)
                    │       └── placeholder: "请选择统计类型"
                    │
                    ├── FormItem [时间范围] (required, prop:timeRange)
                    │   ├── DatePicker (daterange, width:400px)
                    │   │   └── placeholder: "请选择时间范围"
                    │   └── FormNotice [最多只能导出7天的数据] (warning, inline)
                    │
                    ├── FormItem [勾选代理商] (required, prop:selectedAgents)
                    │   ├── FormNotice [最大只能导出50位代理商] (info)
                    │   ├── TreeContainer (400px × 320px, border, scrollable)
                    │   │   ├── Input [树内过滤] (placeholder:"用户名/用户昵称", prefixIcon:search)
                    │   │   └── Tree [代理商多选级联树] (showCheckbox, nodeKey:id)
                    │   └── FormCounter [已勾选0位代理商] (primary)
                    │
                    └── FormItem (marginLeft:120px, marginTop:32px)
                        └── ButtonGroup (gap:16px)
                            ├── Button [提交导出] (primary, action:submit)
                            └── Button [重置表单] (default, action:reset)
```

#### 表单字段详解 (3 个必填字段)

| # | 字段 | 组件 | 约束 | 说明 |
|---|------|------|------|------|
| 1 | 要导出 | Select (width:400px) | 必填 | 统计类型（里程/报警/停留点） |
| 2 | 时间范围 | DatePicker (daterange) | 必填 | **最多 7 天** |
| 3 | 勾选代理商 | Tree (showCheckbox) | 必填 | **最多 50 位代理商** |
| — | — | Button [提交导出] | — | 异步导出 |
| — | — | Button [重置表单] | — | 清空所有选项 |

#### 限制规则

| 限制项 | 上限值 | 提示组件 | 提示类型 |
|--------|-------|---------|---------|
| 时间范围 | **7 天** | FormNotice (inline) | warning |
| 代理商数量 | **50 位** | FormNotice (marginBottom) | info |

#### 代理商树选择器

- **容器**：TreeContainer (400px × 320px)，带边框，可滚动
- **过滤**：内置 Input (prefixIcon:search)，按用户名/用户昵称实时过滤
- **多选**：Tree `showCheckbox: true`，支持级联选择
- **计数**：FormCounter 实时显示 "已勾选 X 位代理商"

#### 与其他统计页的差异

| 维度 | 里程/报警/停留点 | 统计数据导出 |
|------|---------------|------------|
| 内容类型 | 图表 + 表格 | 纯表单 |
| 左侧面板 | 检索树（共用） | 检索树（共用，但代理商在右侧独立选择） |
| labelWidth | N/A | **120px** |
| 导出方式 | 页面内按钮直接导出 | 表单配置后异步导出 |

### 6. 🔔 报警列表（`/#/index/alarms`、`/#/index/alarmsAll`）

**组件**：
- `index-alarms/index-alarms.vue` — 未处理报警列表
- `index-alarms/index-alarms-all.vue` — 全部报警

**报警类型**（5 种）：
| 类型 | 触发条件 | 严重程度 |
|------|---------|---------|
| `overspeed` | 速度 > 120km/h | 严重 |
| `geofence_out/in` | 设备离开/进入电子围栏 | 警告 |
| `sos` | 设备 SOS 按键触发 | 紧急 |
| `power_off` | 设备断电 | 警告 |
| `vibration` | 设备震动传感器触发 | 信息 |

**核心实现**：
- **报警声音**：`alarmSound` State → `setAlarmSound` action → `localStorage` 持久化
- **实时通知**：新报警到达时浏览器播放声音提醒
- **权限**：`isAlarmCustomRootAccount` 控制报警菜单可见性

### 7. 🔵 电子围栏（`/#/index/fence`）

**组件**：`index-fence/index-fence-leaflet.vue`  
**图标**：`sidebar-fence.png`  
**权限**：`main:fence`

电子围栏页面采用 **三栏 GIS 布局**（无 SubSidebar），左侧检索树 → 中间围栏列表 → 右侧地图画布。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 两栏布局（无 SubSidebar）
│
└── 右侧: MainContent (row, flex:1)
    ├── ContentWorkspace (column, flex:1)
    │   ├── TopNavbar (60px)
    │   │   └── Breadcrumb: 电子围栏
    │   │
    │   └── GISGridContainer (row, flex:1, gap:15px)  # 三栏 GIS 面板
    │       ├── CardPanel (左侧, 300px)              # 复用客户/设备检索树
    │       │
    │       ├── CardPanel (中间, 320px)              # 围栏业务流控制面板
    │       │   ├── Tabs [围栏维度切换] (value:"agent-fence")
    │       │   │   ├── TabPane [代理商的围栏] (agent-fence)
    │       │   │   └── TabPane [设备的围栏]   (device-fence)
    │       │   ├── ActionBar
    │       │   │   └── Button [创建新围栏] (primary, icon:plus)
    │       │   ├── DataTable (size:small, 22条围栏)
    │       │   │   ├── TableColumn [围栏名称] (fenceName)
    │       │   │   └── TableColumn [操作区] (110px, center)
    │       │   │       ├── Button [查看] (text)
    │       │   │       └── PopoverMenu [更多>>] (trigger:click)
    │       │   │           └── DropdownMenu
    │       │   │               ├── DropdownItem [分配围栏给设备]
    │       │   │               ├── DropdownItem [关联的设备]
    │       │   │               ├── DropdownItem [编辑]
    │       │   │               ├── DropdownItem [详情]
    │       │   │               └── DropdownItem [删除] (danger)
    │       │   └── Pagination (small, pageSize:15, layout: prev/pager/next)
    │       │
    │       └── GISMapViewer (右侧, flex:1, mapProvider:"baidu-map")
    │           ├── MapTopbar (absolute-top, zIndex:10)
    │           │   ├── RadioGroup [视图路线模式]
    │           │   │   ├── RadioButton [默认]   (default)
    │           │   │   └── RadioButton [公交路线] (bus)
    │           │   └── MapFilterInputs
    │           │       ├── Select [检索关键字类别] (value:"keyword")
    │           │       ├── Input [地址查询过滤] (placeholder:"请输入需要查询的地址")
    │           │       └── Select [底图样式] (百度地图/卫星地图)
    │           ├── MapDrawingOverlay
    │           │   └── MapCircle [围栏圆形] (radius:500m, fillColor:#ff4d4f, opacity:0.3)
    │           └── MapToolbarWidget (absolute-right-center)
    │               ├── Button [测距]     (icon:ruler)
    │               └── Button [多边形划分] (icon:draw-polygon)
```

#### 三栏 GIS 布局（与监控平台/数据统计的差异）

| 维度 | 监控平台 | 数据统计 | 电子围栏 |
|------|---------|---------|---------|
| SubSidebar | 无 | 180px 二级侧边栏 | **无** |
| 中间面板 | 无 | 无 | **320px 围栏控制面板** |
| 地图区域 | 全覆盖 | 无 | flex:1 右侧地图 |
| 布局类型 | 检索面板 + 地图 | 检索面板 + 报表 | 检索面板 + 列表 + 地图 |

#### 中间围栏控制面板

**Tabs 维度切换**：
- `agent-fence`：按代理商维度查看围栏
- `device-fence`：按设备维度查看围栏

**围栏操作菜单**（PopoverMenu 弹出 5 项）：
| 操作 | 说明 |
|------|------|
| 分配围栏给设备 | 将选中围栏绑定到设备 (modal-fence-alloc) |
| 关联的设备 | 查看该围栏已绑定的设备列表 |
| 编辑 | 修改围栏名称/半径/类型 |
| 详情 | 查看围栏完整信息 |
| 删除 (danger) | 删除围栏 |

**分页**：22 条围栏，每页 15 条，简洁布局 (prev/pager/next)

#### 右侧地图 (GISMapViewer)

**地图引擎**：`baidu-map`（百度地图 v2）

**MapTopbar 工具条**：
| 组件 | 选项 | 说明 |
|------|------|------|
| RadioGroup | 默认 / 公交路线 | 叠加公交线路图层 |
| Select | — | 检索关键字类别 |
| Input | — | 地址查询过滤输入 |
| Select | 百度地图 / 卫星地图 | 底图样式切换 |

**绘图工具**：
- 圆形围栏 (MapCircle)：红色半透明 (#ff4d4f, opacity:0.3)，默认半径 500m
- 多边形划分 (Button:draw-polygon)：自定义多边形围栏
- 测距 (Button:ruler)：两点测距

**子组件结构**（从源码提取）：
```
index-fence/
├── index-fence-leaflet.vue           # 主页面
├── components/
│   ├── map-fence-baidu-v2/index.vue  # 百度地图 v2 组件
│   ├── modal-fence-add/index.vue     # 添加围栏弹窗
│   ├── modal-fence-alloc             # 分配围栏
│   └── circle.png                    # 圆形围栏图标
└── img/
    └── gis-fence@2x.png              # GIS 图标
```

### 8. ⚡ 远程指令（`/#/index/directive`、`/#/index/directive/cmdSend`）

**组件**：`index-directive/index-directive.vue`

远程指令页面采用两栏布局（300px 检索树 + flex 指令面板），页面分三大区域：指令类别网格 → 动态配置表单 → 指令日志。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 两栏布局（无 SubSidebar）
│
└── 右侧: MainContent (row, flex:1)
    ├── ContentWorkspace (column, flex:1)
    │   ├── TopNavbar (60px)
    │   │   └── Breadcrumb: 远程指令
    │   │
    │   └── GridContainer (row, flex:1, gap:15px)
    │       ├── CardPanel (左侧, 300px)              # 复用客户/设备检索树
    │       │
    │       └── CardPanel (右侧, flex:1, padding:24px) # 指令控制面板
    │           ├── DirectiveGrid (6列, gap:16px)    # 指令类别卡片网格
    │           │   ├── [位移报警]   (move-alert, cyan, active)
    │           │   ├── [断电报警]   (power-off, orange)
    │           │   ├── [超速报警]   (speed-limit, blue)
    │           │   ├── [重启设备]   (restart, sky)
    │           │   ├── [震动报警]   (vibrate, purple)
    │           │   └── [自定义指令] (custom-code, indigo)
    │           │
    │           ├── ConfigFormSection (border:dashed)  # 动态配置表单
    │           │   └── Form (labelWidth:100px, labelPosition:left)
    │           │       ├── StaticFormItem [指令类型]
    │           │       │   └── Text [位移报警] (bold)  # 与选中卡片联动
    │           │       ├── FormItem [操作类型]
    │           │       │   └── RadioGroup (value:"close")
    │           │       │       ├── Radio [开启] (open)
    │           │       │       └── Radio [关闭] (close)
    │           │       └── FormItem (marginLeft:100px)
    │           │           └── Button [提交指令] (primary, action:submit)
    │           │
    │           ├── Divider
    │           │
    │           └── LogDashboardSection (flex:1)       # 指令日志追溯
    │               ├── LogHeader
    │               │   ├── SectionTitle [指令日志] (icon:bullet)
    │               │   └── Button [指令记录查询] (primary, small, icon:search)
    │               └── EmptyTableContainer (flex:1, border)
    │                   └── EmptyHolder [暂无数据] (light-box)
```

#### 6 种指令类型卡片

| 指令 | 图标 | 色彩 | 状态 | 说明 |
|------|------|------|------|------|
| 位移报警 | `move-alert` | cyan | **active** | 设备异常移动告警开关 |
| 断电报警 | `power-off` | orange | | 设备断电告警开关 |
| 超速报警 | `speed-limit` | blue | | 超速阈值设置 |
| 重启设备 | `restart` | sky | | 远程重启 GPS 终端 |
| 震动报警 | `vibrate` | purple | | 震动传感器告警开关 |
| 自定义指令 | `custom-code` | indigo | | 自定义指令码下发 |

**交互**：点击卡片切换激活状态 → 下方 ConfigFormSection 动态联动显示对应配置项。

#### 动态配置表单

- **指令类型**：只读 Text，与选中的指令卡片名称联动
- **操作类型**：RadioGroup（开启/关闭），默认"关闭"
- **提交指令**：执行发送（`actionSendCommand` 流程）

**指令下发流程**（app.js 提取）：
```
actionSendCommand
  ├── 检查设备状态 → online/offline
  ├── SWMODE 特殊处理 → "设备已在线无需发送常规模式指令"
  ├── 超时处理 → "发送超时，需否转存为离线指令？"
  └── getDirectiveStatus() → 获取执行状态
```

#### 指令日志区域

- **指令记录查询**：按钮跳转日志检索页（`cmdTask` / `testLogCmdTask`）
- **空状态**：EmptyHolder `light-box` 样式 — "暂无数据"

#### 子路由

```
directive (父路由)
├── cmdSend      指令下发（立即执行）
├── cmdTask      指令定时任务
└── testLogCmdTask  测试日志指令任务
```

### 9. 🎥 视频直播（`/#/index/videoLive`）

**组件**：`index-video-live/index-video-live.vue`  
**国际化**：`index.videoLive` → "视频直播" / "Live video broadcast"

两栏布局（300px 检索树 + flex 视频播放器），深色背景播放器容器，HLS 实时视频流播放。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row) — 两栏布局（无 SubSidebar）
│
└── 右侧: MainContent (row, flex:1)
    ├── ContentWorkspace (column, flex:1)
    │   ├── TopNavbar (60px)
    │   │   └── Breadcrumb: 视频直播
    │   │
    │   └── GridContainer (row, flex:1, gap:15px)
    │       ├── CardPanel (左侧, 300px)              # 复用客户/设备检索树
    │       │
    │       └── VideoPlayerHub (右侧, flex:1, bg:#1a1a1a, radius:8px)
    │           ├── HTML5VideoCore (flex:1, controls:true)
    │           │   └── SourceTrack (src:"", type:"application/x-mpegURL")
    │           │       # HLS 视频流
    │           │
    │           └── CustomPlayerControls (44px, absolute-bottom)
    │               ├── LeftGroup
    │               │   ├── IconButton [play-arrow]  # 播放/暂停
    │               │   └── TimeDisplay [0:00 / 0:00] # 当前/总时长
    │               └── RightGroup
    │                   ├── IconButton [volume-up]    # 音量控制
    │                   └── IconButton [fullscreen]   # 全屏
```

#### 播放器参数

| 参数 | 值 | 说明 |
|------|----|------|
| 背景色 | `#1a1a1a` | 深色影院模式 |
| 流协议 | `application/x-mpegURL` | **HLS** (m3u8) |
| 自动播放 | `false` | 需手动点击播放 |
| 预加载 | `auto` | 自动加载元数据 |
| 控制条高度 | `44px` | |

#### 播放器控制项 (4 个)

| 图标 | 功能 | 位置 |
|------|------|------|
| `play-arrow` | 播放/暂停切换 | 左侧 |
| 时间显示 | `0:00 / 0:00` 格式 | 左侧 |
| `volume-up` | 音量调节 | 右侧 |
| `fullscreen` | 全屏切换 | 右侧 |

#### 技术实现

- HLS 视频播放使用 **hls.js** 库（HTML 引用 `hls.js`）
- 设备需具备视频/摄像头功能
- 权限控制："点击发送指令开启视频权限，如果该设备没有视频功能无需操作"
- 视频录像管理 API：`videoDelete`

### 10. 🛤️ 历史轨迹（`/#/index/track`）

**组件**：`index-track/index-track-v2.vue`（v2 版本）  
**地图引擎**：`BaiduMapGL`（百度地图 GL 版）

历史轨迹采用 **全屏地图 + 浮动控件叠加** 布局，无 SubSidebar，无左侧检索面板。所有交互工具悬浮在地图上方。

#### 整体布局结构 (JSON VDOM)

```
AppLayout (row)
│
└── 右侧: MainContent (row, flex:1, relative)
    ├── TopNavbar (60px, absolute-top, zIndex:10)  # 悬浮在地图上方
    │   └── Breadcrumb: 历史轨迹
    │
    ├── MapGISContainer (absolute-full, engine:BaiduMapGL)
    │   └── MapPolylineOverlay                        # 轨迹路线几何图层
    │       ├── strokeColor: "#3388ff"               # 蓝色轨迹线
    │       ├── strokeWeight: 6                      # 线宽 6px
    │       └── pathPoints: []                       # 轨迹点数组
    │
    └── FloatingPanelGroup (absolute-overlay, zIndex:20, pointerEvents:none)
        ├── CollapseHandle (absolute, top:50%, left:0)
        │   └── collapsed: true         # 左侧业务树折叠触发器
        │
        ├── FloatingFilterBar (top:75px, left:15px, right:15px)  # 查询配置条
        │   ├── Tag [当前车辆]                (closable, primary)
        │   ├── DateTimePicker [起始时间]
        │   ├── DateTimePicker [结束时间]
        │   ├── Select [定位类型]              (value:"北斗")
        │   ├── Switch [轨迹优化]              (value:true)
        │   ├── InputDropdown [超速设置]       (value:"120km")
        │   └── Button [查询]                  (primary, icon:search)
        │
        ├── MapZoomController (absolute-bottom-left)
        │   ├── IconButton [+]                 # 放大
        │   └── IconButton [-]                 # 缩小
        │
        ├── MapToolbar (absolute-right-center)
        │   ├── IconButton [ruler]             # 测距
        │   ├── IconButton [polygon-crop]      # 区域裁剪
        │   └── IconButton [layers]            # 图层切换
        │
        └── FloatingRoutePlaybackController (bottom:25px, right:15px)
            └── BadgeStatus [运行状态] (success) # 播放状态指示
```

#### 全屏地图模式

| 布局特征 | 监控平台 | 历史轨迹 |
|---------|---------|---------|
| 地图区域 | 与检索面板共享 | **全屏覆盖** (absolute-full) |
| SubSidebar | 无 | **无** |
| 左侧面板 | ✅ 320px | ❌ 无（CollapseHandle 折叠） |
| 顶部栏 | 固定 | absolute 悬浮 |
| 控制工具 | 地图内嵌 | FloatingPanelGroup 叠加 |

#### FloatingFilterBar 查询工具条 (7 个控件)

| # | 组件 | 值/说明 | 功能 |
|---|------|--------|------|
| 1 | Tag | 车辆名称 (closable, primary) | 当前查询的设备标识，可关闭 |
| 2 | DateTimePicker | 起始时间 | 轨迹开始时间 |
| 3 | DateTimePicker | 结束时间 | 轨迹结束时间 |
| 4 | Select | 北斗 | 定位类型筛选 |
| 5 | Switch | `true` | 轨迹优化开关（压缩/去重） |
| 6 | InputDropdown | `120km` | 超速阈值设置 |
| 7 | Button | 查询 (primary, search) | 执行查询 |

#### 地图工具 (3 个)

| 工具 | 图标 | 功能 |
|------|------|------|
| 测距 | `ruler` | 地图上点击测量两点距离 |
| 区域裁剪 | `polygon-crop` | 多边形区域选择 |
| 图层切换 | `layers` | 底图/卫星/地形切换 |

#### 轨迹渲染

- **引擎**：百度地图 GL (`BaiduMapGL`)
- **轨迹线**：PolylineOverlay，蓝色 `#3388ff`，线宽 6px
- **轨迹优化**：Switch 开启后对海量 GPS 点进行抽样/压缩

#### 右下角播放控制器

`BadgeStatus` — 显示当前轨迹播放状态：运行状态 (success 绿色)

#### 运动状态检测（app.js 提取）

```javascript
// 静止：速度≤10km/h 且<1min 或 静止>1min
// 运动：10-60km/h  |  快速：60-120km/h  |  超速：>120km/h
getCarMovingState(e) → STOP / MOVING / FAST / OVERSPEED
```

### 11. 💰 支付与订单
- 账户 CRUD：`/pay/account/*`
- 设备续费：`deviceRenew` / `renewPrice`

### 12. 🔄 OTA 远程升级
- `otaList` + `otaHttp` + `otaUpdateListForUser`
- AGPS 星历数据更新

### 13. 🔧 系统设置（`sidebar-set.png`）

**一级菜单图标**：`settings`
**布局**：三级布局（180px SubSidebar + 全宽通栏工作区），**无左侧检索面板**。

系统设置包含 4 个子菜单，本页面展示「报警速度设置」。

#### 二级侧边栏 (SubSidebar, 4 项)

| # | 菜单名称 | 焦点 |
|---|---------|------|
| 1 | 报警速度设置 | **active** |
| 2 | 围栏报警设置 | |
| 3 | 通知设置 | |
| 4 | 微信绑定管理 | |

#### 整体布局结构 (JSON VDOM) — 报警速度设置

```
AppLayout (row)
│
└── 右侧: MainContent (row, flex:1)
    ├── SubSidebar (180px, sub-dark)          # 系统配置子菜单
    │   ├── 报警速度设置 (active)             ├── 围栏报警设置
    │   ├── 通知设置                          └── 微信绑定管理
    │
    └── ContentWorkspace (column, flex:1)
        ├── TopNavbar (60px)
        │   └── Breadcrumb: 系统设置 / 报警速度设置
        │
        └── SinglePanelContainer (flex:1, padding:15px)  # 全宽通栏（无左侧面板）
            └── CardPanel (flex:1, padding:24px)
                ├── FilterActionBar
                │   ├── InlineSearchForm
                │   │   ├── Input [设备名称/IMEI] (width:220px)
                │   │   └── Button [查询] (primary, icon:search)
                │   └── Button [批量删除] (danger, icon:delete, plain)
                │
                └── DataTable (border:true, 6列, 行内编辑)
                    ├── TableColumn [复选框]     (selection, 55px)
                    ├── TableColumn [IMEI号]     (imei, 180px)
                    ├── TableColumn [设备名称]   (deviceName, minWidth:150)
                    ├── TableColumn [超速值 (km/h)] (160px, center)
                    │   └── InputNumber (min:0, max:300, controls:false, small)
                    │       # 行内直接编辑！范围 0-300 km/h
                    ├── TableColumn [更新时间]   (updateTime, 180px)
                    ├── TableColumn [操作] (150px, fixed:right)
                    │   ├── Button [保存] (text, small, primary)
                    │   └── Button [删除] (text, small, danger)
                    └── Pagination (pageSize:10, layout: total/prev/pager/next/sizes)
```

#### 系统设置子菜单

| # | 菜单 | 功能（推断） |
|---|------|-----------|
| 1 | 报警速度设置 | 按设备配置超速阈值 (0-300 km/h)，**行内编辑** |
| 2 | 围栏报警设置 | 配置围栏进出告警规则 |
| 3 | 通知设置 | 告警通知方式（短信/APP/邮件） |
| 4 | 微信绑定管理 | 微信企业号/公众号绑定 |

#### 围栏报警设置（子菜单第 2 项）

**面包屑**：系统设置 / 围栏报警设置
**功能**：按设备独立控制进/出围栏报警开关，行内 Switch 控件。

```
DataTable (6列, Switch 开关控制)
├── TableColumn [IMEI号]     (180px)
├── TableColumn [设备名称]   (minWidth:150)
├── TableColumn [进围栏报警] (140px, center)
│   └── Switch (activeValue:1, inactiveValue:0)  # 进围栏报警开关
├── TableColumn [出围栏报警] (140px, center)
│   └── Switch (activeValue:1, inactiveValue:0)  # 出围栏报警开关
├── TableColumn [更新时间]   (180px)
└── TableColumn [操作] (100px, fixed:right)
    └── Button [保存] (text, small)  # 提交修改
```

**与报警速度设置的差异**：
| 维度 | 报警速度设置 | 围栏报警设置 |
|------|-----------|-----------|
| 编辑控件 | InputNumber (0-300) | Switch (开/关) |
| 复选框列 | ✅ 有 | ❌ 无 |
| 批量删除 | ✅ 有 | ❌ 无 |

#### 行内编辑特性

超速值列使用 `InputNumber` 组件嵌入表格单元格：
- 范围：**0 ~ 300 km/h**
- 无递增按钮 (`controls:false`)
- 小尺寸 (`small`)
- 修改后点击 [保存] 提交，或 [删除] 清除配置

#### 与之前模块的布局差异

| 模块 | SubSidebar | 左侧检索面板 |
|------|-----------|------------|
| 我的设备 | 180px (11项) | ✅ 300px |
| 数据统计 | 180px (4项) | ✅ 300px |
| 系统设置 | 180px (4项) | ❌ **无** |
| 电子围栏 | 无 | ✅ 300px |
| 远程指令 | 无 | ✅ 300px |

### 14. 🔍 综合搜索（`sidebar-search.png`）

**组件**：
- `device-milti-info-search/device-milti-info-search` — 多条件设备搜索
- `device-search-result-cmd/device-search-result-cmd` — 搜索结果指令操作
- `device-search-result-cmd/device-search-result-cmd-hk` — 香港版
- `test-search/test-search.vue` — 搜索测试页面
- `test-card/test-card-search` — 卡号搜索
- `test-log/test-log-search.vue` — 日志搜索

支持按设备名/IMEI/终端ID/车牌号等组合条件搜索，搜索结果支持导出和指令下发。

### 15. 🎵 多媒体（`sidebar-music.png`）

**功能推断**：
- 音频播放/对讲：设备的双向语音/音频功能
- 多媒体文件管理：设备录制的音频/视频文件
- 文本转语音（TTS）：向设备发送语音播报指令

> 此模块未找到独立的 Vue 组件文件，可能复用其他模块的组件。

### 16. 👤 用户管理（`sidebar-user.png`）

**组件**：
- `device-userinfo/device-userinfo.vue` — 客户/用户资料管理
- `cmd-send/test-config-platform-for-user` — 平台用户配置
- `test-ota-list/test-ota-update-list-for-user` — 用户 OTA 更新

**权限体系**（从 app.js 提取的权限标识）：
```
main:monitor                    → 监控平台
main:devices                    → 设备管理
main:devices_management         → 设备管理
main:devices_user_info          → 设备用户信息
main:devices_import             → 设备导入
main:devices_muti_motify_info   → 批量修改设备信息
main:devices_muti_update_device_type → 批量修改设备类型
main:stat_mileage               → 里程统计
main:fence                      → 电子围栏
main:devices_huaxiang_import    → 华祥数据导入
```

**角色管理**：
```javascript
SET_ROLE mutation  // 设置用户角色
this.role          // 当前用户角色
```

### 17. 🏭 平台管理（`sidebar-pingtai.png`）

**组件**：
- `test-stock/test-stock` — 设备库存总览
- `test-stock/test-stock-device` — 库存设备管理
- `test-stock/test-import-device` — 批量导入设备
- `test-stock/test-import-imei` — 批量导入 IMEI
- `test-stock/test-stock-removal` — 设备移除管理
- `device-renew/device-renew.vue` — 设备续费
- `device-transform/device-transform` — 设备转移

### 18. 🔋 电池管理（新增模块）

`battery` 关键词在 app.js 中出现 104 次，是完整的设备电池监控模块。

**监控指标**（从国际化文本提取）：
| 指标 | 翻译 key | 说明 |
|------|---------|------|
| 电池状态 | `battery.charging` / `battery.discharge` / `battery.free` | 充电中/放电中/空闲中 |
| 电池百分比 | `battery.percentCharge` | 电量百分比 |
| 电压 | `battery.voltage` | 电池电压 (V) |
| 电流 | `battery.electricity` | 充放电电流 (A) |
| 温度 | `battery.temperature` | 电池温度 |
| 温度变化 | `battery.temperChange` | 温度变化趋势 |
| 使用次数 | `battery.numberOfUse` | 充放电循环次数 |
| 电池组详情 | `battery.batteryPackDetail` | 多组电池分别监控 |
| 温度传感器 | `battery.temperatureSensor` | 传感器状态 |

### 19. 🏥 车辆检测（`/#/index/checkCar`）

**组件**：
- `index-check-car/index-check-car.vue` — 车辆检测主页
- `index-check-car/map-check-area.vue` — 地图区域检测
- `index-check-car/map-check-point.vue` — 地图点位检测

**功能**：在地图上设定检测区域和检测点，实时监测车辆经过情况。

### 20. 🚌 公交/班车管理（`/#/index/bus`）

**组件**：
- `index-bus/index-bus.vue` — 公交/班车管理主页
- `index-bus/bus-line-list.vue` — 班车线路列表

**功能推断**：管理公交线路或企业班车路线，结合 GPS 实时追踪车辆位置。

### 21. ⚠️ 风险点管理（`/#/index/riskPoint`）

**组件**：`index-risk-point/index-risk-point.vue`

**功能推断**：在地图上标注高风险区域（事故多发点、限行区等），设备靠近时触发提醒。

### 22. 🛞 轮胎管理

**组件**：`index-tire/index-tire.vue`

**功能推断**：GPS 设备集成胎压监测（TPMS），实时显示轮胎压力和温度数据。

### 23. 📦 订单管理（`/#/index/order`、`/#/index/pay`）

**组件**：
- `index-order/index-order` — 订单管理主页
- `index-order-list/index-order-list` — 订单列表
- `index-pay/index-pay` — 支付管理
- `index-pay-orders/index-pay-orders` — 支付订单
- `index-pay-c-agent-account/index-pay-c-agent-account` — 代理账户
- `index-pay-discount-code/index-pay-discount-code` — 优惠码管理
- `index-pay-renew-price/index-pay-renew-price` — 续费价格设置

### 24. 🧪 测试工具模块

| 模块 | 组件 |
|------|------|
| IP 传输测试 | `test-transfer-ip/test-transfer-ip` / `test-transfer-ip-result` / `test-transfer-ip-results` |
| OTA 测试 | `test-ota-list/test-ota` / `test-ota-list` / `test-ota-http` / `test-agps` / `test-ota-update-list-for-user` |
| 库存测试 | `test-stock/test-stock` / `test-stock-device` / `test-import-device` / `test-import-imei` / `test-stock-removal` |
| 卡号测试 | `test-card/test-card-search` |
| 日志测试 | `test-log/test-log-search.vue` / `test-log/test-log-monitor.vue` |
| 搜索测试 | `test-search/test-search.vue` |

### 25. 其他特性

- **404 页面**：`"哎呦 ~ 老司机飘啦,跑错页面了..."` — 品牌化 404 提示
- **切换旧版**：`qie-huan-jiu-ban` — 保留旧版系统入口
- **域名配置**：`domain` 国际化文本 — 支持自定义域名

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
