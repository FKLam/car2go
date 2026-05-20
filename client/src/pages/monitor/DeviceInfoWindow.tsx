import { Card, Tag, Typography, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface Device {
  id: string; name: string; last_speed: number;
  last_direction: number; status: string;
  imei?: string; plate_number?: string; model?: string;
  driver_name?: string; battery_level?: number;
  last_online_time?: string;
}

export default function DeviceInfoWindow({ device }: { device: Device }) {
  const { t } = useTranslation();

  const getSpeedColor = (speed: number) => {
    if (speed > 120) return 'red';
    if (speed > 60) return 'orange';
    if (speed > 10) return 'green';
    return 'default';
  };

  const getMovingState = (speed: number, status: string) => {
    if (status !== 'online') return '离线';
    if (speed > 120) return '超速';
    if (speed > 60) return '快速行驶';
    if (speed > 10) return '运动中';
    return '静止';
  };

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14 }}>{device.name || device.id}</Text>
        <Tag color={device.status === 'online' ? 'green' : 'default'} style={{ marginLeft: 8 }}>
          {device.status === 'online' ? '在线' : '离线'}
        </Tag>
      </div>

      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        {device.imei && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>IMEI: {device.imei}</Text></div>
        )}
        {device.plate_number && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>车牌: {device.plate_number}</Text></div>
        )}
        {device.model && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>型号: {device.model}</Text></div>
        )}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>状态: </Text>
          <Tag color={getSpeedColor(device.last_speed)} style={{ fontSize: 11 }}>
            {getMovingState(device.last_speed, device.status)}
          </Tag>
        </div>
        {device.battery_level != null && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>电压: {device.battery_level}%</Text></div>
        )}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            速度/航向: {device.last_speed?.toFixed(1) || 0} km/h / {device.last_direction || 0}°
          </Text>
        </div>
        {device.last_online_time && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>通讯时间: {new Date(device.last_online_time).toLocaleString()}</Text></div>
        )}
        {device.driver_name && (
          <div><Text type="secondary" style={{ fontSize: 12 }}>驾驶员: {device.driver_name}</Text></div>
        )}
      </Space>
    </div>
  );
}
