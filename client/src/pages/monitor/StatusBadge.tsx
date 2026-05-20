import { Tag } from 'antd';

interface Device {
  id: string; name: string; last_speed: number; status: string;
}

export default function StatusBadge({ device }: { device: Device | null }) {
  if (!device) return null;

  const getState = () => {
    if (device.status !== 'online') return { text: '离线', color: 'default' as const };
    if (device.last_speed > 120) return { text: '超速', color: 'red' as const };
    if (device.last_speed > 60) return { text: '快速行驶', color: 'orange' as const };
    if (device.last_speed > 1) return { text: '运动中', color: 'green' as const };
    return { text: '静止', color: 'warning' as const };
  };

  const state = getState();

  return (
    <div style={{ position: 'absolute', bottom: 15, right: 15, zIndex: 1000 }}>
      <Tag color={state.color} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
        {device.name} — {state.text}
      </Tag>
    </div>
  );
}
