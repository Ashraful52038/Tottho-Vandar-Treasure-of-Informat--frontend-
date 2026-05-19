'use client';

import { WebSocketMessage } from '@/store/hooks/useWebSocket';
import {
  BellOutlined,
  CheckOutlined,
  ClearOutlined,
  CloseOutlined,
  FileTextOutlined,
  HeartOutlined,
  MessageOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Badge, Button, Drawer, Empty, Tabs } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useWebSocketContext } from './WebSocketContext';

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

export default function NotificationCenter() {
  const [visible, setVisible] = useState(false);
  const {
    isConnected,
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications
  } = useWebSocketContext();  // ✅ Context ব্যবহার করো

  const formatTime = (timestamp: number) => {
    return moment(timestamp * 1000).fromNow();
  };

  const handleNotificationClick = (notification: WebSocketMessage) => {
    if (notification.data?.postId) {
      window.location.href = `/posts/${notification.data.postId}`;
    } else if (notification.data?.follower) {
      window.location.href = `/profile/${notification.data.follower}`;
    }
    setVisible(false);
  };

  const NotificationList = ({ items }: { items: WebSocketMessage[] }) => {
    if (items.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notifications yet"
          className="mt-8"
        />
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
              <div className="shrink-0 mt-1">
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
    <>
      <Badge count={unreadCount} offset={[-5, 5]} size="small">
        <Button
          type="text"
          icon={<BellOutlined className="text-xl" />}
          onClick={() => setVisible(true)}
          className="relative text-secondary hover:text-primary"
        />
      </Badge>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={markAllAsRead}
                  icon={<CheckOutlined />}
                  className="text-green-600"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={clearNotifications}
                  icon={<ClearOutlined />}
                  className="text-red-600"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={400}
        closeIcon={<CloseOutlined />}
        extra={
          <div className="flex items-center gap-2">
            {!isConnected && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                Reconnecting...
              </span>
            )}
          </div>
        }
      >
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
      </Drawer>
    </>
  );
}