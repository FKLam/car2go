import { Card, Input, Tree, List, Tabs, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

const agentTree = [
  { title: '体验账号 (6/9)', key: 'agent-0', children: [
    { title: '杭州帅骑科技 (1/3)', key: 'agent-1', isLeaf: true },
    { title: 'wangzhe (0/0)', key: 'agent-2', isLeaf: true },
    { title: '姬姬 (0/0)', key: 'agent-3', isLeaf: true },
  ]},
];

interface Props {
  onSelectAgent?: (agent: string) => void;
  devices?: any[];
}

export default function AgentTreePanel({ onSelectAgent, devices = [] }: Props) {
  return (
    <Card size="small" style={{ width: 300, flexShrink: 0 }}>
      <div style={{ marginBottom: 8 }}>
        <Input prefix={<SearchOutlined />} placeholder="代理商搜索" size="small" />
      </div>
      <Tree.DirectoryTree treeData={agentTree} defaultExpandAll style={{ fontSize: 12 }}
        onSelect={(keys) => { if (keys.length > 0 && onSelectAgent) onSelectAgent(keys[0] as string); }} />
      <div style={{ margin: '12px 0', borderTop: '1px solid #f0f0f0' }} />
      <Input prefix={<SearchOutlined />} placeholder="搜索设备" size="small" style={{ marginBottom: 8 }} />
      <Tabs size="small" items={[
        { key: 'all', label: '全部' },
        { key: 'online', label: '在线' },
        { key: 'offline', label: '离线' },
      ]} />
      <List size="small" dataSource={devices.slice(0, 6)}
        renderItem={(d: any) => (
          <List.Item style={{ padding: '4px 8px' }}>
            <Text style={{ fontSize: 12 }}>{d.name || d.id} <Tag color={d.status === 'online' ? 'green' : 'default'} style={{ fontSize: 10 }}>{d.status}</Tag></Text>
          </List.Item>
        )} />
    </Card>
  );
}
