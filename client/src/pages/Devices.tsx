import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tree, Card, Space, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';

const { Text } = Typography;

export default function Devices() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [devRes, grpRes] = await Promise.all([
        api.get('/devices'),
        api.get('/devices/groups/tree'),
      ]);
      setDevices(devRes.data);
      setGroups(grpRes.data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.id}`, values);
        message.success('设备已更新');
      } else {
        await api.post('/devices', values);
        message.success('设备已添加');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingDevice(null);
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/devices/${id}`);
    message.success('设备已删除');
    loadData();
  };

  const openEdit = (device: any) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    { title: t('devices.deviceName'), dataIndex: 'name', key: 'name' },
    { title: t('devices.imei'), dataIndex: 'imei', key: 'imei' },
    { title: t('devices.plateNumber'), dataIndex: 'plate_number', key: 'plate' },
    { title: t('devices.model'), dataIndex: 'model', key: 'model' },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'online' ? 'green' : 'default'}>{v === 'online' ? t('common.online') : t('common.offline')}</Tag> },
    { title: t('devices.lastOnline'), dataIndex: 'last_online_time', key: 'lastOnline', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
    {
      title: t('common.action'), key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 112px)' }}>
      <Card title={t('devices.deviceTree')} style={{ width: 240, flexShrink: 0 }} size="small">
        <Tree
          treeData={groups.map((g: any) => ({
            title: `${g.name} (${g.deviceCount?.count || 0})`,
            key: g.id,
            children: g.children?.map((c: any) => ({
              title: `${c.name} (${c.deviceCount?.count || 0})`,
              key: c.id,
            })),
          }))}
        />
      </Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: 16 }}>{t('devices.title')}</Text>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>{t('devices.addDevice')}</Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ y: 'calc(100vh - 280px)' }}
          pagination={{ pageSize: 20 }}
        />
      </div>

      <Modal
        title={editingDevice ? t('common.edit') : t('devices.addDevice')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label={t('devices.deviceName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="imei" label={t('devices.imei')}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label={t('devices.model')}>
            <Input />
          </Form.Item>
          <Form.Item name="group_id" label={t('devices.group')}>
            <Select allowClear placeholder="选择分组" options={groups.map((g: any) => ({ value: g.id, label: g.name }))} />
          </Form.Item>
          <Form.Item name="plate_number" label={t('devices.plateNumber')}>
            <Input />
          </Form.Item>
          <Form.Item name="sim_number" label={t('devices.simNumber')}>
            <Input />
          </Form.Item>
          <Form.Item name="driver_name" label={t('devices.driverName')}>
            <Input />
          </Form.Item>
          <Form.Item name="driver_phone" label={t('devices.driverPhone')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
