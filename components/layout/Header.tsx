import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';

<Link href="/posts/create">
  <Button type="primary" icon={<EditOutlined />} className="bg-green-600 hover:bg-green-700">
    Write
  </Button>
</Link>