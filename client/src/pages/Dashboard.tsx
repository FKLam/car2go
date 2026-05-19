import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, List, Typography } from 'antd';
import {
  LaptopOutlined, WifiOutlined, WifiOutlined as OfflineOutlined,
  AimOutlined, AlertOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => {
      setData(data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!data) return <Text type="danger">加载失败</Text>;

  const { overview, recentAlerts, deviceStatus } = data;

  const statCards = [
    { title: t('dashboard.totalDevices'), value: overview.totalDevices, icon: <LaptopOutlined style={{ fontSize: 24, color: '#1677ff' }} />, color: '#e6f4ff' },
    { title: t('dashboard.onlineDevices'), value: overview.onlineDevices, icon: <WifiOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#f6ffed' },
    { title: t('dashboard.offlineDevices'), value: overview.offlineDevices, icon: <OfflineOutlined style={{ fontSize: 24, color: '#999' }} />, color: '#fafafa' },
    { title: t('dashboard.geofences'), value: overview.totalGeofences, icon: <AimOutlined style={{ fontSize: 24, color: '#722ed1' }} />, color: '#f9f0ff' },
    { title: t('dashboard.unreadAlerts'), value: overview.unreadAlerts, icon: <AlertOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />, color: '#fff2f0' },
    { title: t('dashboard.todayRecords'), value: overview.todayRecords, icon: <NodeIndexOutlined style={{ fontSize: 24, color: '#13c2c2' }} />, color: '#e6fffb' },
  ];

  const alertColumns = [
    { title: t('common.type'), dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v}</Tag> },
    { title: '设备', dataIndex: 'device_name', key: 'device' },
    { title: t('common.time'), dataIndex: 'created_at', key: 'time', render: (v: string) => new Date(v).toLocaleString() },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'unread' ? 'red' : 'default'}>{v}</Tag> },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={12} sm={8} md={4} key={card.title}>
            <Card className="stat-card" style={{ borderTop: `3px solid ${card.color.split(';')[0]?.replace('color:', '') || '#1677ff'}` }}>
              <Statistic title={card.title} value={card.value} prefix={card.icon} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.recentAlerts')}>
            {recentAlerts?.length ? (
              <Table columns={alertColumns} dataSource={recentAlerts} rowKey="id" size="small" pagination={false} />
            ) : (
              <Text type="secondary">暂无告警</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={t('dashboard.deviceStatus')}>
            {deviceStatus?.length ? (
              <List
                dataSource={deviceStatus}
                renderItem={(item: any) => (
                  <List.Item>
                    <Tag color={item.status === 'online' ? 'green' : 'default'}>{item.status === 'online' ? t('common.online') : t('common.offline')}</Tag>
                    <Text>{item.count} 台</Text>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">暂无设备</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
