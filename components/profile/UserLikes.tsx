'use client';

import type { UserLike } from '@/lib/api/user';
import { HeartOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import moment from 'moment';

interface UserLikesProps {
  likes: UserLike[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function UserLikes({ likes, onLoadMore, hasMore }: UserLikesProps) {
  return (
    <div className="space-y-4">
      {likes.length ? (
        <>
          {likes.map(like => (
            <Card key={like.id} className="cursor-pointer hover:shadow" onClick={() => window.location.href = like.postId ? `/posts/${like.postId}` : '#'}>
              {like.type === 'post' ? (
                <p><HeartOutlined className="text-red-500" /> Liked a post: <strong>{like.postTitle || 'Post'}</strong></p>
              ) : (
                <p><HeartOutlined className="text-red-500" /> Liked a comment: "{like.content}" on {like.postTitle || 'Post'}</p>
              )}
              <div className="text-right text-gray-400 text-sm mt-1">{moment(like.createdAt).fromNow()}</div>
            </Card>
          ))}
          {hasMore && <div className="text-center mt-4"><Button onClick={onLoadMore}>Load More</Button></div>}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No likes yet.</div>
      )}
    </div>
  );
}
