import { Card, Button, Upload, Typography } from 'antd';
import { DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import AgentTreePanel from './AgentTreePanel';

const { Dragger } = Upload;

export default function HuaXiangImport() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1 }} title="华祥管理平台数据导入">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Text type="secondary">为了保证上传无误，请使用提供的模板</Typography.Text>
          <Button type="primary" icon={<DownloadOutlined />}>下载模板文件</Button>
        </div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>最多只能操作500台设备</Typography.Text>
        <Dragger accept=".xlsx,.xls" height={240} multiple={false}>
          <CloudUploadOutlined style={{ fontSize: 48 }} />
          <p>上传Excel文件</p>
        </Dragger>
        <Button type="primary" style={{ marginTop: 16 }}>提交</Button>
      </Card>
    </div>
  );
}
