import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { LaptopOutlined, UserOutlined, UploadOutlined, PictureOutlined, SwapOutlined, ClockCircleOutlined, CreditCardOutlined, FileSearchOutlined, CalendarOutlined, ImportOutlined, CloudServerOutlined } from '@ant-design/icons';

const subMenuItems = [
  { key: '/devices/list', icon: <LaptopOutlined />, labelKey: 'devices.menuList' },
  { key: '/devices/userinfo', icon: <UserOutlined />, labelKey: 'devices.menuUserInfo' },
  { key: '/devices/batch-import', icon: <UploadOutlined />, labelKey: 'devices.menuBatchImport' },
  { key: '/devices/batch-icon', icon: <PictureOutlined />, labelKey: 'devices.menuBatchIcon' },
  { key: '/devices/transform', icon: <SwapOutlined />, labelKey: 'devices.menuTransform' },
  { key: '/devices/update-time', icon: <ClockCircleOutlined />, labelKey: 'devices.menuUpdateTime' },
  { key: '/devices/import-iccid', icon: <CreditCardOutlined />, labelKey: 'devices.menuImportIccid' },
  { key: '/devices/export-iccid', icon: <FileSearchOutlined />, labelKey: 'devices.menuExportIccid' },
  { key: '/devices/update-expire', icon: <CalendarOutlined />, labelKey: 'devices.menuUpdateExpire' },
  { key: '/devices/huaxiang-import', icon: <ImportOutlined />, labelKey: 'devices.menuHuaxiang' },
  { key: '/devices/update-host', icon: <CloudServerOutlined />, labelKey: 'devices.menuUpdateHost' },
];

export default function DeviceLayout() {
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
