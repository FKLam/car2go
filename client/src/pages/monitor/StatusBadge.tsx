import { CarOutlined } from '@ant-design/icons';

interface Device {
  id: string; name: string; last_speed: number; status: string;
}

export default function StatusBadge({ device }: { device: Device | null }) {
  if (!device) return null;

  return (
    <div style={{ position: 'absolute', bottom: 70, right: 28, zIndex: 1000, width: 88, height: 88, background: 'rgba(255,255,255,.92)', borderRadius: 18, boxShadow: '0 8px 24px rgba(15,23,42,.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#4b7cff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26 }}>
        <CarOutlined />
      </div>
      <div style={{ fontWeight: 600 }}>静止</div>
    </div>
  );
}
