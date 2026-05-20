import { useState } from 'react';
import { Card, Button, Radio, Input, Typography, message } from 'antd';
import AgentTreePanel from './AgentTreePanel';
import api from '../../api';

const { Text } = Typography;
const { TextArea } = Input;

const ICONS = [
  { label: '轿车', value: 'car' }, { label: '摩托车', value: 'motorcycle' },
  { label: '客车', value: 'bus' }, { label: '卡车', value: 'truck' },
  { label: '警车', value: 'police' }, { label: '轮船', value: 'ship' },
  { label: '人员', value: 'person' }, { label: '宠物', value: 'pet' },
];

export default function DeviceBatchIcon() {
  const [icon, setIcon] = useState('car');
  const [imeis, setImeis] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('/devices/batch-icon', { icon, imeis: imeis.split('\n').filter(Boolean) });
      message.success('批量修改成功');
    } catch { message.error('操作失败'); }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1, maxWidth: 800 }} title="批量修改设备图标">
        <div style={{ marginBottom: 16 }}>
          <Text strong>标识图标：</Text>
          <Radio.Group value={icon} onChange={(e) => setIcon(e.target.value)} style={{ marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {ICONS.map((item) => (
                <Radio.Button key={item.value} value={item.value} style={{ textAlign: 'center' }}>
                  {item.label}
                </Radio.Button>
              ))}
            </div>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>IMEI号：</Text>
          <TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" value={imeis}
            onChange={(e) => setImeis(e.target.value)} />
        </div>
        <Button type="primary" onClick={handleSubmit}>提交</Button>
      </Card>
    </div>
  );
}
