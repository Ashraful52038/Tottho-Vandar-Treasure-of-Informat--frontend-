'use client';

import FeedSidebar from '@/components/feed/FeedSidebar';
import FeedTabsContent from '@/components/feed/FeedTabs';
import Navbar from '@/components/layout/Navbar';
import PostCard, { normalizePost } from '@/components/posts/PostCard';
import { FollowUser, userService } from '@/lib/api/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { fetchPosts, fetchTags } from '@/store/slices/postSlice';
import { Tag as TagType } from '@/types/tags';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  CloseOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Button, Empty, Select, Space, Spin, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Option } = Select;

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { posts: storePosts, isLoading, error, tags } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // State for liked posts (trending tab)
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedPage, setLikedPage] = useState(1);
  const [likedHasMore, setLikedHasMore] = useState(false);
  const [featuredWriters, setFeaturedWriters] = useState<FollowUser[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const posts = storePosts || [];

  // Load tags
  useEffect(() => {
    if (isMounted) {
      dispatch(fetchTags());
    }
  }, [dispatch, isMounted]);

  // First time load URL params
  useEffect(() => {
    if (!isInitialized && isMounted) {
      const search = searchParams.get('search') || '';
      const tags = searchParams.get('tag')?.split(',').filter(Boolean) || [];
      setSearchQuery(search);
      setSelectedTagIds(tags);
      setIsInitialized(true);
    }
  }, [searchParams, isMounted, isInitialized]);

  // Sync state with URL changes
  useEffect(() => {
    if (isInitialized) {
      const search = searchParams.get('search') || '';
      const tags = searchParams.get('tag')?.split(',').filter(Boolean) || [];
      if (search !== searchQuery) setSearchQuery(search);
      if (JSON.stringify(tags) !== JSON.stringify(selectedTagIds)) setSelectedTagIds(tags);
    }
  }, [searchParams, isInitialized]);

  // Fetch feed posts (for you tab)
  useEffect(() => {
    if (isMounted && isInitialized) {
      loadPosts();
    }
  }, [dispatch, retryCount, selectedTagIds, searchQuery, isMounted, isInitialized]);

  const loadPosts = async () => {
    try {
      const tagIdsParam = selectedTagIds.length ? selectedTagIds.join(',') : undefined;
      await dispatch(fetchPosts({
        page: 1,
        limit: 10,
        tagIds: tagIdsParam,
        search: searchQuery || undefined,
        sortBy: 'latest'
      })).unwrap();
    } catch (err) {
      message.error('Failed to load posts. Please try again.');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const updateURL = (search: string, tags: string[]) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tags.length) params.set('tag', tags.join(','));
    const newUrl = `/feed?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const fetchFeaturedWriters = async () => {
    setFeaturedLoading(true);
    try {
        const writers = await userService.getMostFollowedUsers(5);
        setFeaturedWriters(writers);
    } catch (error) {
        console.error('Failed to load featured writers:', error);
    } finally {
        setFeaturedLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
        fetchFeaturedWriters();
    }
}, [isMounted]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateURL(query, selectedTagIds);
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newTags);
    updateURL(searchQuery, newTags);
  };

  const clearAllFilters = () => {
    setSelectedTagIds([]);
    setSearchQuery('');
    updateURL('', []);
  };

  const handleWritePost = () => {
    if (!user) {
      message.warning('Please login to write a post');
      router.push('/login?redirect=/posts/create');
    } else {
      router.push('/posts/create');
    }
  };

  const handleLogin = () => {
    router.push('/login?redirect=/feed');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isLoading && posts.length === 0 && !isInitialized) {
    return (
      <div className="min-h-screen bg-primary">
        <Navbar onSearch={handleSearch} searchQuery={searchQuery} onTopicSelect={() => {}} selectedTopic="" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-secondary">Loading your feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-primary">
      <Navbar
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onTopicSelect={() => {}}
        selectedTopic=""
        tags={tags}
        onTagSelect={toggleTag}
        selectedTagIds={selectedTagIds}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold heading-color mb-2 sm:mb-3 lg:mb-4 px-4">
            {user ? `Welcome back, ${user.name}!` : 'Welcome to Tottho Vandar'}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl paragraph-color max-w-2xl mx-auto px-4">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <WarningOutlined className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
                <p className="text-red-700 dark:text-red-400 text-sm sm:text-base">{error}</p>
              </div>
              <Button onClick={handleRetry} icon={<ReloadOutlined />} size="small" className="w-full sm:w-auto">
                Retry
              </Button>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8 px-4">
          <div className="card-bg rounded-lg shadow-sm p-3 sm:p-4 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <Select
                mode="multiple"
                placeholder="Filter by topic"
                style={{ width: '100%', maxWidth: '300px' }}
                value={selectedTagIds}
                onChange={(values) => {
                  const newTags = values as string[];
                  setSelectedTagIds(newTags);
                  updateURL(searchQuery, newTags);
                }}
                allowClear
                maxTagCount="responsive"
                popupClassName="dark:bg-gray-800"
                className="dark:text-white w-full sm:w-auto"
              >
                {tags.map((tag: TagType) => (
                  <Option key={tag.id} value={tag.id} className="dark:text-white">
                    {tag.name}
                  </Option>
                ))}
              </Select>

              {(selectedTagIds.length > 0 || searchQuery) && (
                <Space size={4} wrap>
                  {selectedTagIds.map(id => {
                    const tag = tags.find((t: TagType) => t.id === id);
                    return tag ? (
                      <Tag
                        key={id}
                        closable
                        onClose={() => toggleTag(id)}
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {tag.name}
                      </Tag>
                    ) : null;
                  })}
                  {searchQuery && (
                    <Tag closable onClose={() => setSearchQuery('')} className="bg-blue-100 text-blue-800">
                      Search: {searchQuery}
                    </Tag>
                  )}
                  <Button type="link" size="small" onClick={clearAllFilters} icon={<CloseOutlined />}>
                    Clear all
                  </Button>
                </Space>
              )}

              <div className="flex gap-2 w-full sm:w-auto justify-start">
                <Button type="text" className="text-secondary hover:text-primary flex-1 sm:flex-none" size="middle">
                  Following
                </Button>
                <Button type="text" className="text-secondary hover:text-primary flex-1 sm:flex-none" size="middle">
                  Saved
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4">
          <div className="lg:col-span-8">
            <FeedTabsContent
              posts={posts}
              user={user}
              isMobile={isMobile}
              onLogin={handleLogin}
              onWritePost={handleWritePost}
              hasSearchFilters={searchQuery !== '' || selectedTagIds.length > 0}
            />
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 mb-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-base lg:text-lg font-semibold heading-color flex items-center gap-2">
                <FireOutlined className="text-green-600 dark:text-green-400" />
                Recommended topics
              </h2>
              {tags.length > 8 && (
                <Button
                  type="link"
                  onClick={() => setShowAllTopics(!showAllTopics)}
                  icon={showAllTopics ? <CloseOutlined /> : <RiseOutlined />}
                  className="text-green-600 dark:text-green-400 p-0 h-auto"
                >
                  {showAllTopics ? 'Show less' : `See more (${tags.length - 8})`}
                </Button>
              )}
            </div>
            
              <div className={`flex flex-wrap gap-2 transition-all duration-300 ${
                showAllTopics ? 'max-h-125' : 'max-h-50'
              } overflow-y-auto pr-2`}>
                {(showAllTopics ? tags : tags.slice(0, 8)).map((tag: TagType) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 hover:scale-105
                      ${selectedTagIds.includes(tag.id)
                        ? 'bg-green-600 text-white dark:bg-green-700 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              
              {/* Scroll করার ইঙ্গিত (শুধু মাত্র 8টির বেশি থাকলে এবং showAllTopics false হলে) */}
              {!showAllTopics && tags.length > 8 && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-secondary">
                    + {tags.length - 8} more topics. Click "See more" to view all
                  </p>
                </div>
              )}
            </div>

            <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 mb-6 transition-colors duration-300">
            <h2 className="text-base lg:text-lg font-semibold heading-color mb-3 lg:mb-4 flex items-center gap-2">
                <UserOutlined className="text-blue-600 dark:text-blue-400" />
                Most followed writers
            </h2>
            <div className="space-y-3 lg:space-y-4">
                {featuredLoading ? (
                    <div className="text-center py-4">
                        <Spin size="small" />
                    </div>
                ) : featuredWriters.length > 0 ? (
                    featuredWriters.map((writer) => (
                        <div key={writer.id} className="flex items-start gap-2 lg:gap-3">
                            <Avatar 
                                size={40} 
                                src={getFullImageUrl(writer.avatar)} 
                                icon={<UserOutlined />} 
                                className="shrink-0 border-2 border-custom" 
                            />
                            <div className="flex-1 min-w-0">
                                <Link 
                                    href={`/profile/${writer.id}`} 
                                    className="font-medium heading-color hover:text-green-600 dark:hover:text-green-400 transition-colors block truncate text-sm lg:text-base"
                                >
                                    {writer.name}
                                </Link>
                                {writer.bio && (
                                    <p className="text-xs lg:text-sm text-secondary truncate">{writer.bio}</p>
                                )}
                                <p className="text-xs text-tertiary mt-0.5 lg:mt-1">
                                    {writer.followersCount || 0} followers
                                </p>
                            </div>
                            <Button
                                type="link"
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0 shrink-0 text-xs lg:text-sm"
                                onClick={async () => {
                                    if (!user) {
                                        message.warning('Please login to follow authors');
                                        router.push('/login');
                                        return;
                                    }
                                    try {
                                        if (writer.isFollowing) {
                                            await userService.unfollowUser(writer.id);
                                            setFeaturedWriters(prev => prev.map(w => 
                                                w.id === writer.id ? { ...w, isFollowing: false, followersCount: (w.followersCount || 1) - 1 } : w
                                            ));
                                            message.success('Unfollowed');
                                        } else {
                                            await userService.followUser(writer.id);
                                            setFeaturedWriters(prev => prev.map(w => 
                                                w.id === writer.id ? { ...w, isFollowing: true, followersCount: (w.followersCount || 0) + 1 } : w
                                            ));
                                            message.success('Followed');
                                        }
                                        // রিফ্রেশ করতে চাইলে ফিচার্ড লিস্ট রিলোড করুন
                                        fetchFeaturedWriters();
                                    } catch {
                                        message.error('Failed');
                                    }
                                }}
                            >
                                {writer.isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-secondary text-sm text-center py-4">No writers found</p>
                )}
            </div>
        </div>

            {user && (
              <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 transition-colors duration-300">
                <h2 className="text-base lg:text-lg font-semibold heading-color mb-3 lg:mb-4 flex items-center gap-2">
                  <BookOutlined className="text-purple-600 dark:text-purple-400" />
                  Your reading list
                </h2>
                <p className="text-secondary text-xs lg:text-sm mb-3 lg:mb-4">
                  Save stories to read later or keep for reference.
                </p>
                <Button type="primary" block className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm">
                  View all saved
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}