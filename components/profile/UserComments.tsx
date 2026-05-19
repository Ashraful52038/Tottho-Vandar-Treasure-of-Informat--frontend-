'use client';

import type { UserComment } from '@/lib/api/user';
import { HeartOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import moment from 'moment';

interface UserCommentsProps {
  comments: UserComment[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function UserComments({ comments, onLoadMore, hasMore }: UserCommentsProps) {
  return (
    <div className="space-y-4">
      {comments.length ? (
        <>
          {comments.map(comment => (
            <Card key={comment.id} className="cursor-pointer hover:shadow" onClick={() => window.location.href = `/posts/${comment.postId}`}>
              <p>{comment.content}</p>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>on {comment.postTitle || 'Post'}</span>
                <span><HeartOutlined /> {comment.likes || 0} • {moment(comment.createdAt).fromNow()}</span>
              </div>
            </Card>
          ))}
          {hasMore && <div className="text-center mt-4"><Button onClick={onLoadMore}>Load More</Button></div>}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No comments yet.</div>
      )}
    </div>
  );
}
