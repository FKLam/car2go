import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Empty, Form, Input, InputNumber, List, Radio, Select, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, CodeOutlined, DashboardOutlined, FieldTimeOutlined, PoweroffOutlined, ReloadOutlined, SendOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../api';

const { Text, Title } = Typography;

const commandCards = [
  { type: 'move_alert', title: '位移报警', desc: '设备异常移动告警开关', color: '#13c2c2', icon: <DashboardOutlined /> },
  { type: 'power_off', title: '断电报警', desc: '设备断电告警开关', color: '#fa8c16', icon: <PoweroffOutlined /> },
  { type: 'speed_limit', title: '超速报警', desc: '设置车辆超速阈值', color: '#1677ff', icon: <WarningOutlined /> },
  { type: 'restart', title: '重启设备', desc: '远程重启 GPS 终端', color: '#0ea5e9', icon: <ReloadOutlined /> },
  { type: 'vibrate', title: '震动报警', desc: '震动传感器告警开关', color: '#722ed1', icon: <ThunderboltOutlined /> },
  { type: 'custom', title: '自定义指令', desc: '自定义指令码下发', color: '#4f46e5', icon: <CodeOutlined /> },
];

const statusColor: Record<string, string> = {
  pending: 'default',
  queued: 'orange',
  sent: 'blue',
  success: 'green',
  failed: 'red',
  timeout: 'volcano',
};

