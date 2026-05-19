import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapTracking from './pages/MapTracking';
import Devices from './pages/Devices';
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<MapTracking />} />
            <Route path="devices" element={<Devices />} />
            <Route path="track" element={<TrackPlayback />} />
            <Route path="geofences" element={<Geofences />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}
