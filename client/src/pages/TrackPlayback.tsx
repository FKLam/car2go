import { useEffect, useState, useRef } from 'react';
import { Select, DatePicker, Button, Slider, Table, Card, Spin, Typography, Space, Statistic, Row, Col } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import api from '../api';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function TrackPlayback() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<any[]>([]);
  const [filteredTrack, setFilteredTrack] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [timeRange, setTimeRange] = useState<[string, string]>([
    dayjs().subtract(1, 'day').toISOString(),
    dayjs().toISOString(),
  ]);
  const timerRef = useRef<any>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get('/devices').then(({ data }) => setDevices(data));
  }, []);

  const loadTrack = async () => {
    if (!selectedDeviceId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/tracks/${selectedDeviceId}`, {
        params: { startTime: timeRange[0], endTime: timeRange[1], limit: 5000 },
      });
      setTrackData(data);
      setFilteredTrack(data);
      // Calculate summary
      let dist = 0;
      let maxSpd = 0;
      for (let i = 1; i < data.length; i++) {
        const d = getDistance(data[i-1].lat, data[i-1].lng, data[i].lat, data[i].lng);
        dist += d;
        if (data[i].speed > maxSpd) maxSpd = data[i].speed;
      }
      setSummary({ distance: Math.round(dist), maxSpeed: Math.round(maxSpd), points: data.length });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrack(); }, [selectedDeviceId, timeRange]);

  const startPlayback = () => {
    if (trackData.length === 0) return;
    setPlaying(true);
    let idx = 0;
    const len = trackData.length;
    timerRef.current = setInterval(() => {
      idx += speed;
      if (idx >= len) {
        idx = len - 1;
        setPlaying(false);
        clearInterval(timerRef.current);
      }
      setProgress(Math.round((idx / (len - 1)) * 100));
      setCurrentPos([trackData[Math.floor(idx)]?.lat, trackData[Math.floor(idx)]?.lng]);
    }, 200);
  };

  const pausePlayback = () => {
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopPlayback = () => {
    setPlaying(false);
    setProgress(0);
    setCurrentPos(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Card size="small">
        <Space wrap>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder={t('track.selectDevice')}
            value={selectedDeviceId}
            onChange={setSelectedDeviceId}
            filterOption={(input, option) => (option?.label as string)?.includes(input)}
            options={devices.map((d: any) => ({ value: d.id, label: d.name }))}
          />
          <RangePicker
            showTime
            value={[dayjs(timeRange[0]), dayjs(timeRange[1])]}
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) {
                setTimeRange([dates[0].toISOString(), dates[1].toISOString()]);
              }
            }}
          />
          <Button icon={<PlayCircleOutlined />} onClick={startPlayback} disabled={playing || trackData.length === 0}>
            {t('track.play')}
          </Button>
          <Button icon={<PauseCircleOutlined />} onClick={pausePlayback} disabled={!playing}>
            {t('track.pause')}
          </Button>
          <Button icon={<StopOutlined />} onClick={stopPlayback} disabled={!playing && progress === 0}>
            {t('track.stop')}
          </Button>
          <span style={{ marginLeft: 16 }}>{t('track.speed')}: {speed}x</span>
          <Slider style={{ width: 100 }} min={1} max={10} value={speed} onChange={setSpeed} />
        </Space>
        {summary && (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col><Statistic title={t('track.distance')} value={`${(summary.distance / 1000).toFixed(1)} km`} /></Col>
            <Col><Statistic title={t('track.speed')} value={`${summary.maxSpeed} km/h`} /></Col>
            <Col><Statistic title="轨迹点" value={summary.points} /></Col>
          </Row>
        )}
        <div className="track-progress">
          <Slider value={progress} disabled />
        </div>
      </Card>
      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }} />
        ) : filteredTrack.length > 0 ? (
          <MapContainer
            center={[filteredTrack[0].lat, filteredTrack[0].lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={filteredTrack.map((r: any) => [r.lat, r.lng])}
              color="#1677ff"
              weight={3}
            />
            {currentPos && (
              <Marker position={currentPos}>
                <Popup>{t('track.speed')}: {trackData[Math.floor(progress / 100 * (trackData.length - 1))]?.speed} km/h</Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="secondary">{t('track.noData')}</Text>
          </div>
        )}
      </div>
    </div>
  );
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
