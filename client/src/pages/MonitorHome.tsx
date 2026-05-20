import { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Spin, message } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import api from '../api';
import { io, Socket } from 'socket.io-client';
import DeviceSearchPanel from './monitor/DeviceSearchPanel';
import MapToolbox from './monitor/MapToolbox';
import DeviceInfoWindow from './monitor/DeviceInfoWindow';
import StatusBadge from './monitor/StatusBadge';

// Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const CAR_ICON = L.divIcon({
  html: '<div style="font-size:28px;transform:rotate(0deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🚗</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
});
const STOPPED_ICON = L.divIcon({
  html: '<div style="font-size:28px;transform:rotate(0deg);filter:drop-shadow(0 2px 4px rgba(255,0,0,0.3))">🚗</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
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

export default function MonitorHome() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DevicePosition[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DevicePosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [center, setCenter] = useState<[number, number]>([39.9042, 116.4074]);
  const [showDeviceNames, setShowDeviceNames] = useState(true);
  const [mapSource, setMapSource] = useState<string>('osm');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!autoRefresh) return;
    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) { loadDevices(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh]);

  const loadDevices = useCallback(async () => {
    try {
      const { data } = await api.get('/gps/latest-all');
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        const first = data.find((d: any) => d.status === 'online') || data[0];
        if (first.last_lat && first.last_lng) {
          setSelectedDevice(first);
          setCenter([first.last_lat, first.last_lng]);
        }
      }
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDevices(); }, []);

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

  const handleSelect = (d: DevicePosition) => {
    setSelectedDevice(d);
    if (d.last_lat && d.last_lng) setCenter([d.last_lat, d.last_lng]);
  };

  const mapTileUrl = mapSource === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  if (loading) return <Spin size="large" style={{ display:'flex', justifyContent:'center', marginTop:100 }} />;

  return (
    <div style={{ height: 'calc(100vh - 112px)', position: 'relative', width: '100%' }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}>
        <FitBoundsOnLoad center={center} />
        <TileLayer attribution='&copy; OSM' url={mapTileUrl} />
        {devices.map((d) =>
          d.last_lat && d.last_lng ? (
            <Marker key={d.id} position={[d.last_lat, d.last_lng]}
              icon={d.status === 'online' ? CAR_ICON : STOPPED_ICON}
              eventHandlers={{ click: () => handleSelect(d) }}>
              <Popup><DeviceInfoWindow device={d} /></Popup>
            </Marker>
          ) : null
        )}
        {track.length > 1 && <Polyline positions={track} color="#1677ff" weight={3} />}
      </MapContainer>

      <DeviceSearchPanel devices={devices} selectedDevice={selectedDevice} onSelect={handleSelect} />
      <MapToolbox refreshCountdown={refreshCountdown} showDeviceNames={showDeviceNames}
        onToggleNames={setShowDeviceNames} mapSource={mapSource} onMapSourceChange={setMapSource}
        autoRefresh={autoRefresh} onAutoRefreshChange={setAutoRefresh} />
      <div style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }}>
        <Button shape="circle" icon={<span>📏</span>} title="测距" size="small" />
      </div>
      <StatusBadge device={selectedDevice} />
    </div>
  );
}
