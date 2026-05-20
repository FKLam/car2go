export default {
  app: { title: '车在这儿', subtitle: 'GPS车辆追踪平台' },
  menu: { monitor: '监控平台', dashboard: '仪表盘', map: '实时追踪', devices: '设备管理', track: '轨迹回放', geofences: '电子围栏', alerts: '告警中心' },
  common: { save: '保存', cancel: '取消', delete: '删除', edit: '编辑', add: '添加', search: '搜索', export: '导出', confirm: '确认', back: '返回', refresh: '刷新', online: '在线', offline: '离线', total: '总计', action: '操作', status: '状态', name: '名称', type: '类型', time: '时间', speed: '速度', direction: '方向' },
  auth: { login: '登录', register: '注册', username: '用户名', password: '密码', email: '邮箱', phone: '手机号', loginBtn: '登 录', registerBtn: '注 册', noAccount: '没有账号？去注册', hasAccount: '已有账号？去登录' },
  dashboard: { title: '仪表盘', totalDevices: '设备总数', onlineDevices: '在线设备', offlineDevices: '离线设备', geofences: '电子围栏', unreadAlerts: '未读告警', todayRecords: '今日轨迹点', recentAlerts: '最近告警', deviceStatus: '设备状态分布' },
  map: { title: '实时追踪', selectDevice: '选择设备', locateDevice: '定位设备', trackToday: '今日轨迹', speedLabel: '速度', directionLabel: '方向' },
  devices: { title: '设备管理', addDevice: '添加设备', deviceTree: '设备分组', deviceName: '设备名称', imei: 'IMEI', plateNumber: '车牌号', simNumber: 'SIM卡号', model: '设备型号', group: '所属分组', driverName: '驾驶员', driverPhone: '联系电话', lastPosition: '最后位置', lastOnline: '最后上线', emptyGroup: '暂无分组', emptyDevice: '暂无设备' },
  track: { title: '轨迹回放', selectDevice: '选择设备', startTime: '开始时间', endTime: '结束时间', play: '播放', pause: '暂停', stop: '停止', speed: '速度', distance: '里程', stops: '停留点', noData: '暂无轨迹数据' },
  geofences: { title: '电子围栏', addFence: '添加围栏', fenceName: '围栏名称', fenceType: '围栏类型', center: '中心点', radius: '半径(米)', alarmType: '告警类型', bindDevices: '绑定设备', circle: '圆形', polygon: '多边形', inOut: '进出告警', in: '进入告警', out: '离开告警' },
  alerts: { title: '告警中心', markRead: '标记已读', markAllRead: '全部已读', unread: '未读', read: '已读', typeOverspeed: '超速', typeGeofence: '电子围栏', typeSOS: 'SOS求救', typePower: '断电告警', typeVibration: '震动告警', noAlerts: '暂无告警' },
};
