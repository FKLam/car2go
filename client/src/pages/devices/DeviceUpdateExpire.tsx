import { Card, Button, Select, Input, Alert, Typography } from 'antd';
import AgentTreePanel from './AgentTreePanel';

const { TextArea } = Input;

export default function DeviceUpdateExpire() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1, maxWidth: 800 }} title="刷新设备到期时间">
        <Alert message="该功能会使系统根据设备的激活时间来重新校准..." type="info" style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>IMEI号：</Typography.Text>
          <TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>使用期限：</Typography.Text>
          <Select defaultValue="half-year" style={{ width: 200 }} options={[{ value: 'half-year', label: '半年' }, { value: 'one-year', label: '一年' }]} />
        </div>
        <Button type="primary">提交</Button>
      </Card>
    </div>
  );
}
