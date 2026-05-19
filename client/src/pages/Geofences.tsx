import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Card, Space, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import api from '../api';

const { Text } = Typography;

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function Geofences() {
  const { t } = useTranslation();
  const [fences, setFences] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9042, 116.4074]);
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([
        api.get('/geofences'),
        api.get('/devices'),
      ]);
      setFences(fRes.data);
      setDevices(dRes.data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPos({ lat, lng });
    form.setFieldsValue({ centerLat: lat, centerLng: lng });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await api.put(`/geofences/${editing.id}`, values);
        message.success('围栏已更新');
      } else {
        await api.post('/geofences', values);
        message.success('围栏已创建');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      setSelectedPos(null);
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/geofences/${id}`);
    message.success('围栏已删除');
    loadData();
  };

  const openEdit = (f: any) => {
    setEditing(f);
    form.setFieldsValue({
      ...f,
      centerLat: f.center_lat,
      centerLng: f.center_lng,
      deviceIds: f.devices?.map((d: any) => d.id),
    });
    setSelectedPos({ lat: f.center_lat, lng: f.center_lng });
    setMapCenter([f.center_lat, f.center_lng]);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setSelectedPos(null);
    setMapCenter([39.9042, 116.4074]);
    setModalOpen(true);
  };

  const columns = [
    { title: t('geofences.fenceName'), dataIndex: 'name', key: 'name' },
    { title: t('geofences.fenceType'), dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v}</Tag> },
    { title: t('geofences.radius'), dataIndex: 'radius', key: 'radius', render: (v: number) => `${v}m` },
    { title: t('geofences.alarmType'), dataIndex: 'alarm_type', key: 'alarmType', render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> },
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
    <div style={{ height: 'calc(100vh - 112px)' }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Text strong style={{ fontSize: 16 }}>{t('geofences.title')}</Text>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>{t('geofences.addFence')}</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={fences}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? t('common.edit') : t('geofences.addFence')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); setSelectedPos(null); }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space style={{ width: '100%', display: 'flex' }} align="start">
            <div style={{ flex: 1 }}>
              <Form.Item name="name" label={t('geofences.fenceName')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="radius" label={t('geofences.radius')} initialValue={500}>
                <InputNumber min={50} max={50000} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="alarmType" label={t('geofences.alarmType')} initialValue="in_out">
                <Select options={[
                  { value: 'in_out', label: t('geofences.inOut') },
                  { value: 'in', label: t('geofences.in') },
                  { value: 'out', label: t('geofences.out') },
                ]} />
              </Form.Item>
              <Form.Item name="deviceIds" label={t('geofences.bindDevices')}>
                <Select mode="multiple" allowClear placeholder="选择设备" options={devices.map((d: any) => ({ value: d.id, label: d.name }))} />
              </Form.Item>
              <Form.Item name="centerLat" hidden><Input /></Form.Item>
              <Form.Item name="centerLng" hidden><Input /></Form.Item>
            </div>
            <div style={{ width: 300, height: 250 }}>
              <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {selectedPos && (
                  <Circle center={[selectedPos.lat, selectedPos.lng]} radius={form.getFieldValue('radius') || 500} color="#ff4d4f" />
                )}
                {selectedPos && (
                  <Marker position={[selectedPos.lat, selectedPos.lng]} />
                )}
              </MapContainer>
            </div>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
