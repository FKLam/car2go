import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Card, Input, List, Space, Tabs, Tree, Typography } from 'antd';
import { CarOutlined, FilterOutlined, FolderOpenOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UnorderedListOutlined, UsergroupAddOutlined } from '@ant-design/icons';
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

const pageTitles: Record<string, string> = {
  '/count/mileage': '数据统计 / 里程统计',
  '/count/alarms': '数据统计 / 报警统计',
  '/count/stay-detail': '数据统计 / 停留点详细',
  '/count/export': '数据统计 / 统计数据导出',
};

export default function CountLayout() {
  const location = useLocation();
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState('online');
  const [keyword, setKeyword] = useState('');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  useEffect(() => {
    api.get('/devices').then(({ data }) => setDevices(data || [])).catch(() => setDevices([]));
  }, []);

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
    if (keyword) list = list.filter((item) => item.name?.includes(keyword) || item.imei?.includes(keyword) || item.plate_number?.includes(keyword));
    return list;
  }, [devices, deviceStatus, keyword]);

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'grid', gridTemplateColumns: showCustomerList ? '330px minmax(680px, 1fr)' : 'minmax(680px, 1fr)', gap: 12 }}>
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
            <ReloadOutlined style={{ width: 26, lineHeight: '32px', textAlign: 'center' }} />
            <Input prefix={<SearchOutlined />} suffix={<FilterOutlined />} placeholder="搜索设备" value={keyword} onChange={(event) => setKeyword(event.target.value)} allowClear />
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
            dataSource={filteredDevices.length ? filteredDevices : devices.slice(0, 3)}
            renderItem={(device, index) => (
              <List.Item style={{ padding: '7px 8px', borderRadius: 18, marginTop: 7, background: index === 0 ? '#dbeafe' : 'transparent' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <CarOutlined style={{ color: '#3478f6' }} />
                    <Text style={{ color: index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id || '0544202917'}</Text>
                  </Space>
                  <Space size={6}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{device.status === 'online' ? '在线' : index === 0 ? '静止2分钟' : '静止22分钟'}</Text>
                    <span style={{ width: 6, height: 6, borderRadius: 6, background: '#3478f6', display: 'inline-block' }} />
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Card>}

      <Card style={{ borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ height: '100%', padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'none' }}>{pageTitles[location.pathname]}</div>
        <Outlet />
      </Card>
    </div>
  );
}
