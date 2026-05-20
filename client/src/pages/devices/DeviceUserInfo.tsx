import { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import AgentTreePanel from './AgentTreePanel';

const { Text } = Typography;
const { TextArea } = Input;

export default function DeviceUserInfo() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.put('/devices/userinfo', values);
      message.success('客户资料已更新');
    } catch { message.error('操作失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <AgentTreePanel onSelectAgent={(agent: string) => form.setFieldValue('agent', agent)} />
      <Card style={{ flex: 1, maxWidth: 600 }} title={t('devices.menuUserInfo')}>
        <Form form={form} layout="vertical" onFinish={onFinish} labelCol={{ style: { width: 100 } }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label="用户昵称">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="联系地址">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input type="tel" />
          </Form.Item>
          <Form.Item name="plate_number" label="车牌号">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>修改提交</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
