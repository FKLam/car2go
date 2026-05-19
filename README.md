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

### 4. 📱 我的设备（设备管理 — `/#/index/device/*`）

左侧菜单「我的设备」下包含设备管理和客户资料两大入口，以及十余个批量操作工具子页面。

**菜单入口**：
- 点击「我的设备」展开子菜单
- `deviceMenuType` State 控制当前选中的子页面视图（0=设备列表, 1=客户资料, 2=批量修改设备信息...）

#### 4.1 设备管理 `/#/index/device/deviceList`

**组件**：`device-device/device-device-v2.vue`

设备管理的核心页面，展示所有设备的列表视图。

**Store 状态**：
```
deviceList: []              // 设备列表（Array<Device>）
deviceListDataInfo: null     // 设备列表元数据
originDeviceListLen: 0       // 原始列表长度
isUpdateDeviceList: false    // 是否正在更新
loadingDeviceList: false     // 加载状态
deviceMenuType: 0            // 当前菜单视图类型
```

**数据流**：
```
getDeviceList action
  → 拉取后端设备数据
  → 过滤华祥未处理设备 (isHuaXiangUsers && isAgent)
  → noProcessTerminalIDMap 黑名单过滤
  → deviceListMap[terminalID] 同步更新地图 Marker
  → deviceList.unshift(newDevice) 新设备加入列表头部
```

**设备状态驱动**：
- `DEVICE_STATE_MAP.zx` → 在线
- `DEVICE_STATE_MAP.lx` → 离线
- `DEVICE_STATE_MAP.wjh` → 未激活
- `EnumCarState.EXPIRE` → 已过期
- `EnumCarState.UNKNOWN` → 未知

**设备图标**：
- `device.iconType` 字段控制设备在地图上的图标类型
- `setMarkerIcon(this.device.iconType)` 根据类型渲染不同图标
- `getCarStateIconOptions()` 获取可用图标选项列表
- `isFixedDev()` 判断是否为固定点位设备

#### 4.2 客户资料 `/#/index/device/userInfo`

**组件**：`device-userinfo/device-userinfo.vue`

管理设备关联的客户/用户信息。

**Store 状态**：
```
userInfo: null              // 客户资料对象
selectUser: null            // 当前选中用户
```

**Store Mutations/Actions**：
- `SET_USERINFO` — 设置用户信息
- `UPDATE_USERINFO` — 更新用户信息
- `setUserInfo` / `updateUserInfo` / `clearUserInfo` actions
- 用户信息持久化到 `sessionStorage`

#### 4.3 批量修改设备信息 `/#/index/device/deviceUpdateDeviceInfo`

**组件**：`device-update-device-info/device-update-device-info.vue`

批量更新设备的属性信息（名称、分组、驾驶员、联系电话等）。另有华祥定制版：
`device-update-device-info-custom-for-huaxiang`

#### 4.4 批量修改设备图标 `/#/index/device/deviceBatchIcon`

**组件**：`device-batch-icon/device-batch-icon.vue`

批量修改设备在地图上显示的图标类型。`icon` 关键词在 vendor.js 中出现 323 次，说明图标系统是该平台的重要特性。

#### 4.5 设备批量转移 `/#/index/device/deviceTransform`

**组件**：`device-transform/device-transform`

将设备从一个分组/账户转移到另一个，支持批量选择设备后统一转移。

#### 4.6 批量修改设备时间 `/#/index/device/deviceUpdateTime`

**组件**：
- `device-update-time/device-update-time.vue` — 修改时间
- `device-update-all-time/device-update-all-time.vue` — 修改全部时间

批量调整设备的时间参数（时区、上报间隔等）。

#### 4.7 导入卡号 `/#/index/device/deviceUpdateIccid`

**组件**：`device-update-iccid/device-update-iccid`

批量导入 SIM 卡的 ICCID 号，用于设备 SIM 卡绑定。

#### 4.8 卡号匹配 `/#/index/device/deviceExportIccid`

