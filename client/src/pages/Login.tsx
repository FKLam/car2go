import { useState } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, values);
      setAuth(data.token, data.user);
      message.success(mode === 'login' ? '登录成功' : '注册成功');
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const langLabel = i18n.language === 'zh' ? 'EN' : '中文';

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'right', marginBottom: -20 }}>
          <Button type="link" size="small" onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}>
            🌐 {langLabel}
          </Button>
        </div>
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
        <Tabs
          activeKey={mode}
          onChange={(k) => setMode(k as 'login' | 'register')}
          centered
          items={[
            { key: 'login', label: t('auth.login') },
            { key: 'register', label: t('auth.register') },
          ]}
        />
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder={t('auth.username')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
          </Form.Item>
          {mode === 'register' && (
            <>
              <Form.Item name="email">
                <Input prefix={<MailOutlined />} placeholder={t('auth.email')} />
              </Form.Item>
              <Form.Item name="phone">
                <Input prefix={<PhoneOutlined />} placeholder={t('auth.phone')} />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 16 }}>
          演示账号: admin / admin123
        </div>
      </div>
    </div>
  );
}
