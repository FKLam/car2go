import { useState, useMemo } from 'react';
import { Card, Input, Tabs, Tree, List, Tag, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { DirectoryTree } = Tree;

interface Device {
  id: string; name: string; status: string;
  last_speed: number; last_lat: number; last_lng: number;
  last_direction: number; icon: string;
  last_online_time?: string; group_id?: string;
}

interface Props {
  devices: Device[];
  selectedDevice: Device | null;
  onSelect: (d: Device) => void;
}

// Mock agent tree
const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
    { title: 'wangzhe (0/0)', key: 'agent-2', isLeaf: true },
    { title: '姬姬 (0/0)', key: 'agent-3', isLeaf: true },
  ]},
];

export default function DeviceSearchPanel({ devices, selectedDevice, onSelect }: Props) {
  const [searchText, setSearchText] = useState('');
  const [statusTab, setStatusTab] = useState('all');

  const filteredDevices = useMemo(() => {
    let list = devices;
    if (statusTab === 'online') list = list.filter((d) => d.status === 'online');
    else if (statusTab === 'offline') list = list.filter((d) => d.status !== 'online');
    else if (statusTab === 'unactivated') list = [];
    if (searchText) list = list.filter((d) => d.name?.includes(searchText) || d.id?.includes(searchText));
    return list;
  }, [devices, statusTab, searchText]);

  const statusCounts = useMemo(() => {
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.length - online;
    return { all: devices.length, online, offline, unactivated: 0 };
  }, [devices]);

  const getSpeedColor = (speed: number) => {
    if (speed > 120) return 'red';
    if (speed > 60) return 'orange';
    if (speed > 10) return 'green';
    return 'default';
  };

  return (
    <Card
      size="small"
      style={{
        position: 'absolute', top: 75, left: 15, bottom: 15, width: 300,
        zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
      bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0', maxHeight: 200, overflow: 'auto' }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px 0' }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small"
            value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <Tabs activeKey={statusTab} onChange={setStatusTab} size="small" style={{ padding: '0 8px' }}
          items={[
            { key: 'all', label: `全部 ${statusCounts.all}` },
            { key: 'online', label: `在线 ${statusCounts.online}` },
            { key: 'offline', label: `离线 ${statusCounts.offline}` },
            { key: 'unactivated', label: `未激活 ${statusCounts.unactivated}` },
          ]}
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredDevices.length === 0 ? (
            <Empty description="暂无设备" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 20 }} />
          ) : (
            <List size="small" dataSource={filteredDevices}
              renderItem={(d) => (
                <List.Item
                  onClick={() => onSelect(d)}
                  style={{
                    cursor: 'pointer', padding: '6px 12px',
                    background: selectedDevice?.id === d.id ? '#e6f4ff' : undefined,
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 13 }}>{d.name || d.id}</Text>
                      <Tag color={d.status === 'online' ? 'green' : 'default'} style={{ fontSize: 11 }}>
                        {d.status === 'online' ? '在线' : '离线'}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      速度: <Tag color={getSpeedColor(d.last_speed)} style={{ fontSize: 11 }}>{d.last_speed?.toFixed(1) || 0} km/h</Tag>
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
