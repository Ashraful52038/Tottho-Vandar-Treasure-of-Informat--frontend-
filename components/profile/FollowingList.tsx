'use client';

import type { FollowUser } from '@/lib/api/user';
import { useAppDispatch } from '@/store/hooks/reduxHooks';
import { unfollowUser } from '@/store/slices/profileSlice';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, message } from 'antd';
import Link from 'next/link';

interface FollowingListProps {
  following: FollowUser[];
  currentUserId?: string;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function FollowingList({ following, currentUserId, onLoadMore, hasMore }: FollowingListProps) {
  const dispatch = useAppDispatch();
  const handleUnfollow = async (userId: string) => {
    try { await dispatch(unfollowUser(userId)).unwrap(); message.success('Unfollowed'); } catch { message.error('Failed'); }
  };
  return (
    <div className="space-y-4">
      {following.length ? (
        <>
          {following.map(f => (
            <Card key={f.id}>
              <div className="flex items-center gap-4">
                <Avatar src={f.avatar} icon={<UserOutlined />} />
                <div className="flex-1">
                  <Link href={`/profile/${f.id}`} className="font-semibold hover:text-green-600">{f.name}</Link>
                  {f.bio && <p className="text-sm text-gray-500">{f.bio}</p>}
                </div>
                {currentUserId && currentUserId !== f.id && (
                  <Button size="small" type="default" onClick={() => handleUnfollow(f.id)}>Following</Button>
                )}
              </div>
            </Card>
          ))}
          {hasMore && <div className="text-center"><Button onClick={onLoadMore}>Load More</Button></div>}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Not following anyone yet.</div>
      )}
    </div>
  );
}
