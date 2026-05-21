import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Typography, Card, Row, Col, Statistic, Tabs, Input, Tree, Select } from 'antd';
import { CheckOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';

const { Text } = Typography;

const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
  ]},
];

const typeColors: Record<string, string> = {
  overspeed: 'volcano', geofence_out: 'orange', geofence_in: 'green',
  sos: 'red', power_off: 'purple', vibration: 'gold',
  battery: 'cyan', cut: 'magenta', blind: 'blue',
  remove: 'red', move: 'orange', normal: 'green', poweron: 'lime', offline: 'default',
};

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('unread');

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const apiPath = activeTab === 'all' ? '/alerts/all' : '/alerts';
      const [aRes, sRes] = await Promise.all([api.get(apiPath, { params }), api.get('/alerts/stats')]);
      setAlerts(aRes.data || []);
      setStats(sRes.data || { total: 0, unread: 0 });
    } catch { setAlerts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filterType, filterStatus, activeTab]);

  const markRead = async (id: string) => {
    try { await api.put(`/alerts/${id}/read`); message.success('已标记为已读'); loadData(); }
    catch { message.error('操作失败'); }
  };
  const markAllRead = async () => {
    try { await api.put('/alerts/read-all'); message.success('全部已读'); loadData(); }
    catch { message.error('操作失败'); }
  };

  const typeLabels: Record<string, string> = {
    overspeed: t('alerts.typeOverspeed'), geofence_out: t('alerts.typeGeofence'), geofence_in: t('alerts.typeGeofence'),
    sos: t('alerts.typeSOS'), power_off: t('alerts.typePower'), vibration: t('alerts.typeVibration'),
    battery: '电池报警', cut: '切断报警', blind: '盲区报警', remove: '拆除报警',
    move: '位移报警', normal: '正常报警', poweron: '开机报警', offline: '离线报警',
  };

  const columns = [
    { title: t('common.type'), dataIndex: 'type', key: 'type',
      render: (v: string) => <Tag color={typeColors[v] || 'default'}>{typeLabels[v] || v}</Tag> },
    { title: '设备', dataIndex: 'device_name', key: 'device' },
    { title: t('common.time'), dataIndex: 'created_at', key: 'time', render: (v: string) => new Date(v).toLocaleString() },
    { title: t('common.status'), dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'unread' ? 'red' : 'default'}>{v === 'unread' ? t('alerts.unread') : t('alerts.read')}</Tag> },
    { title: t('common.action'), key: 'action',
      render: (_: any, record: any) =>
        record.status === 'unread' ? <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(record.id)}>{t('alerts.markRead')}</Button> : null },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 112px)' }}>
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }} />
        <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
        <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
        <Tabs size="small" items={[{ key: 'all', label: '全部' }, { key: 'online', label: '在线' }, { key: 'offline', label: '离线' }]} />
      </Card>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}><Card size="small"><Statistic title={t('common.total')} value={stats.total} suffix="条" /></Card></Col>
          <Col span={8}><Card size="small"><Statistic title={t('alerts.unread')} value={stats.unread} valueStyle={{ color: '#ff4d4f' }} suffix="条" /></Card></Col>
          <Col span={8}><Card size="small"><Statistic title={t('alerts.read')} value={stats.total - stats.unread} suffix="条" /></Card></Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}
          items={[
            { key: 'unread', label: `${t('alerts.unread')} (${stats.unread})` },
            { key: 'all', label: `全部报警 (${stats.total})` },
          ]}
          tabBarExtraContent={
            <Space>
              <Button size="small" onClick={markAllRead}>{t('alerts.markAllRead')}</Button>
              <Button size="small" icon={<ReloadOutlined />} onClick={loadData} />
            </Space>
          }
        />

        <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
          <Select allowClear placeholder="全部类型" style={{ width: 140 }} size="small" value={filterType || undefined}
            onChange={(v) => setFilterType(v || '')}
            options={Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))} />
          <Select allowClear placeholder="全部状态" style={{ width: 120 }} size="small" value={filterStatus || undefined}
            onChange={(v) => setFilterStatus(v || '')}
            options={[{ value: 'unread', label: t('alerts.unread') }, { value: 'read', label: t('alerts.read') }]} />
        </div>

        <Table columns={columns} dataSource={alerts} rowKey="id" loading={loading} size="small"
          pagination={{ pageSize: 20 }} scroll={{ y: 'calc(100vh - 440px)' }} />
      </div>
    </div>
  );
}
