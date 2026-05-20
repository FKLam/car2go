import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapTracking from './pages/MapTracking';
import MonitorHome from './pages/MonitorHome';
import DeviceLayout from './pages/DeviceLayout';
import DeviceList from './pages/devices/DeviceList';
import DeviceUserInfo from './pages/devices/DeviceUserInfo';
import DeviceBatchImport from './pages/devices/DeviceBatchImport';
import DeviceBatchIcon from './pages/devices/DeviceBatchIcon';
import DeviceTransform from './pages/devices/DeviceTransform';
import DeviceUpdateTime from './pages/devices/DeviceUpdateTime';
import DeviceImportIccid from './pages/devices/DeviceImportIccid';
import DeviceExportIccid from './pages/devices/DeviceExportIccid';
import DeviceUpdateExpire from './pages/devices/DeviceUpdateExpire';
import HuaXiangImport from './pages/devices/HuaXiangImport';
import DeviceUpdateHost from './pages/devices/DeviceUpdateHost';
import TrackPlayback from './pages/TrackPlayback';
import Geofences from './pages/Geofences';
import Alerts from './pages/Alerts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
      <AntApp>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/monitor" replace />} />
            <Route path="monitor" element={<MonitorHome />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<MapTracking />} />
            <Route path="devices" element={<DeviceLayout />}>
            <Route index element={<Navigate to="/devices/list" replace />} />
            <Route path="list" element={<DeviceList />} />
            <Route path="userinfo" element={<DeviceUserInfo />} />
            <Route path="batch-import" element={<DeviceBatchImport />} />
            <Route path="batch-icon" element={<DeviceBatchIcon />} />
            <Route path="transform" element={<DeviceTransform />} />
            <Route path="update-time" element={<DeviceUpdateTime />} />
            <Route path="import-iccid" element={<DeviceImportIccid />} />
            <Route path="export-iccid" element={<DeviceExportIccid />} />
            <Route path="update-expire" element={<DeviceUpdateExpire />} />
            <Route path="huaxiang-import" element={<HuaXiangImport />} />
            <Route path="update-host" element={<DeviceUpdateHost />} />
          </Route>
            <Route path="track" element={<TrackPlayback />} />
            <Route path="geofences" element={<Geofences />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}
