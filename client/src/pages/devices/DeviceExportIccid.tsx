import { Card, Button, Input, Typography } from 'antd';
import AgentTreePanel from './AgentTreePanel';

const { TextArea } = Input;

export default function DeviceExportIccid() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1, maxWidth: 800 }} title="卡号匹配">
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>IMEI号：</Typography.Text>
          <TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" />
        </div>
        <Button type="primary">提交</Button>
        <Button style={{ marginLeft: 12 }}>重置</Button>
      </Card>
    </div>
  );
}
