import { Select } from 'antd';

interface Props {
  refreshCountdown: number;
  showDeviceNames: boolean;
  onToggleNames: (v: boolean) => void;
  mapSource: string;
  onMapSourceChange: (v: string) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (v: boolean) => void;
}

export default function MapToolbox({ mapSource, onMapSourceChange }: Props) {
  return (
    <Select
      value={mapSource}
      onChange={onMapSourceChange}
      style={{ width: 160 }}
      options={[{ value: 'osm', label: '百度地图' }, { value: 'satellite', label: '卫星地图' }]}
    />
  );
}
