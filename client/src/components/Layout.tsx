import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Input, Avatar, Space, Table, Modal, Empty, Form, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, EnvironmentOutlined, LaptopOutlined,
  HistoryOutlined, AimOutlined, AlertOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, SendOutlined, TeamOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { useUiStore } from '../store/ui';
import api from '../api';

const { Header, Sider, Content } = AntLayout;

const menuItems = [
  { key: '/monitor', icon: <DashboardOutlined />, labelKey: 'menu.monitor' },
  {
    key: '/devices', icon: <LaptopOutlined />, labelKey: 'menu.devices', children: [
      { key: '/devices/list', labelKey: 'devices.menuList' },
      { key: '/devices/userinfo', labelKey: 'devices.menuUserInfo' },
      { key: '/devices/batch-import', labelKey: 'devices.menuBatchImport' },
      { key: '/devices/batch-icon', labelKey: 'devices.menuBatchIcon' },
      { key: '/devices/transform', labelKey: 'devices.menuTransform' },
      { key: '/devices/update-time', labelKey: 'devices.menuUpdateTime' },
      { key: '/devices/import-iccid', labelKey: 'devices.menuImportIccid' },
      { key: '/devices/export-iccid', labelKey: 'devices.menuExportIccid' },
      { key: '/devices/update-expire', labelKey: 'devices.menuUpdateExpire' },
      { key: '/devices/huaxiang-import', labelKey: 'devices.menuHuaxiang' },
      { key: '/devices/update-host', labelKey: 'devices.menuUpdateHost' },
    ],
  },
  {
    key: '/count', icon: <BarChartOutlined />, labelKey: 'menu.count', children: [
      { key: '/count/mileage', labelKey: 'count.menuMileage' },
      { key: '/count/alarms', labelKey: 'count.menuAlarms' },
      { key: '/count/stay-detail', labelKey: 'count.menuStayDetail' },
      { key: '/count/export', labelKey: 'count.menuExport' },
    ],
  },
  { key: '/geofences', icon: <AimOutlined />, labelKey: 'menu.geofences' },
  { key: '/commands', icon: <SendOutlined />, labelKey: 'menu.commands' },
  { key: '/alerts', icon: <AlertOutlined />, labelKey: 'menu.alerts' },
  { key: '/track', icon: <HistoryOutlined />, labelKey: 'menu.track' },
];

