import { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Card, Tabs, Input, Tree, Select, Radio, Dropdown } from 'antd';
import { PlusOutlined, SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import api from '../api';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
  ]},
];

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function Geofences() {
  const { t } = useTranslation();
  const [fences, setFences] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agent-fence');
  const [selectedFence, setSelectedFence] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9042, 116.4074]);
  const [mapMode, setMapMode] = useState('default');
  const [mapStyle, setMapStyle] = useState('osm');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([api.get('/geofences'), api.get('/devices')]);
      setFences(fRes.data || []);
      setDevices(dRes.data || []);
    } catch { /* dev mode */ }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const handleSelect = (f: any) => { setSelectedFence(f); setMapCenter([f.center_lat, f.center_lng]); };
  const handleDelete = async (id: string) => { try { await api.delete(`/geofences/${id}`); message.success('已删除'); loadData(); } catch {} };

  const fenceMenu = (f: any) => [
    { key: 'alloc', label: '分配围栏给设备' }, { key: 'devices', label: '关联的设备' },
    { key: 'edit', label: '编辑' }, { key: 'detail', label: '详情' },
    { type: 'divider' as const },
    { key: 'delete', label: '删除', danger: true, onClick: () => handleDelete(f.id) },
  ];

  const mapUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 112px)' }}>
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }} />
        <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
        <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
        <Tabs size="small" items={[{ key: 'all', label: '全部' }, { key: 'online', label: '在线' }, { key: 'offline', label: '离线' }]} />
      </Card>

      <Card size="small" style={{ width: 320, flexShrink: 0 }}
        bodyStyle={{ flex: 1, display:'flex', flexDirection:'column', padding: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="small"
          items={[{ key: 'agent-fence', label: '代理商的围栏' }, { key: 'device-fence', label: '设备的围栏' }]} />
        <Button type="primary" icon={<PlusOutlined />} block style={{ margin: '8px 0' }}>创建新围栏</Button>
        <Table size="small" dataSource={fences} rowKey="id" loading={loading}
          pagination={{ pageSize: 15, size:'small', showSizeChanger: false }}
          onRow={(r) => ({ onClick: () => handleSelect(r), style: { cursor:'pointer', background: selectedFence?.id === r.id ? '#e6f4ff' : undefined } })}
          columns={[
            { title: '围栏名称', dataIndex: 'name' },
            { title: '操作', width: 60, render: (_: any, r: any) =>
              <Dropdown menu={{ items: fenceMenu(r) }} trigger={['click']}>
                <Button size="small" type="text" icon={<EllipsisOutlined />} />
              </Dropdown> },
          ]} />
      </Card>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position:'absolute', top:8, left:8, zIndex:1000, display:'flex', gap:8, background:'white', padding:'4px 8px', borderRadius:6, boxShadow:'0 1px 4px rgba(0,0,0,0.1)' }}>
          <Radio.Group value={mapMode} onChange={(e) => setMapMode(e.target.value)} size="small" optionType="button"
            options={[{ value:'default', label:'默认' }, { value:'bus', label:'公交路线' }]} />
        </div>
        <div style={{ position:'absolute', top:8, right:8, zIndex:1000, display:'flex', gap:8, background:'white', padding:'4px 8px', borderRadius:6, boxShadow:'0 1px 4px rgba(0,0,0,0.1)' }}>
          <Select size="small" defaultValue="keyword" style={{ width:80 }} options={[{ value:'keyword', label:'关键词' }]} />
          <Input size="small" placeholder="请输入需要查询的地址" style={{ width:160 }} />
          <Select size="small" value={mapStyle} onChange={setMapStyle} style={{ width:100 }}
            options={[{ value:'osm', label:'OpenStreetMap' }, { value:'satellite', label:'卫星地图' }]} />
        </div>

        <MapContainer center={mapCenter} zoom={12} style={{ height:'100%', width:'100%' }}>
          <TileLayer url={mapUrl} />
          <MapClickHandler onMapClick={(lat, lng) => setMapCenter([lat, lng])} />
          {fences.filter((f) => f.type === 'circle').map((f) => (
            <Circle key={f.id} center={[f.center_lat, f.center_lng]} radius={f.radius}
              color={selectedFence?.id === f.id ? '#1677ff' : '#ff4d4f'}
              fillOpacity={selectedFence?.id === f.id ? 0.3 : 0.15}
              eventHandlers={{ click: () => handleSelect(f) }} />
          ))}
          {fences.map((f) => (
            <Marker key={`m-${f.id}`} position={[f.center_lat, f.center_lng]} eventHandlers={{ click: () => handleSelect(f) }} />
          ))}
        </MapContainer>

        <div style={{ position:'absolute', right:4, top:'50%', transform:'translateY(-50%)', zIndex:1000 }}>
          <Button shape="circle" size="small" icon={<span>📏</span>} title="测距" />
          <Button shape="circle" size="small" icon={<span>⬡</span>} title="多边形划分" style={{ display:'block', marginTop:4 }} />
        </div>
      </div>
    </div>
  );
}
