import { Card, Typography, Switch, Select, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  refreshCountdown: number;
  showDeviceNames: boolean;
  onToggleNames: (v: boolean) => void;
  mapSource: string;
  onMapSourceChange: (v: string) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (v: boolean) => void;
}

export default function MapToolbox({
  refreshCountdown, showDeviceNames, onToggleNames,
  mapSource, onMapSourceChange, autoRefresh, onAutoRefreshChange,
}: Props) {
  return (
    <Card
      size="small"
      style={{
        position: 'absolute', top: 75, right: 15, zIndex: 1001,
        width: 220, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      bodyStyle={{ padding: '8px 12px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tag color={autoRefresh ? 'processing' : 'default'} icon={<SyncOutlined spin={autoRefresh} />}>
            {autoRefresh ? `${refreshCountdown}s` : '手动'}
          </Tag>
          <Switch size="small" checked={autoRefresh} onChange={onAutoRefreshChange} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12 }}>设备名称</Text>
          <Switch size="small" checked={showDeviceNames} onChange={onToggleNames} />
        </div>
        <Select size="small" value={mapSource} onChange={onMapSourceChange} style={{ width: '100%' }}
          options={[
            { value: 'osm', label: 'OpenStreetMap' },
            { value: 'satellite', label: '卫星地图' },
          ]}
        />
      </div>
    </Card>
  );
}
