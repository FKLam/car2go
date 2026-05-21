import { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Checkbox, Spin, message } from 'antd';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import { io } from 'socket.io-client';
import DeviceSearchPanel from './monitor/DeviceSearchPanel';
import MapToolbox from './monitor/MapToolbox';
import StatusBadge from './monitor/StatusBadge';
import { useUiStore } from '../store/ui';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const CAR_ICON = L.divIcon({
  html: '<div style="width:58px;height:58px;border-radius:50%;background:#4b7cff;display:flex;align-items:center;justify-content:center;border:5px solid rgba(255,255,255,.92);box-shadow:0 8px 18px rgba(40,85,220,.35);font-size:28px;color:white">🚙</div>',
  className: '', iconSize: [58, 58], iconAnchor: [29, 29],
});

const STOPPED_ICON = L.divIcon({
  html: '<div style="width:58px;height:58px;border-radius:50%;background:#4b7cff;display:flex;align-items:center;justify-content:center;border:5px solid rgba(255,255,255,.92);box-shadow:0 8px 18px rgba(40,85,220,.35);font-size:28px;color:white">🚙</div>',
  className: '', iconSize: [58, 58], iconAnchor: [29, 29],
});

interface DevicePosition {
  id: string; name: string; last_lat: number; last_lng: number;
  last_speed: number; last_direction: number; status: string; icon: string;
  imei?: string; plate_number?: string; model?: string;
  driver_name?: string; driver_phone?: string;
  battery_level?: number; last_online_time?: string;
}

function FitBoundsOnLoad({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center, map]);
  return null;
}

function DeviceInfoMapOverlay({ device, onClose }: { device: DevicePosition | null; onClose: () => void }) {
  const map = useMap();
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!device?.last_lat || !device?.last_lng) {
      setPoint(null);
      return;
    }
    const updatePoint = () => {
      const next = map.latLngToContainerPoint([device.last_lat, device.last_lng]);
      setPoint({ x: next.x, y: next.y });
    };
    updatePoint();
    map.on('move zoom resize', updatePoint);
    return () => { map.off('move zoom resize', updatePoint); };
  }, [device, map]);

  if (!device || !point) return null;

  return (
    <div style={{ position: 'absolute', left: point.x, top: point.y, transform: 'translate(-50%, calc(-100% - 42px))', zIndex: 1200, pointerEvents: 'auto' }}>
      <DeviceInfoPopup device={device} onClose={onClose} />
      <div style={{ width: 18, height: 18, background: '#fff', transform: 'rotate(45deg)', position: 'absolute', left: '50%', bottom: -8, marginLeft: -9, boxShadow: '3px 3px 8px rgba(15,23,42,.08)' }} />
    </div>
  );
}

