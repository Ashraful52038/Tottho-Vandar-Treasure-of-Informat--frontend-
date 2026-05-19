'use client';

import { useWebSocketContext } from '@/components/notification/WebSocketContext';
import { WebSocketMessage } from '@/store/hooks/useWebSocket';
import {
    ArrowLeftOutlined,
    BellOutlined,
    FileTextOutlined,
    HeartOutlined,
    MessageOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import moment from 'moment';
import Link from 'next/link';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_like':
      return <HeartOutlined className="text-red-500 text-lg" />;
    case 'new_comment':
      return <MessageOutlined className="text-blue-500 text-lg" />;
    case 'new_follow':
      return <UserAddOutlined className="text-green-500 text-lg" />;
    case 'new_post':
      return <FileTextOutlined className="text-purple-500 text-lg" />;
    default:
      return <BellOutlined className="text-gray-500 text-lg" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'new_like': return 'bg-red-50 dark:bg-red-900/20';
    case 'new_comment': return 'bg-blue-50 dark:bg-blue-900/20';
    case 'new_follow': return 'bg-green-50 dark:bg-green-900/20';
    case 'new_post': return 'bg-purple-50 dark:bg-purple-900/20';
    default: return 'bg-gray-50 dark:bg-gray-800';
  }
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead } = useWebSocketContext();

  const formatTime = (timestamp: number) => {
    return moment(timestamp * 1000).fromNow();
  };

  const handleNotificationClick = (notification: WebSocketMessage) => {
    if (notification.data?.postId) {
      window.location.href = `/posts/${notification.data.postId}`;
    } else if (notification.data?.follower) {
      window.location.href = `/profile/${notification.data.follower}`;
    }
  };

  const NotificationList = ({ items }: { items: WebSocketMessage[] }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <BellOutlined className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            When someone likes, comments, or follows you, you'll see it here
          </p>
          <Link href="/feed">
            <Button type="primary" className="mt-6 bg-green-600 hover:bg-green-700">
              Explore Posts
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((notification, index) => (
          <div
            key={index}
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${getNotificationColor(notification.type)}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/feed" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeftOutlined className="text-xl" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h1>
            </div>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={markAllAsRead}
                className="text-green-600 dark:text-green-400"
              >
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: `All (${notifications.length})`,
              children: <NotificationList items={notifications} />
            },
            {
              key: 'unread',
              label: `Unread (${unreadCount})`,
              children: <NotificationList items={notifications.slice(0, unreadCount)} />
            },
            {
              key: 'likes',
              label: 'Likes',
              children: <NotificationList items={notifications.filter(n => n.type === 'new_like')} />
            },
            {
              key: 'comments',
              label: 'Comments',
              children: <NotificationList items={notifications.filter(n => n.type === 'new_comment')} />
            },
            {
              key: 'follows',
              label: 'Follows',
              children: <NotificationList items={notifications.filter(n => n.type === 'new_follow')} />
            }
          ]}
        />
      </div>
    </div>
  );
}