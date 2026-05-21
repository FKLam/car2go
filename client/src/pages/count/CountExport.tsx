import { Button, Form, Input, Select, Space, Tree, Typography } from 'antd';
import { FolderOpenOutlined, InfoCircleOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const agentTree = [
  {
    title: '体验账号 (6/总9)',
    key: 'agent-0',
    icon: <FolderOpenOutlined />,
    children: [
      { title: '杭州帅骑科技有限公司 (1/总3)', key: 'agent-1', icon: <UsergroupAddOutlined /> },
      { title: 'wangzhe (0/总0)', key: 'agent-2', icon: <UsergroupAddOutlined /> },
      { title: '姬姬 (0/总0)', key: 'agent-3', icon: <UsergroupAddOutlined /> },
      { title: '34 (0/总0)', key: 'agent-4', icon: <UsergroupAddOutlined /> },
      { title: '测试1234A (0/总0)', key: 'agent-5', icon: <UsergroupAddOutlined /> },
      { title: 'dsfsd (0/总0)', key: 'agent-6', icon: <UsergroupAddOutlined /> },
      { title: '1234254 (0/总0)', key: 'agent-7', icon: <UsergroupAddOutlined /> },
      { title: '1234 (0/总0)', key: 'agent-8', icon: <UsergroupAddOutlined /> },
      { title: '露县公安局 (0/总0)', key: 'agent-9', icon: <UsergroupAddOutlined /> },
      { title: '888 (0/总0)', key: 'agent-10', icon: <UsergroupAddOutlined /> },
    ],
  },
];

export default function CountExport() {
  const [form] = Form.useForm();
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} colon={false} style={{ marginTop: 4 }}>
        <Form.Item label={<RequiredLabel text="要导出" />} name="exportType">
          <Select placeholder="请选择统计类型" options={[{ value: 'mileage', label: '里程统计' }, { value: 'alarms', label: '报警统计' }, { value: 'stay', label: '停留点详细' }]} />
        </Form.Item>
        <Form.Item label={<RequiredLabel text="时间范围" />} name="dateRange">
          <Space size={140}>
            <Input placeholder="请选择时间范围" style={{ width: 250 }} />
            <Typography.Text type="secondary">最多只能导出7天的数据</Typography.Text>
          </Space>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
          <Typography.Text type="secondary"><InfoCircleOutlined /> 请勾选需要导出设备列表的代理商,最大只能导出50位代理商</Typography.Text>
        </Form.Item>
        <Form.Item label={<RequiredLabel text="勾选代理商" />}>
          <Input placeholder="用户名/用户昵称" style={{ marginBottom: 14 }} />
          <div style={{ height: 220, border: '1px solid #d9d9d9', overflow: 'auto', padding: 12 }}>
            <Tree checkable defaultExpandAll treeData={agentTree} />
          </div>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 10 }}>已勾选0位代理商</Typography.Text>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 7 }} style={{ marginTop: 34 }}>
          <Space size={14}>
            <Button type="primary">提交</Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

function RequiredLabel({ text }: { text: string }) {
  return <span><span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>{text}</span>;
}
