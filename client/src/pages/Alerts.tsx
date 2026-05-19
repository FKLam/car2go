import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Typography, Select, Row, Col, Card, Statistic } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';

const { Text } = Typography;

const typeColors: Record<string, string> = {
  overspeed: 'volcano',
  geofence_out: 'orange',
  geofence_in: 'green',
  sos: 'red',
  power_off: 'purple',
  vibration: 'gold',
};

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ total: 0, unread: 0 });
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const [aRes, sRes] = await Promise.all([
        api.get('/alerts', { params }),
        api.get('/alerts/stats'),
      ]);
      setAlerts(aRes.data);
      setStats(sRes.data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterType, filterStatus]);

  const markRead = async (id: string) => {
    await api.put(`/alerts/${id}/read`);
    message.success('已标记为已读');
    loadData();
  };

  const markAllRead = async () => {
    await api.put('/alerts/read-all');
    message.success('全部已读');
    loadData();
  };

  const typeLabels: Record<string, string> = {
    overspeed: t('alerts.typeOverspeed'),
    geofence_out: t('alerts.typeGeofence'),
    geofence_in: t('alerts.typeGeofence'),
    sos: t('alerts.typeSOS'),
    power_off: t('alerts.typePower'),
    vibration: t('alerts.typeVibration'),
  };

  const columns = [
    {
      title: t('common.type'), dataIndex: 'type', key: 'type',
      render: (v: string) => <Tag color={typeColors[v] || 'default'}>{typeLabels[v] || v}</Tag>,
    },
    { title: '设备', dataIndex: 'device_name', key: 'device' },
    { title: t('common.time'), dataIndex: 'created_at', key: 'time', render: (v: string) => new Date(v).toLocaleString() },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'unread' ? 'red' : 'default'}>{v === 'unread' ? t('alerts.unread') : t('alerts.read')}</Tag>,
    },
    {
      title: t('common.action'), key: 'action',
      render: (_: any, record: any) =>
        record.status === 'unread' ? (
          <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(record.id)}>
            {t('alerts.markRead')}
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 112px)' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small"><Statistic title={t('common.total')} value={stats.total} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title={t('alerts.unread')} value={stats.unread} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title={t('alerts.read')} value={stats.total - stats.unread} /></Card></Col>
      </Row>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Text strong style={{ fontSize: 16 }}>{t('alerts.title')}</Text>
        <Space>
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder={t('common.type')}
            value={filterType}
            onChange={setFilterType}
            options={Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder={t('common.status')}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'unread', label: t('alerts.unread') },
              { value: 'read', label: t('alerts.read') },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={loadData} />
          <Button onClick={markAllRead}>{t('alerts.markAllRead')}</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={alerts}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ y: 'calc(100vh - 320px)' }}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