export default function RemoteCommands() {
  const [form] = Form.useForm();
  const [devices, setDevices] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, byStatus: [] });
  const [selectedType, setSelectedType] = useState('move_alert');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [logFilters, setLogFilters] = useState({ keyword: '', status: '', type: '' });
  const [activeTab, setActiveTab] = useState('cmdSend');

  const selectedCommand = commandCards.find((item) => item.type === selectedType)!;
  const selectedDevices = devices.filter((item) => selectedDeviceIds.includes(item.id));
  const hasOfflineSelected = selectedDevices.some((item) => item.status !== 'online');

  const filteredDevices = useMemo(() => {
    if (!searchText) return devices;
    return devices.filter((item) => item.name?.includes(searchText) || item.imei?.includes(searchText) || item.plate_number?.includes(searchText));
  }, [devices, searchText]);

  const queuedLogs = useMemo(() => logs.filter((item) => item.status === 'queued'), [logs]);
  const sentCount = getStatusCount(stats, 'sent');
  const queuedCount = getStatusCount(stats, 'queued');
  const timeoutCount = getStatusCount(stats, 'timeout');
  const successCount = getStatusCount(stats, 'success');

  const loadDevices = async () => {
    const { data } = await api.get('/devices');
    setDevices(data);
    if (selectedDeviceIds.length === 0 && data.length > 0) setSelectedDeviceIds([data[0].id]);
  };

  const loadLogs = async (filters = logFilters) => {
    const params: any = { limit: 200 };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    const [{ data: logData }, { data: statData }] = await Promise.all([
      api.get('/commands', { params }),
      api.get('/commands/stats'),
    ]);
    setLogs(logData);
    setStats(statData);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadDevices(), loadLogs()]);
    } catch {
      message.error('加载远程指令数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleDevice = (deviceId: string, checked: boolean) => {
    setSelectedDeviceIds((prev) => checked ? Array.from(new Set([...prev, deviceId])) : prev.filter((id) => id !== deviceId));
  };

  const submitCommand = async () => {
    if (selectedDeviceIds.length === 0) {
      message.warning('请先选择设备');
      return;
    }
    const values = await form.validateFields();
    setSending(true);
    try {
      const { data } = await api.post('/commands/send', {
        deviceIds: selectedDeviceIds,
        type: selectedType,
        ...values,
      });
      if (data.records?.length) setLogs((prev) => [...data.records, ...prev]);
      await loadLogs();
      const skippedText = data.skipped?.length ? `，跳过 ${data.skipped.length} 台` : '';
      message.success(`已提交 ${data.records?.length || 0} 条指令${skippedText}`);
    } catch (err: any) {
      message.error(err.response?.data?.error || '指令发送失败');
    } finally {
      setSending(false);
    }
  };

  const updateCommandStatus = async (id: string, status: string, result: string) => {
    try {
      await api.put(`/commands/${id}/status`, { status, result });
      await loadLogs();
      message.success('指令状态已更新');
    } catch (err: any) {
      message.error(err.response?.data?.error || '更新失败');
    }
  };

  const dispatchOffline = async (deviceId: string) => {
    try {
      const { data } = await api.post(`/commands/offline/dispatch/${deviceId}`);
      await loadLogs();
      message.success(`已下发 ${data.dispatched} 条离线指令`);
    } catch {
      message.error('离线指令下发失败');
    }
  };

  const columns = [
    { title: '发送时间', dataIndex: 'sent_at', key: 'sent_at', width: 170, render: formatTime },
    { title: '设备', dataIndex: 'device_name', key: 'device_name', width: 150 },
    { title: 'IMEI', dataIndex: 'device_imei', key: 'device_imei', width: 160, render: (value: string) => value || '-' },
    { title: '指令类型', dataIndex: 'title', key: 'title', width: 120 },
    { title: '操作', dataIndex: 'operation', key: 'operation', width: 90, render: operationLabel },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <Tag color={statusColor[value] || 'default'}>{statusLabel(value)}</Tag> },
    { title: '结果', dataIndex: 'result', key: 'result', ellipsis: true },
    {
      title: '操作', key: 'action', width: 180, render: (_: unknown, record: any) => (
        <Space size={4}>
          {record.status === 'sent' && <Button size="small" type="link" onClick={() => updateCommandStatus(record.id, 'success', '设备返回执行成功')}>标记成功</Button>}
          {record.status === 'sent' && <Button size="small" type="link" danger onClick={() => updateCommandStatus(record.id, 'failed', '设备返回执行失败')}>失败</Button>}
          {record.status === 'queued' && <Button size="small" type="link" onClick={() => dispatchOffline(record.device_id)}>立即下发</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'flex', gap: 15 }}>
      <Card size="small" title="设备检索" style={{ width: 300, flexShrink: 0 }} bodyStyle={{ padding: 12 }}>
        <Input.Search placeholder="设备名 / IMEI / 车牌号" allowClear onChange={(e) => setSearchText(e.target.value)} style={{ marginBottom: 12 }} />
        <Space style={{ marginBottom: 8 }}>
          <Button size="small" onClick={() => setSelectedDeviceIds(filteredDevices.map((item) => item.id))}>全选</Button>
          <Button size="small" onClick={() => setSelectedDeviceIds([])}>清空</Button>
          <Text type="secondary">已选 {selectedDeviceIds.length}</Text>
        </Space>
        <List loading={loading} dataSource={filteredDevices} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无设备" /> }} renderItem={(device) => (
          <List.Item style={{ borderRadius: 6, padding: '8px 10px', marginBottom: 4, background: selectedDeviceIds.includes(device.id) ? '#e6f4ff' : undefined }}>
            <Checkbox checked={selectedDeviceIds.includes(device.id)} onChange={(e) => toggleDevice(device.id, e.target.checked)} style={{ marginRight: 8 }} />
            <List.Item.Meta title={<Space><Text strong>{device.name}</Text><Tag color={device.status === 'online' ? 'green' : 'default'}>{device.status === 'online' ? '在线' : '离线'}</Tag></Space>} description={<Text type="secondary" style={{ fontSize: 12 }}>{device.imei || device.plate_number || '无设备标识'}</Text>} />
          </List.Item>
        )} />
      </Card>

      <Card style={{ flex: 1, minWidth: 0 }} bodyStyle={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>远程指令</Title>
            <Text type="secondary">指令下发、执行状态追踪、离线队列自动补发</Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
          <Card size="small"><Statistic title="全部指令" value={stats.total || 0} prefix={<SendOutlined />} /></Card>
          <Card size="small"><Statistic title="已发送" value={sentCount} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} /></Card>
          <Card size="small"><Statistic title="离线队列" value={queuedCount} valueStyle={{ color: '#fa8c16' }} prefix={<FieldTimeOutlined />} /></Card>
          <Card size="small"><Statistic title="成功 / 超时" value={`${successCount} / ${timeoutCount}`} valueStyle={{ color: timeoutCount ? '#cf1322' : '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'cmdSend', label: '指令下发', children: renderSendPanel() },
          { key: 'cmdTask', label: '指令记录查询', children: renderLogPanel(logs) },
          { key: 'testLogCmdTask', label: '离线指令队列', children: renderLogPanel(queuedLogs, true) },
        ]} />
      </Card>
    </div>
  );

  function renderSendPanel() {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(110px, 1fr))', gap: 16, marginBottom: 20 }}>
          {commandCards.map((item) => {
            const active = item.type === selectedType;
            return <Card.Grid key={item.type} hoverable onClick={() => setSelectedType(item.type)} style={{ width: '100%', padding: 16, borderRadius: 8, boxShadow: active ? `0 0 0 2px ${item.color}` : undefined, background: active ? `${item.color}12` : '#fff' }}>
              <Space direction="vertical" size={6}><span style={{ color: item.color, fontSize: 24 }}>{item.icon}</span><Text strong>{item.title}</Text><Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text></Space>
            </Card.Grid>;
          })}
        </div>

        <div style={{ border: '1px dashed #d9d9d9', borderRadius: 8, padding: 18, marginBottom: 18 }}>
          {hasOfflineSelected && <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="已选设备包含离线设备，提交后会保存为离线指令，待设备上线后自动下发。" />}
          {selectedType === 'restart' && selectedDevices.some((item) => item.status === 'online') && <Alert type="info" showIcon style={{ marginBottom: 16 }} message="重启设备为立即执行指令，提交后将进入发送状态并等待执行结果。" />}
          <Form form={form} layout="inline" initialValues={{ operation: 'close', speedLimit: 80, saveOffline: true }}>
            <Form.Item label="指令类型"><Text strong>{selectedCommand.title}</Text></Form.Item>
            <Form.Item label="目标设备"><Text strong>{selectedDeviceIds.length} 台</Text></Form.Item>
            {['move_alert', 'power_off', 'speed_limit', 'vibrate'].includes(selectedType) && <Form.Item label="操作类型" name="operation" rules={[{ required: true, message: '请选择操作类型' }]}><Radio.Group options={[{ label: '开启', value: 'open' }, { label: '关闭', value: 'close' }]} /></Form.Item>}
            {selectedType === 'speed_limit' && <Form.Item label="限速" name="speedLimit" rules={[{ required: true, message: '请输入限速' }]}><InputNumber min={1} max={240} addonAfter="km/h" /></Form.Item>}
            {selectedType === 'custom' && <Form.Item label="指令码" name="customCommand" rules={[{ required: true, message: '请输入自定义指令码' }]}><Input placeholder="例如: SERVER,1,example.com,7700#" style={{ width: 300 }} /></Form.Item>}
            <Form.Item name="saveOffline" valuePropName="checked"><Checkbox>离线转存</Checkbox></Form.Item>
            <Form.Item><Button type="primary" icon={<BellOutlined />} loading={sending} onClick={submitCommand}>提交指令</Button></Form.Item>
          </Form>
        </div>

        <Text strong>最近指令日志</Text>
        <Table columns={columns} dataSource={logs.slice(0, 6)} rowKey="id" loading={loading} size="small" pagination={false} locale={{ emptyText: <Empty description="暂无数据" /> }} style={{ marginTop: 10 }} />
      </div>
    );
  }

  function renderLogPanel(dataSource: any[], offlineOnly = false) {
    return (
      <div>
        <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <Input.Search placeholder="设备 / IMEI / 指令 / 结果" allowClear style={{ width: 240 }} value={logFilters.keyword} onChange={(e) => setLogFilters({ ...logFilters, keyword: e.target.value })} onSearch={() => loadLogs()} />
          {!offlineOnly && <Select placeholder="状态" allowClear style={{ width: 130 }} value={logFilters.status || undefined} onChange={(value) => setLogFilters({ ...logFilters, status: value || '' })} options={['queued', 'sent', 'success', 'failed', 'timeout'].map((item) => ({ value: item, label: statusLabel(item) }))} />}
          <Select placeholder="指令类型" allowClear style={{ width: 150 }} value={logFilters.type || undefined} onChange={(value) => setLogFilters({ ...logFilters, type: value || '' })} options={commandCards.map((item) => ({ value: item.type, label: item.title }))} />
          <Button type="primary" onClick={() => loadLogs()}>查询</Button>
          <Button onClick={() => { const empty = { keyword: '', status: '', type: '' }; setLogFilters(empty); loadLogs(empty); }}>重置</Button>
        </Space>
        <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 12 }} locale={{ emptyText: <Empty description="暂无数据" /> }} scroll={{ y: 'calc(100vh - 560px)' }} />
      </div>
    );
  }
}

function getStatusCount(stats: any, status: string) {
  return stats.byStatus?.find((item: any) => item.status === status)?.count || 0;
}

function formatTime(value: string) {
  return value?.replace('T', ' ').slice(0, 19) || '-';
}

function operationLabel(value: string) {
  if (value === 'open') return '开启';
  if (value === 'close') return '关闭';
  return '-';
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: '待发送',
    queued: '离线队列',
    sent: '已发送',
    success: '执行成功',
    failed: '执行失败',
    timeout: '超时',
  };
  return labels[status] || status;
}