**组件**：`device-export-iccid/device-export-iccid`

将设备与 SIM 卡 ICCID 进行匹配校验，支持导出匹配结果。

#### 4.9 刷新设备到期时间 `/#/index/device/deviceUpdateExpireType`

**组件**：`device-update-expire-type/device-update-expire-type`

批量更新设备服务到期时间，设备过期后图标变为 `EnumCarState.EXPIRE` 状态。

#### 4.10 华祥管理平台数据导入 `/#/index/device/huaXiangDataImport`

**组件**：`huaXiangDataImport`（独立页面组件）

专门为「华祥」客户设计的数据导入工具，需要权限 `main:devices_huaxiang_import`。华祥客户在系统中使用 `isHuaXiangUsers` 标志进行特殊处理（如设备过滤逻辑）。

#### 4.11 批量修改主机名 `/#/index/device/deviceUpdateHost`

**组件**：`device-update-host/device-update-host.vue`

批量更新设备的通信主机名/IP 地址。`host` 关键词在 vendor.js 中出现 40 次。

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

统计设备的行驶里程数据：
- 按设备/分组/时间段统计总里程
- 使用 `formatTrackMileage()` 格式化显示（<1km 用米，≥1km 用千米）
- 支持日/周/月/自定义时间范围的里程汇总
- 数据来源：`gps_records` 表中相邻点 Haversine 距离累加
- 可视化：ECharts 折线图/柱状图展示里程趋势

#### 5.2 报警统计 `/#/index/count/countAlarms`

**组件**：`count-alarms/count-alarms.vue`

统计设备告警数据：
- 按告警类型分类统计（超速、围栏、SOS、断电、震动）
- 按时间维度聚合（日报/周报/月报）
- ECharts 饼图展示告警类型占比
- ECharts 趋势图展示告警数量变化
- 支持按设备/分组筛选

#### 5.3 停留点详细 `/#/index/count/countStayDetail`

**组件**：`count-stay-detail/count-stay-detail.vue`

分析设备的停留行为：
- 识别速度 < 1km/h 且持续 > 5 分钟的停留段
- 停留点地图标注（经纬度定位）
- 停留时长统计（分钟/小时）
- 停留次数统计（按设备/日期）
- 停留热力图（高频停留区域可视化）

#### 5.4 到期统计 `/#/index/count/countPastDue`

**组件**：`count-past-due/count-past-due`

额外发现的子页面，统计设备服务到期情况：
- 即将到期设备列表
- 已过期设备列表
- 到期时间倒计时
- 批量续费入口跳转

#### 5.5 统计数据导出 `/#/index/count/countExport`

**组件**：`count-export/count-export`

将统计数据导出为文件：
- 支持导出格式：Excel（xlsx 库）
- 导出内容：里程报表、告警报表、停留分析报表
- 时间范围筛选后导出
- 设备/分组维度筛选

**相关 API/Store**（推断）：
```
countExportApi — 统计导出 API 接口
countControl  — 统计控制参数
countSet      — 统计设置配置
countName     — 统计项名称
```

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

**子组件结构**（从源码提取）：
```
index-fence/
├── index-fence-leaflet.vue           # 主页面（Leaflet 地图版）
├── components/
│   ├── map-fence-baidu-v2/index.vue  # 百度地图 v2 围栏组件
│   ├── modal-fence-add/index.vue     # 添加围栏弹窗
│   ├── modal-fence-alloc             # 分配围栏到设备
│   └── circle.png                    # 圆形围栏图标
└── img/
    └── gis-fence@2x.png              # GIS 围栏图标
```

**功能特性**：
- 支持圆形围栏（半径可调）和自定义多边形区域
- 百度地图 v2 + Leaflet 双引擎围栏编辑
- `SET_SUPPORT_FENCE` — 围栏功能开关
- 围栏分配：将围栏绑定到特定设备/分组

