'use client';

import type { FollowUser } from '@/lib/api/user';
import { useAppDispatch } from '@/store/hooks/reduxHooks';
import { followUser, unfollowUser } from '@/store/slices/profileSlice';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, message } from 'antd';
import Link from 'next/link';

interface FollowersListProps {
  followers: FollowUser[];
  currentUserId?: string;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function FollowersList({ followers, currentUserId, onLoadMore, hasMore }: FollowersListProps) {
  const dispatch = useAppDispatch();
  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) await dispatch(unfollowUser(userId)).unwrap();
      else await dispatch(followUser(userId)).unwrap();
      message.success(isFollowing ? 'Unfollowed' : 'Followed');
    } catch { message.error('Failed'); }
  };
  return (
    <div className="space-y-4">
      {followers.length ? (
        <>
          {followers.map(f => (
            <Card key={f.id}>
              <div className="flex items-center gap-4">
                <Avatar src={f.avatar} icon={<UserOutlined />} />
                <div className="flex-1">
                  <Link href={`/profile/${f.id}`} className="font-semibold hover:text-green-600">{f.name}</Link>
                  {f.bio && <p className="text-sm text-gray-500">{f.bio}</p>}
                </div>
                {currentUserId && currentUserId !== f.id && (
                  <Button size="small" type={f.isFollowing ? 'default' : 'primary'} onClick={() => handleFollow(f.id, f.isFollowing)}>
                    {f.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {hasMore && <div className="text-center"><Button onClick={onLoadMore}>Load More</Button></div>}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No followers yet.</div>
      )}
    </div>
  );
}
