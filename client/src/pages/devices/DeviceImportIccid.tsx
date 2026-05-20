import { Card, Button, Upload, Input, Table, Empty, Typography } from 'antd';
import { DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import AgentTreePanel from './AgentTreePanel';

const { Dragger } = Upload;

export default function DeviceImportIccid() {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1 }} title="导入卡号">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Text type="secondary">卡号引导提示</Typography.Text>
          <Button type="primary" icon={<DownloadOutlined />}>下载模板文件</Button>
        </div>
        <Dragger accept=".xlsx,.xls" height={180} multiple={false}>
          <CloudUploadOutlined style={{ fontSize: 36 }} />
          <p>拖拽上传 Excel 文件</p>
        </Dragger>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
          <Typography.Text>检索前缀:</Typography.Text>
          <Input placeholder="请输入Iccid" style={{ width: 200 }} />
          <Button type="primary">查询</Button>
        </div>
        <Table style={{ marginTop: 12 }} columns={[
          { title: '设备卡号(SIM卡号)', dataIndex: 'simCard' },
          { title: 'iccid', dataIndex: 'iccid' },
        ]} dataSource={[]} locale={{ emptyText: <Empty description="没有查询到相关数据" /> }} />
      </Card>
    </div>
  );
}
