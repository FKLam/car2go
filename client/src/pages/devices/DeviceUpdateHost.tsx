import { Card, Button, Select, Radio, Input, Typography } from 'antd';
import AgentTreePanel from './AgentTreePanel';

const { TextArea } = Input;

export default function DeviceUpdateHost() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1, maxWidth: 800 }} title="批量修改主机名">
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>设备类型：</Typography.Text>
          <Select defaultValue="4G27" style={{ width: 200 }} options={[{ value: '4G27', label: '4G27' }]} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>IMEI号：</Typography.Text>
          <TextArea rows={6} placeholder="如果需要输入多个IMEI，请换行输入" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>操作类型：</Typography.Text>
          <Radio.Group defaultValue="default">
            <Radio value="default">默认</Radio>
            <Radio value="custom">自定义</Radio>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>转移类型：</Typography.Text>
          <Radio.Group defaultValue="server">
            <Radio value="server">server</Radio>
            <Radio value="qserver">qserver</Radio>
            <Radio value="gserver">gserver</Radio>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>ip/域名：</Typography.Text>
          <Input placeholder="请输入ip/域名" style={{ width: 240 }} />
          <Typography.Text type="secondary" style={{ marginLeft: 12 }}>输入格式：0.0.0.0:8080</Typography.Text>
        </div>
        <Button type="primary">提交</Button>
      </Card>
    </div>
  );
}
