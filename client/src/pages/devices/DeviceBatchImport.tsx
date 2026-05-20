import { useState } from 'react';
import { Card, Button, Upload, Alert, Typography, message } from 'antd';
import { DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import AgentTreePanel from './AgentTreePanel';
import api from '../../api';

const { Text } = Typography;
const { Dragger } = Upload;

export default function DeviceBatchImport() {
  const [file, setFile] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) { message.warning('请先选择文件'); return; }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/devices/batch-import', formData);
      message.success('导入成功');
    } catch { message.error('导入失败'); }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel />
      <Card style={{ flex: 1 }} title="批量修改设备信息">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Alert message="模板使用提示" type="info" showIcon style={{ flex: 1 }} />
          <Button type="primary" icon={<DownloadOutlined />} style={{ marginLeft: 16 }}>下载模板文件</Button>
        </div>
        <Alert message="单次上限5000台" type="warning" style={{ marginBottom: 16 }} />
        <Dragger accept=".xlsx,.xls" height={240} multiple={false}
          beforeUpload={(f) => { setFile(f); return false; }}>
          <CloudUploadOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <p>拖拽或点击上传 Excel 文件</p>
        </Dragger>
        <Button type="primary" onClick={handleUpload} style={{ marginTop: 16 }}>提交</Button>
      </Card>
    </div>
  );
}