const routeTitles: Record<string, [string, string?]> = {
  '/monitor': ['监控平台'],
  '/devices/list': ['我的设备', '设备管理'],
  '/devices/userinfo': ['我的设备', '客户资料'],
  '/devices/batch-import': ['我的设备', '批量修改设备信息'],
  '/devices/batch-icon': ['我的设备', '批量修改设备图标'],
  '/devices/transform': ['我的设备', '设备批量转移'],
  '/devices/update-time': ['我的设备', '批量修改设备时间'],
  '/devices/import-iccid': ['我的设备', '导入卡号'],
  '/devices/export-iccid': ['我的设备', '卡号匹配'],
  '/devices/update-expire': ['我的设备', '刷新设备到期时间'],
  '/devices/huaxiang-import': ['我的设备', '华祥管理平台数据导入'],
  '/devices/update-host': ['我的设备', '批量修改主机名'],
  '/count/mileage': ['数据统计', '里程统计'],
  '/count/alarms': ['数据统计', '报警统计'],
  '/count/stay-detail': ['数据统计', '停留点详细'],
  '/count/export': ['数据统计', '统计数据导出'],
  '/geofences': ['电子围栏'],
  '/commands': ['远程指令'],
  '/alerts': ['报警列表'],
  '/track': ['历史轨迹'],
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm] = Form.useForm();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { showCustomerList, toggleCustomerList } = useUiStore();
  const { token: themeToken } = theme.useToken();
  const selectedKey = (location.pathname.startsWith('/count/') || location.pathname.startsWith('/devices/')) ? location.pathname : location.pathname;
  const isMapWorkspace = location.pathname === '/monitor' || location.pathname === '/track';
  const openKeys = [
    ...(location.pathname.startsWith('/devices') ? ['/devices'] : []),
    ...(location.pathname.startsWith('/count') ? ['/count'] : []),
  ];
  const [mainTitle, subTitle] = routeTitles[location.pathname] || ['监控平台'];
  const filteredSearchResults = useMemo(() => {
    if (!searchKeyword) return searchResults;
    return searchResults.filter((item) => item.imei?.includes(searchKeyword) || item.name?.includes(searchKeyword) || item.plate_number?.includes(searchKeyword));
  }, [searchKeyword, searchResults]);
  const sidebarItems: MenuProps['items'] = [
    ...menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: t(item.labelKey),
    children: item.children?.map((child) => ({ key: child.key, label: t(child.labelKey) })),
    })),
    { type: 'divider' as const },
    { key: '__customer-list', icon: <TeamOutlined />, label: '客户列表' },
  ];

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

  const openSearch = () => {
    setSearchOpen(true);
    if (searchResults.length === 0) searchDevices();
  };

  const searchDevices = async () => {
    setSearchLoading(true);
    try {
      const { data } = await api.get('/devices', { params: searchKeyword ? { search: searchKeyword } : undefined });
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <AntLayout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="layout-logo">
          {collapsed ? '🚗' : '🚗 车跑起来'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={openKeys}
          style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', overflowX: 'hidden' }}
          items={sidebarItems}
          selectedKeys={showCustomerList ? [selectedKey, '__customer-list'] : [selectedKey]}
          onClick={({ key }) => {
            if (key === '__customer-list') toggleCustomerList();
            else navigate(key);
          }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: isMapWorkspace ? '8px 12px' : '8px 10px', background: isMapWorkspace ? 'transparent' : '#eef3f7', height: 90, borderBottom: 0, lineHeight: 'normal' }}>
          <div style={{ height: '100%', borderRadius: 18, background: isMapWorkspace ? 'rgba(255,255,255,.82)' : themeToken.colorBgContainer, boxShadow: '0 2px 10px rgba(15,23,42,.08)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 24, overflow: 'hidden' }}>
            <Space size={18} style={{ flex: '0 0 520px', minWidth: 520, whiteSpace: 'nowrap' }}>
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
              <span style={{ fontWeight: 700 }}>{mainTitle}</span>
              {subTitle && <><span style={{ color: '#9ca3af' }}>/</span><span>{subTitle}</span></>}
              <Input prefix={<SearchOutlined />} placeholder="搜索设备" readOnly onClick={openSearch} style={{ width: 240, borderRadius: 24, background: '#f7f7f7', cursor: 'pointer' }} />
            </Space>

            <div style={{ flex: 1, textAlign: 'center', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Space split={<span style={{ color: '#555' }}>|</span>}>
                <span onClick={() => { profileForm.setFieldsValue({ username: user?.username || '体验账号', nickname: user?.username || '体验账号' }); setProfileOpen(true); }} style={{ cursor: 'pointer' }}>客户资料</span>
                <span>服务商信息</span>
                <span>报警信息</span>
              </Space>
            </div>

            <Space size={12} style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 600 }}>切换旧版</span>
              <Avatar size={30} style={{ background: '#5ca9ff' }} icon={<UserOutlined />} />
              <Dropdown menu={userMenu} placement="bottomRight">
                <Button type="text" style={{ fontWeight: 600 }}>{user?.username || '体验账号'}</Button>
              </Dropdown>
              <Badge count={3} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/alerts')} />
              </Badge>
              <LogoutOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={logout} />
            </Space>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: isMapWorkspace ? 0 : 16, overflow: 'auto', background: isMapWorkspace ? '#fff' : '#f5f5f5' }}>
          <Outlet />
        </Content>
      </AntLayout>
      <Modal
        title="查询设备"
        open={searchOpen}
        onCancel={() => setSearchOpen(false)}
        footer={null}
        width={900}
        zIndex={3000}
        centered
        destroyOnClose={false}
        styles={{ body: { paddingTop: 12 } }}
      >
        <Space size={22} style={{ marginBottom: 8 }}>
          <span>关键字</span>
          <Input
            placeholder="IMEI/设备名称/车牌号"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onPressEnter={searchDevices}
            style={{ width: 250 }}
          />
          <Button type="primary" onClick={searchDevices}>查询</Button>
        </Space>
        <Table
          size="small"
          loading={searchLoading}
          dataSource={filteredSearchResults}
          rowKey={(record) => record.id || record.imei}
          pagination={false}
          locale={{ emptyText: <Empty description="没有查询到相关数据" /> }}
          scroll={{ y: 360 }}
          columns={[
            { title: 'IMEI号', dataIndex: 'imei', align: 'center' as const, render: (value: string) => value || '-' },
            { title: '用户名', dataIndex: 'driver_name', align: 'center' as const, render: (value: string) => value || user?.username || '-' },
            { title: '设备名称', dataIndex: 'name', align: 'center' as const, render: (value: string) => value || '-' },
            { title: '车牌号', dataIndex: 'plate_number', align: 'center' as const, render: (value: string) => value || '-' },
            { title: '操作', key: 'action', align: 'center' as const, render: (_: unknown, record: any) => <Button size="small" type="link" onClick={() => { setSearchOpen(false); navigate('/monitor'); }}>查看</Button> },
          ]}
        />
      </Modal>
      <Modal
        title="客户资料"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={null}
        width={600}
        zIndex={3000}
        centered
      >
        <Form form={profileForm} labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} initialValues={{ username: user?.username || '体验账号', nickname: user?.username || '体验账号' }}>
          <Form.Item label="用户名" name="username"><Input /></Form.Item>
          <Form.Item label="用户昵称" name="nickname"><Input /></Form.Item>
          <Form.Item label="联系地址" name="address"><Input placeholder="请输入联系地址" /></Form.Item>
          <Form.Item label="服务商联系人" name="serviceContact"><Input placeholder="请输入服务商联系人" /></Form.Item>
          <Form.Item label="联系电话" name="phone"><Input placeholder="请输入联系电话" /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input placeholder="请输入邮箱" /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={4} placeholder="请输入备注" /></Form.Item>
          <Form.Item wrapperCol={{ offset: 10 }}>
            <Button type="primary" onClick={() => setProfileOpen(false)}>修改</Button>
          </Form.Item>
        </Form>
      </Modal>
    </AntLayout>
  );
}
