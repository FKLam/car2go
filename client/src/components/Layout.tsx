import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Input, Avatar, Space, Table, Modal, Empty, Form, Switch, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, LaptopOutlined,
  HistoryOutlined, AimOutlined, AlertOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, SendOutlined, TeamOutlined, SearchOutlined, FileSearchOutlined, GlobalOutlined,
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
  const [providerOpen, setProviderOpen] = useState(false);
  const [alarmPanelOpen, setAlarmPanelOpen] = useState(false);
  const [languagePanelOpen, setLanguagePanelOpen] = useState(false);
  const [profileForm] = Form.useForm();
  const [providerForm] = Form.useForm();
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
  const mainSidebarItems: MenuProps['items'] = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: t(item.labelKey),
    children: item.children?.map((child) => ({ key: child.key, label: t(child.labelKey) })),
  }));
  const utilitySidebarItems: MenuProps['items'] = [
    { key: '__customer-list', icon: <TeamOutlined />, label: '客户列表' },
    { key: '__language', icon: <GlobalOutlined />, label: '切换语言' },
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
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" className="app-sider">
        <div className="layout-logo">
          {collapsed ? '🚗' : '🚗 车跑起来'}
        </div>
        <div className="app-sider-body">
          <Menu
            className="app-main-menu"
            theme="dark"
            mode="inline"
            defaultOpenKeys={openKeys}
            items={mainSidebarItems}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => navigate(key)}
          />
          <div className="app-menu-divider" />
          <Menu
            className="app-utility-menu"
            theme="dark"
            mode="inline"
            items={utilitySidebarItems}
            selectedKeys={showCustomerList ? ['__customer-list'] : []}
            onClick={({ key }) => {
              if (key === '__customer-list') toggleCustomerList();
              if (key === '__language') setLanguagePanelOpen((open) => !open);
            }}
          />
        </div>
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
                <span onClick={() => { providerForm.setFieldsValue({ providerName: '体验账号', contact: '无', phone: '无', address: '无' }); setProviderOpen(true); }} style={{ cursor: 'pointer' }}>服务商信息</span>
                <span onClick={() => setAlarmPanelOpen((open) => !open)} style={{ cursor: 'pointer' }}>报警信息</span>
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
      {alarmPanelOpen && (
        <div style={{ position: 'fixed', top: 98, right: 12, width: 300, height: 320, zIndex: 2500, background: 'rgba(255,255,255,.9)', borderRadius: 14, boxShadow: '0 8px 24px rgba(15,23,42,.18)', overflow: 'hidden' }}>
          <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(229,231,235,.8)' }}>
            <strong>报警信息</strong>
            <Button type="text" size="small" onClick={() => setAlarmPanelOpen(false)}>×</Button>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(229,231,235,.8)' }}>
            <Switch size="small" />
            <span>声音开关</span>
          </div>
          <div style={{ height: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <FileSearchOutlined style={{ fontSize: 38, color: '#bfbfbf', marginBottom: 8 }} />
            <span>没有查询到相关数据</span>
          </div>
          <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(229,231,235,.8)' }}>
            <Button type="link" onClick={() => { setAlarmPanelOpen(false); navigate('/alerts'); }}>更多...</Button>
          </div>
        </div>
      )}
      {languagePanelOpen && (
        <div style={{ position: 'fixed', left: collapsed ? 88 : 208, bottom: 22, zIndex: 2600, width: 108, background: '#2f3f56', color: '#fff', borderRadius: 4, boxShadow: '0 8px 22px rgba(15,23,42,.28)', padding: '6px 0', fontWeight: 600 }}>
          {[
            ['zh', '简体中文'],
            ['en', 'English'],
            ['id', 'Indonesian'],
            ['vi', 'Việt nam'],
            ['fr', 'En français'],
            ['pt', 'Portugal'],
            ['es', 'Español'],
            ['th', 'แบบไทย'],
            ['km', 'ភាសាខ្មែរ'],
            ['ru', 'Русский'],
            ['my', 'မြန်မာ'],
          ].map(([key, label]) => (
            <div
              key={key}
              onClick={() => {
                if (key === 'zh' || key === 'en') i18n.changeLanguage(key);
                setLanguagePanelOpen(false);
              }}
              style={{ padding: '3px 14px', cursor: 'pointer', lineHeight: '20px', background: i18n.language === key ? 'rgba(255,255,255,.12)' : undefined }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
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
      <Modal
        title="服务商信息"
        open={providerOpen}
        onCancel={() => setProviderOpen(false)}
        footer={null}
        width={600}
        zIndex={3000}
        centered
      >
        <Form form={providerForm} labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} initialValues={{ providerName: '体验账号', contact: '无', phone: '无', address: '无' }}>
          <Form.Item label="服务商名称" name="providerName"><Input /></Form.Item>
          <Form.Item label="服务商联系人" name="contact"><Input /></Form.Item>
          <Form.Item label="服务商电话" name="phone"><Input /></Form.Item>
          <Form.Item label="联系地址" name="address"><Input /></Form.Item>
        </Form>
      </Modal>
    </AntLayout>
  );
}
