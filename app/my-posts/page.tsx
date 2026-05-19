'use client';

import PostCard from '@/components/posts/PostCard';
import { userService } from '@/lib/api/user';
import { useAppSelector } from '@/store/hooks/reduxHooks';
import { ArrowLeftOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyPostsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  if (!user) { router.push('/login'); return null; }

  const fetchPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await userService.getUserPosts(user.id, pageNum, 10);
      const newPosts = response.posts || [];
      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setTotal(response.total || 0);
      setHasMore((pageNum * 10) < (response.total || 0));
      setPage(pageNum);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchPosts(1); }, [user]);

  return (
    <div className="min-h-screen bg-[#f5f4f0] py-6 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#7a7570] hover:text-[#1a1917] mb-5 transition-colors"
        >
          <ArrowLeftOutlined /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] overflow-hidden mb-5">
          <div className="h-20 bg-linear-to-r from-[#2d6a4f] via-[#40916c] to-[#74c69d]" />
          <div className="px-7 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#1a1917]" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>
                My Posts
              </h1>
              <p className="text-sm text-[#7a7570] mt-0.5">
                {total > 0 ? `${total} post${total !== 1 ? 's' : ''} published` : 'No posts yet'}
              </p>
            </div>
            <Link href="/posts/create">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                <EditOutlined /> Create Post
              </button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <LoadingOutlined className="text-4xl text-green-700" spin />
          </div>

        ) : posts.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>

            {hasMore && (
              <button
                onClick={() => fetchPosts(page + 1)}
                disabled={loading}
                className="w-full mt-5 py-3 text-sm font-medium text-[#7a7570] border border-dashed border-[#d4cfc5] rounded-xl hover:border-green-600 hover:text-green-700 hover:bg-white disabled:opacity-50 transition-all"
              >
                {loading ? 'Loading...' : 'Load more ↓'}
              </button>
            )}
          </>

        ) : (
          <div className="bg-white rounded-2xl border border-[#e8e5df] px-8 py-16 text-center">
            <div className="text-5xl mb-4 opacity-30">📝</div>
            <h2 className="text-base font-semibold text-[#1a1917] mb-2">No posts yet</h2>
            <p className="text-sm text-[#7a7570] mb-6">Share your thoughts — write your first post.</p>
            <Link href="/posts/create">
              <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors mx-auto">
                <EditOutlined /> Create Your First Post
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}