import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, theme } from 'antd';
import {
  DashboardOutlined, EnvironmentOutlined, LaptopOutlined,
  HistoryOutlined, AimOutlined, AlertOutlined,
  UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';

const { Header, Sider, Content } = AntLayout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, labelKey: 'menu.dashboard' },
  { key: '/map', icon: <EnvironmentOutlined />, labelKey: 'menu.map' },
  { key: '/devices', icon: <LaptopOutlined />, labelKey: 'menu.devices' },
  { key: '/track', icon: <HistoryOutlined />, labelKey: 'menu.track' },
  { key: '/geofences', icon: <AimOutlined />, labelKey: 'menu.geofences' },
  { key: '/alerts', icon: <AlertOutlined />, labelKey: 'menu.alerts' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: user?.username || '用户' },
      { key: 'lang', icon: <span>🌐</span>, label: i18n.language === 'zh' ? '切换到 English' : '切换到中文' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') logout();
      if (key === 'lang') {
        i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
      }
    },
  };

  return (
    <AntLayout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="layout-logo">
          {collapsed ? '🚗' : '🚗 车在这儿'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: t(item.labelKey),
          }))}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 24px', background: themeToken.colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/alerts')} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user?.username}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: 16, overflow: 'auto', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
