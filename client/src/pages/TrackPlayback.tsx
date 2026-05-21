import { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, List, Select, Space, Switch, Tabs, Tree, Typography, message } from 'antd';
import { CameraOutlined, CarOutlined, EnvironmentOutlined, FilterOutlined, FolderOpenOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UnorderedListOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import dayjs from 'dayjs';
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
      { title: '杭州帅骑科技有限公司 (1/总3)', key: 'agent-1', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: 'wangzhe (0/总0)', key: 'agent-2', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '姬姬 (0/总0)', key: 'agent-3', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '34 (0/总0)', key: 'agent-4', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '测试1234A (0/总0)', key: 'agent-5', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: 'dsfsd (0/总0)', key: 'agent-6', icon: <UsergroupAddOutlined />, isLeaf: true },
      { title: '1234254 (0/总0)', key: 'agent-7', icon: <UsergroupAddOutlined />, isLeaf: true },
    ],
  },
];

const fallbackTrack = [
  [31.2304, 121.4737], [31.2604, 121.3637], [31.3004, 121.2737], [31.3604, 121.1037], [31.4904, 120.9137], [31.5912, 120.3119],
].map(([lat, lng], index) => ({ id: index, lat, lng, speed: index ? 42 : 0, gps_time: `2026-05-20 0${index}:00:00` }));

