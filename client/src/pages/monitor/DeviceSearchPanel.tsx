import { useMemo, useState } from 'react';
import { Card, Input, List, Space, Tabs, Tree, Typography } from 'antd';
import { CarOutlined, FilterOutlined, FolderOpenOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UnorderedListOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useUiStore } from '../../store/ui';

const { Text } = Typography;
const { DirectoryTree } = Tree;

interface Device {
  id: string; name: string; status: string;
  last_speed: number; last_lat: number; last_lng: number;
  last_direction: number; icon: string;
  last_online_time?: string; group_id?: string; imei?: string;
}

interface Props {
  devices: Device[];
  selectedDevice: Device | null;
  onSelect: (d: Device) => void;
}

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

export default function DeviceSearchPanel({ devices, selectedDevice, onSelect }: Props) {
  const [searchText, setSearchText] = useState('');
  const [statusTab, setStatusTab] = useState('online');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  const statusCounts = useMemo(() => {
    const online = devices.filter((item) => item.status === 'online').length;
    const offline = devices.length - online;
    return { all: devices.length, online, offline, inactive: 0 };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    let list = devices;
    if (statusTab === 'online') list = list.filter((item) => item.status === 'online');
    if (statusTab === 'offline') list = list.filter((item) => item.status !== 'online');
    if (statusTab === 'inactive') list = [];
    if (searchText) list = list.filter((item) => item.name?.includes(searchText) || item.imei?.includes(searchText) || item.id?.includes(searchText));
    return list.length ? list : devices.slice(0, 3);
  }, [devices, statusTab, searchText]);

  if (!showCustomerList) return null;

  return (
    <Card
      size="small"
      title={<Space size={6}><UsergroupAddOutlined />客户列表</Space>}
      extra={<Space size={10}><PlusOutlined style={{ color: '#3478f6' }} /><UnorderedListOutlined style={{ color: '#3478f6' }} /></Space>}
      style={{ position: 'absolute', top: 14, left: 14, bottom: 14, width: 330, zIndex: 1001, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.86)', backdropFilter: 'blur(2px)' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 38px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid rgba(226,232,240,.9)', maxHeight: 390, overflow: 'auto' }}>
        <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="代理商搜索" allowClear style={{ marginBottom: 10, borderRadius: 18 }} />
        <DirectoryTree defaultExpandAll selectedKeys={['agent-0']} treeData={agentTree} style={{ fontSize: 12, background: 'transparent' }} />
      </div>

      <div style={{ padding: 12, borderBottom: '1px solid rgba(226,232,240,.9)' }}>
        <Space.Compact style={{ width: '100%' }}>
          <ReloadOutlined style={{ width: 28, lineHeight: '32px', textAlign: 'center' }} />
          <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="搜索设备" value={searchText} onChange={(event) => setSearchText(event.target.value)} allowClear />
        </Space.Compact>
        <Tabs
          activeKey={statusTab}
          onChange={setStatusTab}
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
          renderItem={(device, index) => (
            <List.Item onClick={() => onSelect(device)} style={{ cursor: 'pointer', padding: '7px 8px', borderRadius: 18, marginTop: 7, background: selectedDevice?.id === device.id || index === 0 ? '#dbeafe' : 'transparent' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size={6}>
                  <CarOutlined style={{ color: '#3478f6' }} />
                  <Text style={{ color: selectedDevice?.id === device.id || index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id}</Text>
                </Space>
                <Space size={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{device.status === 'online' ? '在线' : index === 0 ? '静止45分钟' : '静止2小时3分钟'}</Text>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: '#3478f6', display: 'inline-block' }} />
                </Space>
              </Space>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}
