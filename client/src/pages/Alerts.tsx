import { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, List, Select, Space, Table, Tabs, Tree, Typography, message } from 'antd';
import { CarOutlined, DownloadOutlined, EnvironmentOutlined, FilterOutlined, FolderOpenOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UnorderedListOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import api from '../api';
import { useUiStore } from '../store/ui';

const { Text } = Typography;
const { DirectoryTree } = Tree;

const agentTree = [
  {
    title: '体验账号 (6/总9)',
    key: 'agent-0',
    icon: <FolderOpenOutlined />,
    children: [
      { title: '吴飞龙1 (1/总3)', key: 'agent-1', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙2 (0/总0)', key: 'agent-2', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙3 (0/总0)', key: 'agent-3', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙4 (0/总0)', key: 'agent-4', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙5 (0/总0)', key: 'agent-5', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙6 (0/总0)', key: 'agent-6', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '吴飞龙7 (0/总0)', key: 'agent-7', icon: <UsergroupAddOutlined />, isLeaf: true },
    ],
  },
];

const fallbackAlerts = Array.from({ length: 15 }).map((_, index) => ({
  id: `mock-alert-${index}`,
  imei: '862371741097523',
  plate_number: '0544202917',
  type: index === 4 ? 'move' : 'vibration',
  location_type: '北斗',
  device_type: '4G17',
  created_at: `2026-05-21 22:${String(41 - index).padStart(2, '0')}:${index % 2 ? '17' : '21'}`,
  address: '查看',
  status: 'unread',
}));

const alarmTypeLabels: Record<string, string> = {
  overspeed: '超速报警', geofence_out: '围栏报警', geofence_in: '围栏报警', sos: 'SOS报警', power_off: '断电报警', vibration: '震动报警',
  battery: '电池报警', cut: '切断报警', blind: '盲区报警', remove: '拆除报警', move: '位移报警', normal: '正常报警', poweron: '开机报警', offline: '离线报警',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread');
  const [dateRange, setDateRange] = useState('today');
  const [typeFilter, setTypeFilter] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('online');
  const [deviceKeyword, setDeviceKeyword] = useState('');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 500 };
      if (activeTab === 'unread') params.status = 'unread';
      if (activeTab === 'read') params.status = 'read';
      if (typeFilter) params.type = typeFilter;
      const [alertRes, deviceRes] = await Promise.all([api.get('/alerts', { params }), api.get('/devices')]);
      const alertList = alertRes.data || [];
      setAlerts(alertList.length ? alertList : fallbackAlerts);
      setDevices(deviceRes.data || []);
    } catch {
      setAlerts(fallbackAlerts);
      message.error('加载报警列表失败，已显示示例数据');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeTab, typeFilter]);

  const markRead = async (id: string) => {
    if (id.startsWith('mock-')) return;
    try {
      await api.put(`/alerts/${id}/read`);
      message.success('已标记已读');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  const statusCounts = useMemo(() => {
    const online = devices.filter((item) => item.status === 'online').length;
    const offline = devices.length - online;
    return { all: devices.length, online, offline, inactive: 0 };
  }, [devices]);

  const leftDevices = useMemo(() => {
    let list = devices;
    if (deviceStatus === 'online') list = list.filter((item) => item.status === 'online');
    if (deviceStatus === 'offline') list = list.filter((item) => item.status !== 'online');
    if (deviceStatus === 'inactive') list = [];
    if (deviceKeyword) list = list.filter((item) => item.name?.includes(deviceKeyword) || item.imei?.includes(deviceKeyword) || item.plate_number?.includes(deviceKeyword));
    return list.length ? list : [
      { id: 'left-1', name: '0544202917', status: 'online' },
      { id: 'left-2', name: '鲁HV59E9', status: 'offline' },
      { id: 'left-3', name: '赣AE7E41', status: 'offline' },
    ];
  }, [devices, deviceStatus, deviceKeyword]);

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'grid', gridTemplateColumns: showCustomerList ? '330px minmax(820px, 1fr)' : 'minmax(820px, 1fr)', gap: 12 }}>
      {showCustomerList && <Card
        size="small"
        title={<Space size={6}><UsergroupAddOutlined />客户列表</Space>}
        extra={<Space size={10}><PlusOutlined style={{ color: '#3478f6' }} /><UnorderedListOutlined style={{ color: '#3478f6' }} /></Space>}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        bodyStyle={{ padding: 0, height: 'calc(100% - 38px)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid #f0f2f5', maxHeight: 390, overflow: 'auto' }}>
          <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="代理商搜索" allowClear style={{ marginBottom: 10, borderRadius: 18 }} />
          <DirectoryTree defaultExpandAll treeData={agentTree} selectedKeys={['agent-0']} style={{ fontSize: 12, background: 'transparent' }} />
        </div>

        <div style={{ padding: 12, borderBottom: '1px solid #f0f2f5' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Button icon={<ReloadOutlined />} onClick={loadData} />
            <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="搜索设备" value={deviceKeyword} onChange={(event) => setDeviceKeyword(event.target.value)} allowClear />
          </Space.Compact>
          <Tabs
            activeKey={deviceStatus}
            onChange={setDeviceStatus}
            size="small"
            style={{ marginTop: 4 }}
            items={[
              { key: 'all', label: `全部 ${statusCounts.all || 12}` },
              { key: 'online', label: `在线 ${statusCounts.online || 3}` },
              { key: 'offline', label: `离线 ${statusCounts.offline || 9}` },
              { key: 'inactive', label: `未激活 ${statusCounts.inactive}` },
            ]}
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 12px' }}>
          <List
            size="small"
            dataSource={leftDevices}
            renderItem={(device, index) => (
              <List.Item style={{ padding: '7px 8px', borderRadius: 18, marginTop: 7, background: index === 0 ? '#dbeafe' : 'transparent' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <CarOutlined style={{ color: '#3478f6' }} />
                    <Text style={{ color: index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id}</Text>
                  </Space>
                  <Space size={6}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{device.status === 'online' ? '行驶中' : index === 1 ? '静止2小时7分钟' : '静止7小时11分钟'}</Text>
                    <span style={{ width: 6, height: 6, borderRadius: 6, background: device.status === 'online' ? '#52c41a' : '#3478f6', display: 'inline-block' }} />
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Card>}

      <Card style={{ borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ height: '100%', padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Space size={20} wrap style={{ marginBottom: 8 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[{ key: 'unread', label: '未读信息' }, { key: 'read', label: '已读信息' }]}
          />
          <DatePicker.RangePicker disabled={dateRange !== 'custom'} placeholder={['今天', '']} style={{ width: 120 }} picker="date" />
          <Select value={dateRange} onChange={setDateRange} style={{ width: 120 }} options={[{ value: 'today', label: '今天' }, { value: 'yesterday', label: '昨天' }, { value: 'custom', label: '自定义' }]} />
          <Select value={typeFilter || 'all'} onChange={(value) => setTypeFilter(value === 'all' ? '' : value)} style={{ width: 120 }} options={[{ value: 'all', label: '全部' }, ...Object.entries(alarmTypeLabels).map(([value, label]) => ({ value, label }))]} />
          <Button type="primary" onClick={loadData}>查询</Button>
        </Space>
        <Button icon={<DownloadOutlined />} style={{ width: 98, marginBottom: 10 }}>导出表格</Button>
        <Table
          size="small"
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1280, y: 'calc(100vh - 360px)' }}
          columns={[
            { title: 'IMEI号', dataIndex: 'imei', width: 190, align: 'center' as const, render: (value: string, record: any) => value || record.device_imei || '862371741097523' },
            { title: '车牌号', dataIndex: 'plate_number', width: 120, align: 'center' as const, render: (value: string, record: any) => value || record.device_name || '0544202917' },
            { title: '报警类型', dataIndex: 'type', width: 110, align: 'center' as const, render: (value: string) => alarmTypeLabels[value] || value || '震动报警' },
            { title: '定位类型', dataIndex: 'location_type', width: 110, align: 'center' as const, render: (value: string) => value || '北斗' },
            { title: '设备类型', dataIndex: 'device_type', width: 110, align: 'center' as const, render: (value: string) => value || '4G17' },
            { title: '报警时间', dataIndex: 'created_at', width: 190, align: 'center' as const, render: (value: string) => formatTime(value) },
            { title: '报警位置', dataIndex: 'address', width: 240, align: 'center' as const, render: (value: string) => value || '查看' },
            {
              title: '操作', key: 'action', width: 240, fixed: 'right' as const, align: 'center' as const, render: (_: unknown, record: any) => (
                <Space size={10}>
                  <Button size="small" onClick={() => markRead(record.id)}>标记已读</Button>
                  <Button size="small" icon={<EnvironmentOutlined />}>报警位置</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

function formatTime(value: string) {
  if (!value) return '2026-05-21 22:41:21';
  if (value.includes('T')) return value.replace('T', ' ').slice(0, 19);
  return value.slice(0, 19);
}
