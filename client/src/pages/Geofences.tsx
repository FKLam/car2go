import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Dropdown, Empty, Input, List, Radio, Select, Space, Table, Tabs, Tag, Tree, Typography, message } from 'antd';
import {
  AimOutlined,
  AppstoreOutlined,
  CarOutlined,
  DownOutlined,
  EditOutlined,
  EllipsisOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import { useUiStore } from '../store/ui';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const { Text } = Typography;
const { DirectoryTree } = Tree;

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

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

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function formatFenceName(fence: any, index: number) {
  return fence.name || ['ঝালের এনফিল্ড', 'V3', 'Shebo Shaha', 'test', 'home', 'Việt Nam'][index % 6];
}

export default function Geofences() {
  const [fences, setFences] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agent-fence');
  const [selectedFence, setSelectedFence] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9042, 116.4074]);
  const [mapStyle, setMapStyle] = useState('baidu');
  const [deviceStatus, setDeviceStatus] = useState('all');
  const [deviceKeyword, setDeviceKeyword] = useState('');
  const [addressKeyword, setAddressKeyword] = useState('');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([api.get('/geofences'), api.get('/devices')]);
      const fenceList = fRes.data || [];
      setFences(fenceList);
      setDevices(dRes.data || []);
      if (!selectedFence && fenceList.length > 0) {
        setSelectedFence(fenceList[0]);
        setMapCenter([fenceList[0].center_lat, fenceList[0].center_lng]);
      }
    } catch {
      message.error('加载电子围栏数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const statusCounts = useMemo(() => {
    const online = devices.filter((item) => item.status === 'online').length;
    const offline = devices.length - online;
    return { all: devices.length, online, offline, inactive: 0 };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    let list = devices;
    if (deviceStatus === 'online') list = list.filter((item) => item.status === 'online');
    if (deviceStatus === 'offline') list = list.filter((item) => item.status !== 'online');
    if (deviceStatus === 'inactive') list = [];
    if (deviceKeyword) {
      list = list.filter((item) => item.name?.includes(deviceKeyword) || item.imei?.includes(deviceKeyword) || item.plate_number?.includes(deviceKeyword));
    }
    return list;
  }, [devices, deviceStatus, deviceKeyword]);

  const handleSelectFence = (fence: any) => {
    setSelectedFence(fence);
    if (fence.center_lat && fence.center_lng) setMapCenter([fence.center_lat, fence.center_lng]);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/geofences/${id}`);
      message.success('已删除');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const fenceMenu = (fence: any) => [
    { key: 'view', label: '查看' },
    { key: 'alloc', label: '分配围栏给设备' },
    { key: 'devices', label: '关联的设备' },
    { key: 'edit', label: '编辑' },
    { type: 'divider' as const },
    { key: 'delete', label: '删除', danger: true, onClick: () => handleDelete(fence.id) },
  ];

  const mapUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'grid', gridTemplateColumns: showCustomerList ? '330px 340px minmax(480px, 1fr)' : '340px minmax(480px, 1fr)', gap: 12 }}>
      {showCustomerList && <Card
        size="small"
        title={<Space size={6}><UsergroupAddOutlined />客户列表</Space>}
        extra={<Space size={8}><PlusOutlined style={{ color: '#3478f6' }} /><MenuOutlined style={{ color: '#3478f6' }} /></Space>}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        bodyStyle={{ padding: 0, height: 'calc(100% - 38px)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid #f0f2f5', maxHeight: 390, overflow: 'auto' }}>
          <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="代理商搜索" allowClear style={{ marginBottom: 10, borderRadius: 18 }} />
          <DirectoryTree defaultExpandAll treeData={agentTree} selectedKeys={['agent-0']} style={{ fontSize: 12, background: 'transparent' }} />
        </div>

        <div style={{ padding: 12, borderBottom: '1px solid #f0f2f5' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Button icon={<ReloadOutlined />} />
            <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="搜索设备" value={deviceKeyword} onChange={(e) => setDeviceKeyword(e.target.value)} allowClear />
          </Space.Compact>
          <Tabs
            activeKey={deviceStatus}
            onChange={setDeviceStatus}
            size="small"
            style={{ marginTop: 4 }}
            items={[
              { key: 'all', label: `全部 ${statusCounts.all}` },
              { key: 'online', label: `在线 ${statusCounts.online}` },
              { key: 'offline', label: `离线 ${statusCounts.offline}` },
              { key: 'inactive', label: `未激活 ${statusCounts.inactive}` },
            ]}
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 12px' }}>
          <List
            size="small"
            dataSource={filteredDevices}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无设备" /> }}
            renderItem={(device, index) => (
              <List.Item style={{ padding: '7px 8px', borderRadius: 18, marginTop: 7, background: index === 0 ? '#dbeafe' : 'transparent', cursor: 'pointer' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <CarOutlined style={{ color: '#3478f6' }} />
                    <Text style={{ color: index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id}</Text>
                  </Space>
                  <Space size={6}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{device.status === 'online' ? '在线' : '静止2分钟'}</Text>
                    <span style={{ width: 6, height: 6, borderRadius: 6, background: '#3478f6', display: 'inline-block' }} />
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Card>}

      <Card
        size="small"
        style={{ borderRadius: 12, overflow: 'hidden' }}
        bodyStyle={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="small"
          items={[{ key: 'agent-fence', label: '代理商的围栏' }, { key: 'device-fence', label: '设备的围栏' }]}
        />
        <Text strong style={{ textAlign: 'center', marginBottom: 14 }}>代理商体验账号的围栏</Text>
        <Button type="primary" icon={<PlusOutlined />} style={{ width: 96, marginBottom: 10 }}>创建新围栏</Button>
        <Table
          size="small"
          dataSource={fences}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, size: 'small', showSizeChanger: true, pageSizeOptions: [15, 30, 50], total: fences.length, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ y: 'calc(100vh - 330px)' }}
          onRow={(record) => ({
            onClick: () => handleSelectFence(record),
            style: { cursor: 'pointer', background: selectedFence?.id === record.id ? '#f0f7ff' : undefined },
          })}
          columns={[
            { title: '围栏名称', dataIndex: 'name', align: 'center' as const, render: (_: string, record: any, index: number) => formatFenceName(record, index) },
            {
              title: '操作', align: 'center' as const, width: 120, render: (_: unknown, record: any) => (
                <Dropdown menu={{ items: fenceMenu(record) }} trigger={['click']}>
                  <Button size="small" type="link" onClick={(event) => event.stopPropagation()}>查看&nbsp; 更多&gt;&gt;</Button>
                </Dropdown>
              ),
            },
          ]}
        />
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <Card size="small" bodyStyle={{ padding: '10px 12px' }} style={{ borderRadius: 10 }}>
          <Button type="primary" size="small">返回旧版</Button>
        </Card>
        <div style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#f7f4ef', boxShadow: '0 1px 4px rgba(15,23,42,0.08)' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: 10 }}>
            <Select size="large" value="keyword" style={{ width: 98 }} suffixIcon={<DownOutlined />} options={[{ value: 'keyword', label: '关键字' }]} />
            <Input.Search size="large" placeholder="请输入需要查询的地址" value={addressKeyword} onChange={(e) => setAddressKeyword(e.target.value)} style={{ width: 240 }} />
          </div>
          <div style={{ position: 'absolute', top: 10, right: 82, zIndex: 1000 }}>
            <Select
              size="large"
              value={mapStyle}
              onChange={setMapStyle}
              style={{ width: 190 }}
              options={[{ value: 'baidu', label: '百度地图' }, { value: 'satellite', label: '卫星地图' }]}
            />
          </div>

          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer attribution="&copy; OpenStreetMap" url={mapUrl} />
            <ChangeView center={mapCenter} />
            <MapClickHandler onMapClick={(lat, lng) => setMapCenter([lat, lng])} />
            {fences.filter((fence) => fence.type === 'circle').map((fence) => (
              <Circle
                key={fence.id}
                center={[fence.center_lat, fence.center_lng]}
                radius={Number(fence.radius) || 500}
                pathOptions={{ color: selectedFence?.id === fence.id ? '#ff626d' : '#ff8a8a', fillColor: '#f87171', fillOpacity: selectedFence?.id === fence.id ? 0.42 : 0.24, weight: selectedFence?.id === fence.id ? 3 : 2 }}
                eventHandlers={{ click: () => handleSelectFence(fence) }}
              />
            ))}
            {fences.map((fence, index) => (
              <Marker key={`m-${fence.id}`} position={[fence.center_lat, fence.center_lng]} eventHandlers={{ click: () => handleSelectFence(fence) }}>
                <Popup>{formatFenceName(fence, index)}</Popup>
              </Marker>
            ))}
          </MapContainer>

          {selectedFence && (
            <div style={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)', zIndex: 800, background: '#fff', padding: '5px 10px', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: 12 }}>
              {formatFenceName(selectedFence, fences.findIndex((item) => item.id === selectedFence.id))}
            </div>
          )}

          <div style={{ position: 'absolute', right: 12, top: 72, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button icon={<AimOutlined />} title="测距" />
            <Space direction="vertical" size={0} style={{ background: '#fff', boxShadow: '0 1px 5px rgba(0,0,0,0.16)' }}>
              <Button icon={<AppstoreOutlined />} title="多边形" />
              <Button icon={<EnvironmentOutlined />} title="圆形" />
            </Space>
            <Button icon={<EditOutlined />} title="编辑围栏" />
          </div>
        </div>
      </div>
    </div>
  );
}
