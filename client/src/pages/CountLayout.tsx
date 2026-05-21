import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { DashboardOutlined, AlertOutlined, EnvironmentOutlined, ExportOutlined } from '@ant-design/icons';

const subMenuItems = [
  { key: '/count/mileage', icon: <DashboardOutlined />, labelKey: 'count.menuMileage' },
  { key: '/count/alarms', icon: <AlertOutlined />, labelKey: 'count.menuAlarms' },
  { key: '/count/stay-detail', icon: <EnvironmentOutlined />, labelKey: 'count.menuStayDetail' },
  { key: '/count/export', icon: <ExportOutlined />, labelKey: 'count.menuExport' },
];

export default function CountLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = subMenuItems.find((item) => location.pathname.startsWith(item.key))?.key || subMenuItems[0].key;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 112px)' }}>
      <div style={{ width: 180, flexShrink: 0, background: '#001529' }}>
        <Menu mode="inline" theme="dark" selectedKeys={[selectedKey]}
          style={{ height: '100%', borderRight: 0, background: '#001529' }}
          items={subMenuItems.map((item) => ({ key: item.key, icon: item.icon, label: t(item.labelKey) }))}
          onClick={({ key }) => navigate(key)} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#f5f5f5' }}>
        <Outlet />
      </div>
    </div>
  );
}
