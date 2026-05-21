import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Dropdown, Input, List, Select, Space, Table, Tabs, Tree, Typography, message } from 'antd';
import {
  CarOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useUiStore } from '../../store/ui';

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

const fallbackDevices = [
  { id: 'mock-1', imei: '864296000149772', name: 'jf', sim_number: '808082572914150', plate_number: '88808', model: 'G16', expire_date: '2999-03-23', status: 'offline', offlineText: '离线' },
  { id: 'mock-2', imei: '864291000244517', name: 'IME码', sim_number: '1064838430717', plate_number: '翼A60QZ0', model: 'K100', expire_date: '2024-12-13', status: 'offline', offlineText: '离线2' },
  { id: 'mock-3', imei: '280012201095227', name: '富士哥电动车', sim_number: '无', plate_number: '辽NA040833', model: 'G28', expire_date: '永久', status: 'offline', offlineText: '离线4' },
  { id: 'mock-4', imei: '862371741097234', name: 'MD asad Ahmed', sim_number: '无', plate_number: '粤BDZ9527', model: '4G17', expire_date: '2025-07-18', status: 'offline', offlineText: '离线1' },
  { id: 'mock-5', imei: '866514115413075', name: '4G07-413075', sim_number: '无', plate_number: '无', model: '4G07', expire_date: '待激活 [一年]', status: 'inactive', offlineText: '' },
  { id: 'mock-6', imei: '866514115516497', name: '4G07-516497', sim_number: '无', plate_number: '无', model: '4G07', expire_date: '待激活 [一年]', status: 'inactive', offlineText: '' },
];

export default function DeviceList() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [deviceStatus, setDeviceStatus] = useState('online');
  const [deviceKeyword, setDeviceKeyword] = useState('');
  const showCustomerList = useUiStore((state) => state.showCustomerList);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/devices');
      setDevices(data?.length ? data : fallbackDevices);
    } catch {
      setDevices(fallbackDevices);
      message.error('加载设备数据失败，已显示示例数据');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const statusCounts = useMemo(() => {
    const online = devices.filter((item) => item.status === 'online').length;
    const offline = devices.filter((item) => item.status !== 'online' && item.status !== 'inactive').length;
    const inactive = devices.filter((item) => item.status === 'inactive').length;
    return { all: devices.length, online, offline, inactive };
  }, [devices]);

  const leftDevices = useMemo(() => {
    let list = devices;
    if (deviceStatus === 'online') list = list.filter((item) => item.status === 'online');
    if (deviceStatus === 'offline') list = list.filter((item) => item.status !== 'online' && item.status !== 'inactive');
    if (deviceStatus === 'inactive') list = list.filter((item) => item.status === 'inactive');
    if (deviceKeyword) list = list.filter((item) => item.name?.includes(deviceKeyword) || item.imei?.includes(deviceKeyword) || item.plate_number?.includes(deviceKeyword));
    return list.length ? list : devices.slice(0, 3);
  }, [devices, deviceStatus, deviceKeyword]);

  const filteredDevices = useMemo(() => {
    let list = devices;
    if (statusFilter) list = list.filter((item) => item.status === statusFilter);
    if (typeFilter) list = list.filter((item) => item.model === typeFilter);
    if (searchText) list = list.filter((item) => item.name?.includes(searchText) || item.imei?.includes(searchText) || item.plate_number?.includes(searchText));
    return list;
  }, [devices, searchText, statusFilter, typeFilter]);

  const modelOptions = Array.from(new Set(devices.map((item) => item.model).filter(Boolean))).map((model) => ({ value: model, label: model }));

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
            dataSource={leftDevices}
            renderItem={(device, index) => (
              <List.Item style={{ padding: '7px 8px', borderRadius: 18, marginTop: 7, background: index === 0 ? '#dbeafe' : 'transparent' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <CarOutlined style={{ color: '#3478f6' }} />
                    <Text style={{ color: index === 0 ? '#1d5cff' : undefined }}>{device.name || device.imei || device.id}</Text>
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

      <Card style={{ borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ height: '100%', padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Space size={14} wrap style={{ marginBottom: 10 }}>
          <Input placeholder="IMEI/设备名称/车牌号" value={searchText} onChange={(event) => setSearchText(event.target.value)} allowClear style={{ width: 190 }} />
          <Select placeholder="全部设备" allowClear value={statusFilter || undefined} onChange={(value) => setStatusFilter(value || '')} style={{ width: 190 }} suffixIcon={<DownOutlined />} options={[{ value: 'online', label: '在线设备' }, { value: 'offline', label: '离线设备' }, { value: 'inactive', label: '待激活' }]} />
          <Select placeholder="请选择设备类型" allowClear value={typeFilter || undefined} onChange={(value) => setTypeFilter(value || '')} style={{ width: 210 }} suffixIcon={<DownOutlined />} options={modelOptions} />
          <Button type="primary">查询</Button>
        </Space>
        <Space size={10} style={{ marginBottom: 10 }}>
          <Button type="primary" icon={<SwapOutlined />}>设备批量转移</Button>
          <Button icon={<DownloadOutlined />}>导出表格</Button>
          <Button icon={<DownloadOutlined />}>导出更多</Button>
        </Space>
        <Table
          rowSelection={{ columnWidth: 42 }}
          columns={[
            { title: 'IMEI号', dataIndex: 'imei', width: 180, align: 'center' as const },
            { title: '设备名称', dataIndex: 'name', width: 180, align: 'center' as const },
            { title: '设备卡号(SIM卡号)', dataIndex: 'sim_number', width: 210, align: 'center' as const, render: (value: string) => value || '无' },
            { title: '车牌号', dataIndex: 'plate_number', width: 150, align: 'center' as const, render: (value: string) => value || '无' },
            { title: '设备类型', dataIndex: 'model', width: 140, align: 'center' as const, render: (value: string) => value || 'G16' },
            { title: '用户到期', dataIndex: 'expire_date', width: 150, align: 'center' as const, render: (value: string) => value || '永久' },
            { title: '状态', dataIndex: 'status', width: 110, align: 'center' as const, render: (_: string, record: any) => record.offlineText || (record.status === 'online' ? '在线' : record.status === 'inactive' ? '待激活' : '离线') },
            {
              title: '操作', key: 'action', width: 220, fixed: 'right' as const, align: 'center' as const, render: () => (
                <Space size={8}>
                  <Button size="small" icon={<EditOutlined />}>修改</Button>
                  <Dropdown menu={{ items: [{ key: 'detail', label: '设备详情' }, { key: 'track', label: '轨迹回放' }, { key: 'command', label: '远程指令' }] }}>
                    <Button size="small">更多&gt;&gt;</Button>
                  </Dropdown>
                </Space>
              ),
            },
          ]}
          dataSource={filteredDevices}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 15, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1460, y: 'calc(100vh - 360px)' }}
          style={{ flex: 1 }}
        />
      </Card>
    </div>
  );
}
