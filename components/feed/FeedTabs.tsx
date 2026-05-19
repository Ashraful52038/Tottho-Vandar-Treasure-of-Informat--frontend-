'use client';

import PostCard, { normalizePost } from '@/components/posts/PostCard';
import { Post } from '@/types/posts';
import { userService } from '@/lib/api/user';
import { FireOutlined, RiseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Spin, Tabs, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FeedTabsProps {
  posts: Post[];
  user: any;
  isMobile: boolean;
  onLogin: () => void;
  onWritePost: () => void;
  hasSearchFilters?: boolean;
}

export default function FeedTabsContent({ posts, user, isMobile, onLogin, onWritePost, hasSearchFilters }: FeedTabsProps) {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedPage, setLikedPage] = useState(1);
  const [likedHasMore, setLikedHasMore] = useState(false);

  const loadLikedPosts = async (pageNum: number = 1) => {
    if (!user) return;
    setLikedLoading(true);
    try {
      const response = await userService.getUserLikes(user.id, pageNum, 10);
      const newLikedPosts = response.likes
        .map((like: any) => like.post)
        .filter(Boolean)
        .map((post: any) => normalizePost(post));

      setLikedPosts(prev => pageNum === 1 ? newLikedPosts : [...prev, ...newLikedPosts]);
      setLikedHasMore((pageNum * 10) < (response.total || 0));
      setLikedPage(pageNum);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load liked posts');
    } finally {
      setLikedLoading(false);
    }
  };

  const loadMoreLikedPosts = () => {
    if (!likedLoading && likedHasMore) {
      loadLikedPosts(likedPage + 1);
    }
  };

  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'trending' && user && likedPosts.length === 0 && !likedLoading) {
      loadLikedPosts(1);
    }
  };

  return (
    <Tabs
      defaultActiveKey="for-you"
      className="mb-4 sm:mb-6"
      size={isMobile ? 'small' : 'middle'}
      onChange={handleTabChange}
      items={[
        {
          key: 'for-you',
          label: (
            <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FireOutlined /> <span className="hidden xs:inline">For you</span>
            </span>
          ),
          children: (
            <div className="space-y-6 sm:space-y-9">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center py-8 sm:py-12">
                      <h3 className="text-base sm:text-lg font-medium heading-color mb-2">
                        No stories found
                      </h3>
                      <p className="paragraph-color text-sm sm:text-base mb-4 px-4">
                        {hasSearchFilters
                          ? "Try adjusting your search or filter to find what you're looking for."
                          : "Be the first to write a story!"}
                      </p>
                      {user ? (
                        <Button
                          type="primary"
                          onClick={onWritePost}
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                          size={isMobile ? 'middle' : 'large'}
                        >
                          Write a story
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={onLogin}
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                          size={isMobile ? 'middle' : 'large'}
                        >
                          Login to write
                        </Button>
                      )}
                    </div>
                  }
                />
              )}
            </div>
          ),
        },
        {
          key: 'trending',
          label: (
            <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <RiseOutlined /> <span className="hidden xs:inline">Trending</span>
            </span>
          ),
          children: (
            <div className="space-y-6 sm:space-y-9">
              {!user ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center py-8 sm:py-12">
                      <p className="paragraph-color text-sm sm:text-base mb-4">
                        Login to see the posts you've liked.
                      </p>
                      <Button
                        type="primary"
                        onClick={onLogin}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        Login
                      </Button>
                    </div>
                  }
                />
              ) : likedLoading && likedPosts.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Spin size="large" />
                </div>
              ) : likedPosts.length > 0 ? (
                <>
                  {likedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {likedHasMore && (
                    <div className="text-center mt-8">
                      <Button onClick={loadMoreLikedPosts} loading={likedLoading}>
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center py-8 sm:py-12">
                      <p className="paragraph-color text-sm sm:text-base mb-4">
                        You haven't liked any posts yet.
                      </p>
                      <Button
                        type="primary"
                        onClick={() => router.push('/feed')}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        Explore Posts
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          ),
        },
        {
          key: 'latest',
          label: (
            <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ClockCircleOutlined /> <span className="hidden xs:inline">Latest</span>
            </span>
          ),
          children: <Empty description={<span className="text-secondary text-sm sm:text-base">Latest posts coming soon</span>} />,
        },
      ]}
    />
  );
}