### 8. ⚡ 远程指令（`/#/index/directive`、`/#/index/directive/cmdSend`）

**组件**：`index-directive/index-directive.vue`

**子路由**：
```
directive (父路由)
├── cmdSend      指令下发（立即执行）
├── cmdTask      指令定时任务
└── testLogCmdTask  测试日志指令任务
```

**指令下发流程**（从 app.js 提取的实际代码逻辑）：
```
actionSendCommand
  ├── 检查设备状态: DEVICE_STATE_MAP
  │     ├── online  → 发送立即指令
  │     ├── offline → 检查 OFFLINE_DIRECTIVE_MAP
  │     │     ├── 允许离线 → 转存为离线指令（上线后执行）
  │     │     └── 不允许  → 提示无法发送
  │     └── 其他    → 提示设备状态异常
  │
  ├── SWMODE 指令特殊处理
  │     ├── 设备在线  → "设备已在线 无需发送常规模式指令"
  │     └── 设备离线 → SWMODE 1300# 等指令码
  │
  ├── 发送超时处理
  │     └── "发送超时，需否需要转存为离线指令？"
  │
  └── 结果反馈
        └── getDirectiveStatus(content)  // 获取指令执行状态
```

**关键变量**：
- `OFFLINE_DIRECTIVE_MAP` — 支持离线执行的指令列表
- `commandConfig.offlineOrder` — 离线指令配置开关
- `SWMODE` — 模式切换指令（如 0#-工作模式, 1300#-睡眠模式）
- `getDirectiveText()` — 指令文本转换
- `layui.layer.alert()` — layui 弹窗提示

### 9. 🎥 视频直播（`/#/index/videoLive`）

**组件**：`index-video-live/index-video-live.vue`  
**国际化**：`index.videoLive` → "视频直播" / "Live video broadcast"

**实现方式**：
- 使用 hls.js 播放 HLS 视频流
- 设备需具备视频/摄像头功能
- 权限控制："点击发送指令开启视频权限，如果该设备没有视频功能无需操作"
- 视频相关 API：`videoDelete`（删除录像）

### 10. 🛤️ 历史轨迹（`/#/index/track`）

**组件**：`index-track/index-track-v2.vue`（v2 版本）

**核心功能**：
- **轨迹查询**：选择设备和时间范围，从 `gps_records` 表加载历史 GPS 数据
- **轨迹播放**：`commands.trackPlay` — 地图动画回放设备移动路径
- **速度设置**：`track.SpeedSetting` — 可调速播放（1x-10x）
- **轨迹优化**：海量轨迹点时的数据压缩和分段加载
- **超速标注**：`track.speeding` — 轨迹上标记超速段

**运动状态检测**（从 app.js 提取的实际算法）：
```javascript
t.getCarMovingState = function(e) {
    var t = e.stateTime - e.utcTime;  // 计算静止持续时间
    return t < 60000 && e.speed <= 10 || t > 60000
        ? EnumCarState.STOP           // 静止（速度≤10 且<1min 或静止>1min）
        : e.speed > 60
            ? EnumCarState.FAST        // 快速行驶 (>60km/h)
            : e.speed > 120
                ? EnumCarState.OVERSPEED // 超速 (>120km/h)
                : EnumCarState.MOVING     // 正常运动中
}
```

**加载状态提示**：
- "轨迹未加载完全" — loading
- "轨迹已完全加载" — loaded
- "轨迹回放完成" — playback complete
- 数据库升级提示：查询旧数据时弹出提醒

### 11. 💰 支付与订单
- 账户 CRUD：`/pay/account/*`
- 设备续费：`deviceRenew` / `renewPrice`

### 12. 🔄 OTA 远程升级
- `otaList` + `otaHttp` + `otaUpdateListForUser`
- AGPS 星历数据更新

### 13. 🔧 系统配置
- `configPlatformForUser` 平台配置
- `mapKey` / `apiKey` 地图 API Key
- `demoAccountSet` 演示环境设置

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
