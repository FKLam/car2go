import { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Space, Typography, Input, Select, Button, message, Card, Tree, List, Tabs } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, SwapOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../api';

const { Text } = Typography;

// Mock agent tree
const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
    { title: 'wangzhe (0/0)', key: 'agent-2', isLeaf: true },
  ]},
];

export default function DeviceList() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/devices');
      setDevices(data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredDevices = useMemo(() => {
    let list = devices;
    if (statusFilter) list = list.filter((d) => d.status === statusFilter);
    if (typeFilter) list = list.filter((d) => d.model === typeFilter);
    if (searchText) list = list.filter((d) =>
      d.name?.includes(searchText) || d.imei?.includes(searchText) || d.plate_number?.includes(searchText));
    return list;
  }, [devices, searchText, statusFilter, typeFilter]);

  const columns = [
    { title: 'IMEI号', dataIndex: 'imei', key: 'imei', width: 160 },
    { title: t('devices.deviceName'), dataIndex: 'name', key: 'name' },
    { title: '设备卡号', dataIndex: 'sim_number', key: 'sim' },
    { title: t('devices.plateNumber'), dataIndex: 'plate_number', key: 'plate' },
    { title: t('devices.model'), dataIndex: 'model', key: 'model' },
    { title: '用户到期', dataIndex: 'expire_date', key: 'expire', render: (v: string) => v || '-' },
    { title: t('common.status'), dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'online' ? 'green' : 'default'}>{v === 'online' ? t('common.online') : t('common.offline')}</Tag> },
    { title: t('common.action'), key: 'action', width: 100,
      render: () => <Button size="small" type="link">修改</Button> },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* Left panel */}
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <div style={{ marginBottom: 8 }}>
          <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" />
        </div>
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }} />
        <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
        <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
        <Tabs size="small" items={[
          { key: 'all', label: '全部' },
          { key: 'online', label: '在线' },
          { key: 'offline', label: '离线' },
        ]} />
        <List size="small" dataSource={devices.slice(0, 8)}
          renderItem={(d: any) => (
            <List.Item style={{ padding: '4px 8px' }}>
              <Text style={{ fontSize: 12 }}>{d.name} <Tag color={d.status === 'online' ? 'green' : 'default'} style={{ fontSize: 10 }}>{d.status}</Tag></Text>
            </List.Item>
          )} />
      </Card>

      {/* Main table */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <Input prefix={<SearchOutlined />} placeholder="IMEI/设备名称/车牌号" style={{ width: 220 }}
            value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Select placeholder="设备状态" allowClear style={{ width: 120 }} value={statusFilter || undefined}
            onChange={setStatusFilter} options={[{ value: 'online', label: '在线' }, { value: 'offline', label: '离线' }]} />
          <Select placeholder="设备类型" allowClear style={{ width: 120 }} value={typeFilter || undefined}
            onChange={setTypeFilter} options={[{ value: 'GT06N', label: 'GT06N' }]} />
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
          <div style={{ flex: 1 }} />
          <Button icon={<SwapOutlined />} type="primary">设备批量转移</Button>
          <Button icon={<ExportOutlined />}>导出表格</Button>
          <Button icon={<ExportOutlined />}>导出更多</Button>
          <Button icon={<ReloadOutlined />} onClick={loadData} />
        </div>
        <Table columns={columns} dataSource={filteredDevices} rowKey="id"
          loading={loading} size="small" pagination={{ pageSize: 15, showSizeChanger: true, showQuickJumper: true }}
          scroll={{ y: 'calc(100vh - 320px)' }} />
      </div>
    </div>
  );
}
