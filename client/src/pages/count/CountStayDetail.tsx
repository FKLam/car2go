import { Button, Select, Space, Table } from 'antd';
import { DownloadOutlined, EnvironmentOutlined } from '@ant-design/icons';

const rows = [
  ['2026-05-21 00:10:51', '北斗', '2026-05-21 00:38:30', '江苏省无锡市新吴区旺庄街道新梅路南...', 27],
  ['2026-05-21 04:14:57', '北斗', '2026-05-21 04:32:54', '查看', 17],
  ['2026-05-21 06:28:54', '北斗', '2026-05-21 06:42:08', '查看', 13],
  ['2026-05-21 07:10:25', '北斗', '2026-05-21 07:20:27', '江苏省无锡市新吴区旺庄街道新锡路12...', 10],
  ['2026-05-21 09:22:48', 'LBS', '2026-05-21 10:10:01', '江苏省无锡市新吴区旺庄街道新梅路(无...', 47],
  ['2026-05-21 20:11:08', '北斗', '2026-05-21 20:36:45', '查看', 25],
  ['2026-05-21 20:57:37', '北斗', '2026-05-21 21:36:16', '查看', 38],
].map((item, index) => ({ id: index + 1, imei: '862371741097523', startDate: item[0], locationType: item[1], endDate: item[2], address: item[3], days: 0, hours: 0, minutes: item[4] }));

export default function CountStayDetail() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Space size={18}>
          <Select defaultValue="today" style={{ width: 190 }} options={[{ value: 'today', label: '今天' }, { value: 'yesterday', label: '昨天' }, { value: 'week', label: '一周' }]} />
          <Button type="primary">查询</Button>
        </Space>
        <Button type="link" icon={<DownloadOutlined />}>导出表格</Button>
      </div>
      <Table
        size="small"
        dataSource={rows}
        rowKey="id"
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1280, y: 'calc(100vh - 340px)' }}
        columns={[
          { title: 'IMEI号', dataIndex: 'imei', width: 130, align: 'center' as const },
          { title: '起始日期', dataIndex: 'startDate', width: 170, align: 'center' as const },
          { title: '定位类型', dataIndex: 'locationType', width: 120, align: 'center' as const },
          { title: '结束日期', dataIndex: 'endDate', width: 170, align: 'center' as const },
          { title: '停留点位置', dataIndex: 'address', width: 260, align: 'center' as const },
          { title: '天', dataIndex: 'days', width: 90, align: 'center' as const },
          { title: '小时', dataIndex: 'hours', width: 90, align: 'center' as const },
          { title: '分钟', dataIndex: 'minutes', width: 90, align: 'center' as const },
          { title: '操作', width: 140, fixed: 'right' as const, align: 'center' as const, render: () => <Button size="small" icon={<EnvironmentOutlined />}>停留点详情</Button> },
        ]}
      />
    </div>
  );
}
