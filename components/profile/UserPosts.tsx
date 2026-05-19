'use client';

import PostCard from '@/components/posts/PostCard';
import type { UserPost } from '@/lib/api/user';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface UserPostsProps {
  posts: UserPost[];
  userId: string;
  isOwnProfile: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function UserPosts({ posts, isOwnProfile, onLoadMore, hasMore }: UserPostsProps) {
  return (
    <div className="space-y-4">
      {isOwnProfile && (
        <div className="flex justify-end">
          <Button type="primary" href="/posts/create" icon={<EditOutlined />}>Create Post</Button>
        </div>
      )}
      {posts.length ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>

          {hasMore && (
          <div className="text-center mt-4">
            <Button onClick={onLoadMore}>
              Load More
            </Button>
          </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No posts yet.</div>
      )}
    </div>
  );
}
