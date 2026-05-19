import { useEffect, useState, useCallback } from 'react';
import { Select, Spin, Tag, Typography, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import api from '../api';
import { io, Socket } from 'socket.io-client';

const { Text } = Typography;

// Fix default marker icons for Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const carIcon = L.divIcon({
  html: '<div style="font-size:28px;transform:rotate(0deg)">🚗</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface DevicePosition {
  id: string;
  name: string;
  last_lat: number;
  last_lng: number;
  last_speed: number;
  last_direction: number;
  status: string;
  icon: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}

export default function MapTracking() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DevicePosition[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [center, setCenter] = useState<[number, number]>([39.9042, 116.4074]); // Beijing

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  // Load devices
  const loadDevices = useCallback(async () => {
    try {
      const { data } = await api.get('/gps/latest-all');
      setDevices(data);
      if (data.length > 0 && !selectedDeviceId) {
        const firstOnline = data.find((d: any) => d.status === 'online') || data[0];
        if (firstOnline.last_lat && firstOnline.last_lng) {
          setSelectedDeviceId(firstOnline.id);
          setCenter([firstOnline.last_lat, firstOnline.last_lng]);
        }
      }
    } catch {
      message.error('加载设备列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  // Connect WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io('/', { auth: { token }, transports: ['websocket', 'polling'] });
    setSocket(s);
    s.on('device:position', (pos: any) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === pos.deviceId
            ? { ...d, last_lat: pos.lat, last_lng: pos.lng, last_speed: pos.speed, last_direction: pos.direction, status: 'online' }
            : d
        )
      );
    });
    return () => { s.disconnect(); };
  }, []);

  // Subscribe to device
  useEffect(() => {
    if (socket && selectedDeviceId) {
      socket.emit('subscribe:device', selectedDeviceId);
      return () => { socket.emit('unsubscribe:device', selectedDeviceId); };
    }
  }, [socket, selectedDeviceId]);

  // Load today's track for selected device
  useEffect(() => {
    if (!selectedDeviceId) return;
    const today = new Date().toISOString().split('T')[0];
    api.get(`/tracks/${selectedDeviceId}`, { params: { startTime: `${today}T00:00:00`, limit: 1000 } }).then(({ data }) => {
      setTrack(data.map((r: any) => [r.lat, r.lng] as [number, number]));
    }).catch(() => {});
  }, [selectedDeviceId]);

  // Locate device
  const locateDevice = () => {
    if (selectedDevice?.last_lat && selectedDevice?.last_lng) {
      setCenter([selectedDevice.last_lat, selectedDevice.last_lng]);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  return (
    <div style={{ height: 'calc(100vh - 112px)', position: 'relative' }}>
      <div className="map-panel">
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('map.title')}</Text>
        <Select
          showSearch
          style={{ width: 220 }}
          placeholder={t('map.selectDevice')}
          value={selectedDeviceId}
          onChange={(v) => {
            setSelectedDeviceId(v);
            const d = devices.find((x) => x.id === v);
            if (d?.last_lat && d?.last_lng) setCenter([d.last_lat, d.last_lng]);
          }}
          filterOption={(input, option) => (option?.label as string)?.includes(input)}
          options={devices.map((d) => ({
            value: d.id,
            label: `${d.name || d.id}`,
          }))}
        />
      </div>

      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Device markers */}
        {devices.map((d) =>
          d.last_lat && d.last_lng ? (
            <Marker
              key={d.id}
              position={[d.last_lat, d.last_lng]}
              icon={carIcon}
              eventHandlers={{ click: () => {
                setSelectedDeviceId(d.id);
                setCenter([d.last_lat, d.last_lng]);
              }}}
            >
              <Popup>
                <div>
                  <Text strong>{d.name || d.id}</Text>
                  <br />
                  <Tag color={d.status === 'online' ? 'green' : 'default'}>{d.status}</Tag>
                  <br />
                  {t('map.speedLabel')}: {d.last_speed?.toFixed(1)} km/h
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Today's track */}
        {track.length > 1 && <Polyline positions={track} color="#1677ff" weight={3} />}
      </MapContainer>

      {selectedDevice && (
        <div className="map-device-info">
          <Text strong>{selectedDevice.name}</Text>
          <br />
          <Tag color={selectedDevice.status === 'online' ? 'green' : 'default'}>
            {selectedDevice.status === 'online' ? t('common.online') : t('common.offline')}
          </Tag>
          <br />
          <Text type="secondary">
            {t('map.speedLabel')}: {selectedDevice.last_speed?.toFixed(1) || 0} km/h
          </Text>
          <br />
          <Text type="secondary">
            Lat: {selectedDevice.last_lat?.toFixed(6)}, Lng: {selectedDevice.last_lng?.toFixed(6)}
          </Text>
        </div>
      )}
    </div>
  );
}
