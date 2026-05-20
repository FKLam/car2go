import { Card, Button, Select, Input, Typography, Alert } from 'antd';
import AgentTreePanel from './AgentTreePanel';

const { Text } = Typography;
const { TextArea } = Input;

export default function DeviceUpdateTime() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1, maxWidth: 800 }} title="批量修改设备时间">
        <Alert message="策略影响说明" type="info" style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 16 }}><Text strong>时间类型：</Text><Input value="用户到期" disabled style={{ width: 200 }} /></div>
        <div style={{ marginBottom: 16 }}><Text strong>IMEI号：</Text><TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" /></div>
        <div style={{ marginBottom: 16 }}><Text strong>到期时间：</Text>
          <Select defaultValue="half-year" style={{ width: 200 }} options={[{ value: 'half-year', label: '半年' }, { value: 'one-year', label: '一年' }]} />
        </div>
        <Button type="primary">提交</Button>
      </Card>
    </div>
  );
}
