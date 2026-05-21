import { Card, Form, Select, DatePicker, Button, Tree, Input, Typography, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const agentTree = [{ title: '体验账号 (6/9)', key: 'agent-0', children: [{ title: '杭州帅骑科技 (1/3)', key: 'agent-1' }] }];

export default function CountExport() {
  const [form] = Form.useForm();
  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <Card size="small" style={{ width: 300, flexShrink: 0 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" style={{ marginBottom: 8 }} />
        <Tree.DirectoryTree treeData={agentTree} defaultExpandAll />
      </Card>
      <Card style={{ flex: 1, maxWidth: 800 }} title="统计数据导出">
        <Form form={form} layout="vertical" labelCol={{ style: { width: 120 } }}>
          <Form.Item label="要导出" name="exportType" rules={[{ required: true }]}>
            <Select placeholder="请选择统计类型" style={{ width: 400 }}
              options={[{ value: 'mileage', label: '里程报表' }, { value: 'alarms', label: '报警报表' }, { value: 'stay', label: '停留分析报表' }]} />
          </Form.Item>
          <Form.Item label="时间范围" name="timeRange" rules={[{ required: true }]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <RangePicker style={{ width: 400 }} placeholder={['开始日期', '结束日期']} />
              <Alert message="最多只能导出7天的数据" type="warning" showIcon style={{ padding: '4px 8px', fontSize: 12 }} />
            </div>
          </Form.Item>
          <Form.Item label="勾选代理商" name="agents" rules={[{ required: true }]}>
            <div>
              <Alert message="请勾选代理商，最大只能导出50位代理商" type="info" showIcon style={{ marginBottom: 8, fontSize: 12 }} />
              <div style={{ width: 400, height: 320, border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'auto', padding: 8 }}>
                <Input prefix={<SearchOutlined />} placeholder="用户名/用户昵称" size="small" style={{ marginBottom: 8 }} />
                <Tree checkable treeData={agentTree} defaultExpandAll />
              </div>
              <Typography.Text style={{ display: 'block', marginTop: 8, color: '#1677ff' }}>已勾选0位代理商</Typography.Text>
            </div>
          </Form.Item>
          <Form.Item style={{ marginLeft: 120, marginTop: 32 }}>
            <Button type="primary" htmlType="submit">提交导出</Button>
            <Button onClick={() => form.resetFields()} style={{ marginLeft: 16 }}>重置表单</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
