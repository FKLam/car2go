import { useState } from 'react';
import { Card, Button, Input, Typography, message } from 'antd';
import AgentTreePanel from './AgentTreePanel';
import api from '../../api';

const { Text } = Typography;
const { TextArea } = Input;

export default function DeviceTransform() {
  const [imeis, setImeis] = useState('');
  const [agent, setAgent] = useState('体验账号');

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel onSelectAgent={(a) => setAgent(a)} />
      <Card style={{ flex: 1, maxWidth: 800 }} title="设备批量转移">
        <div style={{ marginBottom: 16 }}>
          <Text strong>代理商：</Text>
          <Text strong style={{ marginLeft: 8 }}>{agent}</Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>IMEI号：</Text>
          <TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" value={imeis}
            onChange={(e) => setImeis(e.target.value)} />
        </div>
        <Button type="primary" onClick={async () => {
          try { await api.post('/devices/transform', { imeis: imeis.split('\n').filter(Boolean), agent }); message.success('转移成功'); }
          catch { message.error('操作失败'); }
        }}>提交</Button>
      </Card>
    </div>
  );
}