export default function TrackPlayback() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState('online');
  const [deviceKeyword, setDeviceKeyword] = useState('');
  const [mapSource, setMapSource] = useState('osm');
  const [optimizeTrack, setOptimizeTrack] = useState(true);
  const [startTime, setStartTime] = useState(dayjs('2026-05-20 00:00:00'));
  const [endTime, setEndTime] = useState(dayjs('2026-05-20 23:59:59'));
  const [locationType, setLocationType] = useState('beidou');
  const [speedLimit, setSpeedLimit] = useState('120km');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  useEffect(() => {
    api.get('/devices').then(({ data }) => {
      setDevices(data || []);
      if (data?.[0]) setSelectedDeviceId(data[0].id);
    }).catch(() => setDevices([]));
  }, []);

  const loadTrack = async () => {
    if (!selectedDeviceId) {
      setTrackData(fallbackTrack);
      return;
    }
    try {
      const { data } = await api.get(`/tracks/${selectedDeviceId}`, {
        params: { startTime: startTime.toISOString(), endTime: endTime.toISOString(), limit: 5000 },
      });
      setTrackData(data?.length ? data : fallbackTrack);
    } catch {
      setTrackData(fallbackTrack);
      message.error('加载历史轨迹失败，已显示示例轨迹');
    }
  };

  useEffect(() => { loadTrack(); }, [selectedDeviceId]);

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
      { id: 'mock-device-1', name: '0544202917', status: 'online' },
      { id: 'mock-device-2', name: '鲁HV59E9', status: 'offline' },
      { id: 'mock-device-3', name: '赣AE7E41', status: 'offline' },
    ];
  }, [devices, deviceStatus, deviceKeyword]);

  const positions = trackData.map((item) => [item.lat, item.lng] as [number, number]);
  const center = positions[0] || [31.2304, 121.4737];
  const mapTileUrl = mapSource === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ height: 'calc(100vh - 90px)', position: 'relative', width: '100%', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }} zoomControl={false}>
        <TileLayer attribution="&copy; OSM" url={mapTileUrl} />
        {positions.length > 1 && <Polyline positions={positions} color="#2f6bff" weight={4} opacity={0.78} />}
        {positions[0] && <Marker position={positions[0]} />}
        {positions[positions.length - 1] && <Marker position={positions[positions.length - 1]} />}
      </MapContainer>

      {showCustomerList && <CustomerPanel
          devices={leftDevices}
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          deviceStatus={deviceStatus}
          setDeviceStatus={setDeviceStatus}
          deviceKeyword={deviceKeyword}
          setDeviceKeyword={setDeviceKeyword}
          statusCounts={statusCounts}
        />}

      <Card style={{ position: 'absolute', left: showCustomerList ? 360 : 14, right: 8, top: 34, zIndex: 1000, borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
        <div style={{ height: 42, display: 'flex', alignItems: 'center', padding: '0 14px', color: '#2f7bff', fontWeight: 600 }}>
          0544202917 <span style={{ marginLeft: 8, color: '#8bbcff' }}>×</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.9)', padding: '10px 14px', borderRadius: 8 }}>
          <span>起始日期</span>
          <DatePicker showTime value={startTime} onChange={(value) => value && setStartTime(value)} style={{ width: 190 }} />
          <span>结束日期</span>
          <DatePicker showTime value={endTime} onChange={(value) => value && setEndTime(value)} style={{ width: 190 }} />
          <span>定位类型</span>
          <Select value={locationType} onChange={setLocationType} style={{ width: 100 }} options={[{ value: 'beidou', label: '北斗' }, { value: 'lbs', label: 'LBS' }]} />
          <span>轨迹优化</span>
          <Switch checked={optimizeTrack} onChange={setOptimizeTrack} />
          <span>超速设置</span>
          <Select value={speedLimit} onChange={setSpeedLimit} style={{ width: 100 }} options={[{ value: '120km', label: '120km' }, { value: '100km', label: '100km' }]} />
          <Button type="primary" onClick={loadTrack}>查询</Button>
        </div>
      </Card>

      <Select
        value={mapSource}
        onChange={setMapSource}
        style={{ position: 'absolute', top: 120, right: 82, zIndex: 1000, width: 200 }}
        options={[{ value: 'osm', label: '百度地图' }, { value: 'satellite', label: '卫星地图' }]}
      />
      <div style={{ position: 'absolute', right: 10, top: 185, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button icon={<span>📏</span>} />
        <Button icon={<CameraOutlined />} />
        <Button icon={<span style={{ fontSize: 18 }}>○</span>} />
        <Button icon={<span style={{ fontSize: 18 }}>◉</span>} />
      </div>
      <div style={{ position: 'absolute', bottom: 62, right: 28, zIndex: 1000, width: 88, height: 88, borderRadius: 18, background: 'rgba(255,255,255,.92)', boxShadow: '0 8px 24px rgba(15,23,42,.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#66c83d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}><CarOutlined /></div>
        <Text>运行状态</Text>
      </div>
    </div>
  );
}

function CustomerPanel({ devices, selectedDeviceId, setSelectedDeviceId, deviceStatus, setDeviceStatus, deviceKeyword, setDeviceKeyword, statusCounts }: any) {
  return (
    <Card
      size="small"
      title={<Space size={6}><UsergroupAddOutlined />客户列表</Space>}
      extra={<Space size={10}><PlusOutlined style={{ color: '#3478f6' }} /><UnorderedListOutlined style={{ color: '#3478f6' }} /></Space>}
      style={{ position: 'absolute', top: 14, left: 14, bottom: 14, width: 330, zIndex: 1001, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(2px)' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 38px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid rgba(226,232,240,.9)', maxHeight: 390, overflow: 'auto' }}>
        <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="代理商搜索" allowClear style={{ marginBottom: 10, borderRadius: 18 }} />
        <DirectoryTree defaultExpandAll selectedKeys={['agent-0']} treeData={agentTree} style={{ fontSize: 12, background: 'transparent' }} />
      </div>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(226,232,240,.9)' }}>
        <Space.Compact style={{ width: '100%' }}>
          <ReloadOutlined style={{ width: 28, lineHeight: '32px', textAlign: 'center' }} />
          <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="搜索设备" value={deviceKeyword} onChange={(event) => setDeviceKeyword(event.target.value)} allowClear />
        </Space.Compact>
        <Tabs activeKey={deviceStatus} onChange={setDeviceStatus} size="small" style={{ marginTop: 4 }} items={[
          { key: 'all', label: `全部 ${statusCounts.all || 12}` },
          { key: 'online', label: `在线 ${statusCounts.online || 3}` },
          { key: 'offline', label: `离线 ${statusCounts.offline || 9}` },
          { key: 'inactive', label: `未激活 ${statusCounts.inactive}` },
        ]} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 12px' }}>
        <List size="small" dataSource={devices} renderItem={(device: any, index) => (
          <List.Item onClick={() => setSelectedDeviceId(device.id)} style={{ cursor: 'pointer', padding: '7px 8px', borderRadius: 18, marginTop: 7, background: selectedDeviceId === device.id || index === 0 ? '#dbeafe' : 'transparent' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size={6}><CarOutlined style={{ color: '#3478f6' }} /><Text style={{ color: selectedDeviceId === device.id || index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id}</Text></Space>
              <Space size={6}><Text type="secondary" style={{ fontSize: 12 }}>{device.status === 'online' ? '行驶中' : index === 1 ? '静止2小时7分钟' : '静止7小时11分钟'}</Text><span style={{ width: 6, height: 6, borderRadius: 6, background: device.status === 'online' ? '#52c41a' : '#3478f6', display: 'inline-block' }} /></Space>
            </Space>
          </List.Item>
        )} />
      </div>
    </Card>
  );
}
