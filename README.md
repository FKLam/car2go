# 🚗 车在这儿 — CarHere GPS 车辆追踪平台

> 一个基于 Web 的实时 GPS 车辆追踪与管理平台，支持多设备实时位置监控、历史轨迹回放、电子围栏告警等功能。

**在线地址**: [http://new.carhere.net](http://new.carhere.net)  
**演示账号**: `admin` / `admin123`

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Ant Design | 5.x | UI 组件库 |
| React Router | 6.x | 客户端路由 |
| Leaflet + react-leaflet | 1.9 / 4.x | 开源地图渲染 |
| Socket.io-client | 4.x | WebSocket 实时通信 |
| Zustand | 5.x | 轻量状态管理 |
| i18next | 24.x | 国际化（中文 / English） |
| Axios | 1.x | HTTP 请求 |
| Recharts | 2.x | 图表可视化 |
| Day.js | 1.x | 时间处理 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.x | HTTP 服务框架 |
| TypeScript | 5.x | 类型安全 |
| better-sqlite3 | 11.x | SQLite 数据库（同步 API） |
| Socket.io | 4.x | WebSocket 实时推送 |
| jsonwebtoken | 9.x | JWT 认证 |
| bcryptjs | 2.x | 密码哈希 |
| uuid | 10.x | 唯一 ID 生成 |
| tsx | 4.x | 开发热重载 |

### 部署 & 外部服务
| 服务 | 说明 |
|------|------|
| Nginx 1.10 | 反向代理 + 静态资源服务 |
| SQLite (WAL 模式) | 嵌入式数据库，零配置零运维 |
| OpenStreetMap | 免费开源地图瓦片 |
| JWT | 无状态认证，7 天有效期 |

---

## 项目结构

```
wflCarHere/
├── client/                          # 前端 (React + Vite)
│   ├── src/
│   │   ├── main.tsx                 # 入口文件
│   │   ├── App.tsx                  # 路由配置（含登录保护 ProtectedRoute）
│   │   ├── api/
│   │   │   └── index.ts             # Axios 实例 + 拦截器（自动携带 Token、401 自动跳转登录）
│   │   ├── components/
│   │   │   └── Layout.tsx           # 主布局（可折叠侧边栏 + 顶栏用户菜单 + 内容区 Outlet）
│   │   ├── pages/
│   │   │   ├── Login.tsx            # 登录/注册页（含中英语言切换按钮）
│   │   │   ├── Dashboard.tsx        # 仪表盘（6 项统计卡片 + 最近告警表 + 设备状态分布）
│   │   │   ├── MapTracking.tsx      # 实时地图追踪（WebSocket 实时位置 + 今日轨迹线）
│   │   │   ├── Devices.tsx          # 设备管理（CRUD 弹窗 + 分组树 + 表格搜索）
│   │   │   ├── TrackPlayback.tsx    # 轨迹回放（时间范围查询 + 动画播放 + 里程/速度统计）
│   │   │   ├── Geofences.tsx        # 电子围栏（地图点击选中心点 + 圆形围栏 + 设备多选绑定）
│   │   │   └── Alerts.tsx           # 告警中心（类型/状态筛选 + 标记已读 + 统计卡片）
│   │   ├── store/
│   │   │   └── auth.ts              # Zustand 认证状态（token / user / setAuth / logout）
│   │   ├── i18n/
│   │   │   ├── index.ts             # i18next 初始化（中/英双语）
│   │   │   ├── zh.ts                # 中文语言包（~70 条翻译）
│   │   │   └── en.ts                # 英文语言包
│   │   └── styles/
│   │       └── global.css           # 全局样式（登录背景、地图面板等）
│   ├── index.html                   # SPA 入口 HTML
│   ├── vite.config.ts               # Vite 配置（开发代理 /api → localhost:3001）
│   └── tsconfig.json
│
├── server/                          # 后端 (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts                 # 服务入口（Express 实例 + HTTP Server + WebSocket 挂载）
│   │   ├── database.ts             # SQLite 初始化（WAL 模式）+ 6 张数据表建表 + 默认管理员
│   │   ├── seed.ts                  # 种子数据脚本（8 台设备 + ~2888 条 GPS + 围栏 + 告警）
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT 认证中间件（authMiddleware / adminMiddleware）
│   │   ├── routes/
│   │   │   ├── auth.ts              # 登录 / 注册 / 获取当前用户
│   │   │   ├── devices.ts           # 设备 CRUD + 分组树查询 API
│   │   │   ├── gps.ts               # GPS 位置上报（单条/批量）+ 实时围栏检测 + 超速检测
│   │   │   ├── tracks.ts            # 历史轨迹查询 / 日里程汇总 / 停留点检测
│   │   │   ├── geofences.ts         # 围栏 CRUD + 设备绑定/解绑
│   │   │   ├── alerts.ts            # 告警列表 / 标记已读 / 全部已读 / 未读统计
│   │   │   └── dashboard.ts         # 仪表盘聚合（设备数/在线数/告警数/今日轨迹点）
│   │   └── websocket/
│   │       └── index.ts             # Socket.io 服务（JWT 握手鉴权 + 房间订阅 + 位置/告警/状态广播）
│   ├── data/
│   │   └── carhere.db               # SQLite 数据库文件（运行时生成，已加入 .gitignore）
│   └── tsconfig.json
│
├── package.json                     # 根 workspace（concurrently 并行启动前后端）
└── .gitignore                       # 排除 node_modules / dist / .db / .deepseek
```

---

## 功能详解

### 1. 🔐 用户认证
- **登录/注册**：用户名 + 密码，注册时自动创建默认设备分组「全部设备」
- **JWT 无状态认证**：Token 有效期 7 天，前端 Axios 拦截器自动附带 `Authorization: Bearer <token>`
- **路由保护**：`ProtectedRoute` 组件检测 Zustand 中的 Token，未登录自动跳转 `/login`
- **权限分级**：admin / user 两种角色，管理员中间件可拓展后台功能
- **密码安全**：bcryptjs 10 轮盐值哈希

### 2. 📊 仪表盘
- **6 项统计指标**：设备总数、在线设备、离线设备、电子围栏数、未读告警、今日 GPS 轨迹点
- **最近告警列表**：小表格展示最新告警的类型标签、设备名、时间、状态
- **设备状态分布**：在线/离线的数量占比列表
- **数据来源**：`GET /api/dashboard` 一次性返回所有聚合数据

### 3. 🗺️ 实时地图追踪
- **地图底座**：Leaflet + OpenStreetMap 免费瓦片，全球可用
- **设备标注**：🚗 Emoji 图标标注所有设备最后位置，点击弹出设备详情弹窗
- **实时位置推送**：
  - 前端通过 Socket.io 连接 WebSocket
  - 选择设备时发送 `subscribe:device` 事件加入对应房间
  - 服务端收到 GPS 上报后，通过 `io.to('device:<id>').emit('device:position', ...)` 推送
  - 前端收到推送后更新 Zustand 状态，React 自动重渲染 Marker
- **今日轨迹**：API 查询当天轨迹数据，使用 Leaflet `Polyline` 在地图上叠加蓝色轨迹线
- **设备搜索**：Ant Design Select 组件支持按名称关键字过滤

### 4. 📱 设备管理
- **树形分组**：`device_groups` 表通过 `parent_id` 自引用实现无限层级分组
- **设备 CRUD**：IMEI（唯一）、车牌号、SIM 卡号、型号、驾驶员、联系电话
- **状态标识**：在线（绿色 Tag）/ 离线（灰色 Tag），由 GPS 上报自动更新
- **分组统计**：每个分组节点显示设备数量

### 5. ⏮️ 轨迹回放
- **时间范围查询**：Ant Design `RangePicker` 选择起止时间，最多返回 5000 条 GPS 记录
- **动画播放**：`setInterval(200ms)` 驱动，步进速度 1x-10x 通过 Slider 调节
- **实时 Marker 移动**：根据播放进度计算当前经纬度，在地图上渲染移动标记
- **轨迹统计**：
  - 距离：逐点 Haversine 球面距离累加
  - 最高速度：遍历所有轨迹点取最大值
  - GPS 点数：数据量统计
- **停留点检测**：后端算法识别连续 5 分钟速度 < 1km/h 的静止段

### 6. 🔵 电子围栏
- **围栏创建**：Modal 内嵌 Leaflet 小地图，点击设定中心点，拖动或输入半径（50m - 50km）
- **围栏类型**：圆形（`circle`），扩展预留多边形
- **告警规则**：进入告警 / 离开告警 / 进出告警三种模式
- **设备绑定**：一个围栏通过 `geofence_devices` 关联表绑定多台设备
- **实时触发**：每次 GPS 上报时自动调用 `checkGeofences()` —— 查询绑定围栏 → Haversine 距离计算 → 判断是否触发告警 → 写入 alerts 表

### 7. 🔔 告警中心
- **告警类型**：超速（>120km/h）、围栏进入/离开、SOS 求救、断电、震动
- **严重程度**：info（蓝）/ warning（橙）/ error（红）
- **筛选过滤**：按类型下拉框 + 状态（未读/已读）组合筛选
- **批量操作**：单条标记已读 `PUT /alerts/:id/read`，全部已读 `PUT /alerts/read-all`
- **统计卡片**：总计、未读数、已读数

---

## 技术难点

### 1. WebSocket 实时通信架构
- Socket.io 连接握手阶段通过 `auth.token` 进行 JWT 验证（`io.use()` 中间件）
- 使用 **房间 (Room)** 实现精准推送：客户端订阅 `device:<id>`，仅接收该设备的位置更新
- 广播函数封装 3 类事件：`device:position`（位置）、`alert:new`（告警）、`device:status`（状态变更）
- 前端通过 `useEffect` 管理订阅/取消订阅生命周期，避免内存泄漏

### 2. GPS 大数据存储与查询优化
- `gps_records` 表建立复合索引 `(device_id, gps_time)` 加速轨迹查询
- 设备表缓存 `last_lat/last_lng` 冗余字段，避免每次获取最新位置需全表扫描
- 批量上报使用 SQLite 事务 (`db.transaction()`) 保证原子性和写入性能
- 轨迹查询限制 `LIMIT 10000` 防止前端内存溢出

### 3. 电子围栏实时检测算法
```
GPS 上报 → checkGeofences(deviceId, lat, lng, userId)
  ├── 查询 geofence_devices 关联表 → 获取所有活跃围栏
  ├── Haversine 球面距离公式: d = 2R × atan2(√a, √(1-a))
  │     a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
  ├── 判断: distance ≤ radius ? inside : outside
  └── alarm_type 匹配 → 触发告警写入 alerts 表
```
同时检测超速告警：`last_speed > 120 km/h`。

### 4. 轨迹回放动画引擎
- **时间驱动**：`setInterval(200ms)` 为播放帧率，`speed` 倍数控制每帧跳过的数据点数
- **状态管理**：playing（播放中）、progress（0-100% 进度）、currentPos（地图 Marker 位置）
- **地图联动**：Polyline 静态渲染完整轨迹，Marker 动态跟随播放进度移动
- **组件卸载清理**：`useEffect` 返回清理函数清除 `setInterval`

### 5. 数据仿真模拟 (seed.ts)
- 8 台设备分布在北京/上海/广州三个城市
- **随机漫步**：每个 GPS 点基于前一个点 ±0.001° 经纬度偏移模拟真实移动
- 每设备生成 361 个轨迹点（12 小时、每 2 分钟一个点），共约 2888 条数据
- 同时预创建分层分组、围栏、告警数据，`npm run seed` 即可获得完整演示环境

### 6. 前后端分离 + Nginx 生产部署
- **开发模式**：Vite `proxy` 配置将 `/api` 请求代理到 `localhost:3001`
- **生产模式**：Nginx 作为反向代理 — 静态文件直接返回 `client/dist/`，API 和 WebSocket 透传至 Node
- **SPA 路由处理**：Nginx `try_files $uri /index.html` 确保前端路由（如 `/dashboard`）不被 404

---

## 数据库 ER 关系

```
users (1) ──< devices (N)          用户拥有多台设备
users (1) ──< device_groups (N)    用户拥有多个分组
users (1) ──< geofences (N)        用户拥有多个围栏
users (1) ──< alerts (N)           用户拥有多条告警

device_groups (1) ──< device_groups (N)  分组自引用（树形）
device_groups (1) ──< devices (N)        分组包含设备

devices (1) ──< gps_records (N)         设备产生多条轨迹
devices (N) ──< geofences (N)           设备与围栏多对多（通过 geofence_devices）
devices (1) ──< alerts (N)              设备触发多条告警
```

---

## API 接口一览

### 认证 `/api/auth`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/login` | 用户登录 | 否 |
| POST | `/register` | 用户注册 | 否 |
| GET | `/me` | 获取当前用户信息 | 是 |

### GPS `/api/gps`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/report` | 单设备位置上报 | 是 |
| POST | `/batch` | 批量位置上报（事务） | 是 |
| GET | `/latest/:deviceId` | 查询设备最新位置 | 是 |
| GET | `/latest-all` | 查询所有设备最新位置 | 是 |

### 轨迹 `/api/tracks`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/:deviceId` | 查询轨迹（支持时间范围） | 是 |
| GET | `/:deviceId/summary` | 日里程汇总 | 是 |
| GET | `/:deviceId/stops` | 停留点检测 | 是 |

### 其他
| 路径前缀 | 方法 | 说明 |
|----------|------|------|
| `/api/devices` | GET/POST/PUT/DELETE | 设备 CRUD + 分组树 |
| `/api/geofences` | GET/POST/PUT/DELETE | 围栏 CRUD + 设备绑定 |
| `/api/alerts` | GET/PUT | 告警查询 + 标记已读 |
| `/api/dashboard` | GET | 仪表盘聚合数据 |
| `/api/health` | GET | 健康检查 |

---

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/FKLam/car2go.git
cd car2go

# 2. 安装依赖
npm install              # 根目录安装 concurrently
npm run install:all      # 安装 client 和 server 的依赖

# 3. 生成种子数据（可选，含 8 台设备 + GPS 轨迹 + 围栏 + 告警）
cd server && npm run seed && cd ..

# 4. 启动开发环境（前后端并行）
npm run dev
# 前端 → http://localhost:5173
# 后端 → http://localhost:3001

# 5. 登录
# 演示账号: admin / admin123
```

### 生产部署
```bash
# 构建前端
cd client && npm run build    # 输出到 client/dist/

# 启动后端
cd server && npm run build && npm start

# Nginx 关键配置
# location / { root /path/to/client/dist; try_files $uri /index.html; }
# location /api/ { proxy_pass http://127.0.0.1:3001; }
# location /socket.io/ { proxy_pass http://127.0.0.1:3001; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; }
```

---

## 许可证

MIT