export default function MonitorHome() {
  const [devices, setDevices] = useState<DevicePosition[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DevicePosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [center, setCenter] = useState<[number, number]>([31.4912, 120.3119]);
  const [showDeviceNames, setShowDeviceNames] = useState(true);
  const [mapSource, setMapSource] = useState<string>('osm');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showBusLine, setShowBusLine] = useState(false);
  const [popupDeviceId, setPopupDeviceId] = useState<string | null>(null);
  const showCustomerList = useUiStore((state) => state.showCustomerList);
  const timerRef = useRef<any>(null);

  const loadDevices = useCallback(async () => {
    try {
      const { data } = await api.get('/gps/latest-all');
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        const first = data.find((d: any) => d.status === 'online') || data[0];
        if (first.last_lat && first.last_lng) {
          setSelectedDevice(first);
          setPopupDeviceId(first.id);
          setCenter([first.last_lat, first.last_lng]);
        }
      }
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) { loadDevices(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, loadDevices]);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io('/', { auth: { token }, transports: ['websocket', 'polling'] });
    s.on('device:position', (pos: any) => {
      setDevices((prev) => prev.map((d) =>
        d.id === pos.deviceId ? { ...d, last_lat: pos.lat, last_lng: pos.lng, last_speed: pos.speed, last_direction: pos.direction, status: 'online' } : d
      ));
    });
    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;
    const today = new Date().toISOString().split('T')[0];
    api.get(`/tracks/${selectedDevice.id}`, { params: { startTime: `${today}T00:00:00`, limit: 1000 } })
      .then(({ data }) => setTrack(data.map((r: any) => [r.lat, r.lng])))
      .catch(() => {});
  }, [selectedDevice]);

  const handleSelect = (device: DevicePosition) => {
    setSelectedDevice(device);
    setPopupDeviceId((current) => current === device.id ? null : device.id);
    if (device.last_lat && device.last_lng) setCenter([device.last_lat, device.last_lng]);
  };

  const handlePanelSelect = (device: DevicePosition) => {
    setSelectedDevice(device);
    setPopupDeviceId(device.id);
    if (device.last_lat && device.last_lng) setCenter([device.last_lat, device.last_lng]);
  };

  const mapTileUrl = mapSource === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  return (
    <div style={{ height: 'calc(100vh - 90px)', position: 'relative', width: '100%' }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }} zoomControl={false}>
        <FitBoundsOnLoad center={center} />
        <TileLayer attribution="&copy; OSM" url={mapTileUrl} />
        {devices.map((device) => device.last_lat && device.last_lng ? (
          <Marker
            key={device.id}
            position={[device.last_lat, device.last_lng]}
            icon={device.status === 'online' ? CAR_ICON : STOPPED_ICON}
            eventHandlers={{ click: () => handleSelect(device) }}
          >
          </Marker>
        ) : null)}
        {track.length > 1 && <Polyline positions={track} color="#1677ff" weight={3} />}
        <DeviceInfoMapOverlay device={selectedDevice && popupDeviceId === selectedDevice.id ? selectedDevice : null} onClose={() => setPopupDeviceId(null)} />
      </MapContainer>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, zIndex: 1000, background: 'rgba(80,86,99,.72)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: showCustomerList ? 360 : 14, paddingRight: 14, fontSize: 14 }}>
        <div>设备位置信息: 江苏省无锡市新吴区旺庄街道新梅路(无锡阿尔梅新材料有限公司内三达精密五金制造公司内0米)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{refreshCountdown}后刷新</span>
          <Checkbox checked={showDeviceNames} onChange={(event) => setShowDeviceNames(event.target.checked)} style={{ color: '#fff' }}>显示设备名</Checkbox>
          <MapToolbox refreshCountdown={refreshCountdown} showDeviceNames={showDeviceNames} onToggleNames={setShowDeviceNames} mapSource={mapSource} onMapSourceChange={setMapSource} autoRefresh={autoRefresh} onAutoRefreshChange={setAutoRefresh} />
        </div>
      </div>

      <DeviceSearchPanel devices={devices} selectedDevice={selectedDevice} onSelect={handlePanelSelect} />
      <div style={{ position: 'absolute', left: showCustomerList ? 360 : 14, top: 120, zIndex: 1000, background: 'rgba(255,255,255,.9)', borderRadius: 4, padding: '8px 12px', boxShadow: '0 1px 6px rgba(0,0,0,.12)' }}>
        <Checkbox checked={showBusLine} onChange={(event) => setShowBusLine(event.target.checked)}>公交路线</Checkbox>
      </div>
      <div style={{ position: 'absolute', right: 8, top: 90, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button icon={<span>📏</span>} title="测距" />
        <Button icon={<span style={{ fontSize: 18 }}>○</span>} title="范围" />
      </div>
      <StatusBadge device={selectedDevice} />
    </div>
  );
}

function DeviceInfoPopup({ device, onClose }: { device: DevicePosition; onClose: () => void }) {
  return (
    <div style={{ width: 420, background: '#fff', borderRadius: 18, boxShadow: '0 10px 26px rgba(15,23,42,.22)', overflow: 'hidden' }}>
      <div style={{ height: 52, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative' }}>
        <Button type="primary" shape="round" style={{ background: '#ff9047' }}>指令</Button>
        <Button type="primary" shape="round" style={{ background: '#45a6ff' }}>轨迹</Button>
        <Button type="primary" shape="round">设备信息</Button>
        <span onClick={onClose} style={{ position: 'absolute', right: 14, top: 11, cursor: 'pointer', color: '#777', fontSize: 20 }}>×</span>
      </div>
      <div style={{ padding: '12px 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8, fontSize: 14 }}>
        <span>IMEI号:{device.imei || '862371741097523'}</span>
        <span>定位类型:北斗</span>
        <span>设备名:{device.name || '4'}</span>
        <span>时速:{Math.round(device.last_speed || 0)}KM/H</span>
        <span>车牌号:{device.plate_number || '0544202917'}</span>
        <span>航向:西北</span>
        <span>设备类型:{device.model || '4G17'}</span>
        <span>通讯时间:2026-05-21 22:30:40</span>
        <span>状态:静止45分钟</span>
        <span>定位时间:2026-05-21 21:45:08</span>
        <span>电压:12.7V</span>
      </div>
      <div style={{ padding: '0 66px 16px' }}>
        <Button type="primary" block shape="round" size="large" style={{ background: 'linear-gradient(90deg,#49b7ff,#3851ff)' }}>跳转地图</Button>
      </div>
    </div>
  );
}
