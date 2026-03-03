'use client';

import Navbar from '@/components/layout/Navbar';
import PostCard from '@/components/posts/PostCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { fetchPosts } from '@/store/slices/postSlice';
import {
  BookOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReloadOutlined,
  RiseOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Avatar, Button, Empty, Select, Spin, Tabs, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Option } = Select;

const TOPICS = [
  'Programming', 'Technology', 'AI', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'Data Science', 'Machine Learning', 'UI/UX', 'Startup'
];

// Featured Authors
const FEATURED_AUTHORS = [
  { id: 1, name: 'Sarah Johnson', role: 'Tech Lead at Google', followers: '12.5K' },
  { id: 2, name: 'Michael Chen', role: 'AI Researcher', followers: '8.2K' },
  { id: 3, name: 'Emma Wilson', role: 'Startup Founder', followers: '15K' },
  { id: 4, name: 'David Kumar', role: 'Cloud Architect', followers: '6.8K' },
];

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { posts: storePosts, isLoading, error } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // ✅ Solution: Client-side only rendering
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    if (isMounted) {
      loadPosts();
    }
  }, [dispatch, retryCount, selectedTopic, searchQuery, isMounted]);

  const loadPosts = async () => {
    try {
      await dispatch(fetchPosts({
        page: 1,
        limit: 10,
        tag: selectedTopic || undefined,
        search: searchQuery || undefined,
        sortBy: 'latest'
      })).unwrap();
    } catch (err) {
      console.error('Failed to load posts:', err);
      message.error('Failed to load posts. Please try again.');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleWritePost = () => {
    if (!user) {
      message.warning('Please login to write a post');
      router.push('/login?redirect=/posts/create');
    } else if (!user.verified) {
      message.warning('Please verify your email before posting');
      router.push('/verify-email');
    } else {
      router.push('/posts/create');
    }
  };

  const handleLogin = () => {
    router.push('/login?redirect=/feed');
  };

  const handleSignup = () => {
    router.push('/signup?redirect=/feed');
  };

  // ✅ Show loading until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-primary">
        <Navbar
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onTopicSelect={handleTopicSelect}
          selectedTopic={selectedTopic}
        />
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
    <div className="min-h-screen bg-primary">
      {/* Navbar */}
      <Navbar
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onTopicSelect={handleTopicSelect}
        selectedTopic={selectedTopic}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold heading-color mb-2 sm:mb-3 lg:mb-4 px-4">
            {user ? `Welcome back, ${user.name}!` : 'Welcome to Tottho Vandar'}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl paragraph-color max-w-2xl mx-auto px-4">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 sm:mb-6 px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <WarningOutlined className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
                <p className="text-red-700 dark:text-red-400 text-sm sm:text-base">{error}</p>
              </div>
              <Button 
                onClick={handleRetry} 
                icon={<ReloadOutlined />}
                size="small"
                className="w-full sm:w-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-6 sm:mb-8 px-4">
          <div className="card-bg rounded-lg shadow-sm p-3 sm:p-4 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <Select
                placeholder="Filter by topic"
                style={{ width: '100%', maxWidth: '200px' }}
                value={selectedTopic}
                onChange={setSelectedTopic}
                allowClear
                popupClassName="dark:bg-gray-800"
                className="dark:text-white w-full sm:w-auto"
              >
                {TOPICS.map(topic => (
                  <Option key={topic} value={topic} className="dark:text-white">
                    {topic}
                  </Option>
                ))}
              </Select>
              
              <div className="flex gap-2 w-full sm:w-auto justify-start">
                <Button 
                  type="text" 
                  className="text-secondary hover:text-primary flex-1 sm:flex-none"
                  size="middle"
                >
                  Following
                </Button>
                <Button 
                  type="text" 
                  className="text-secondary hover:text-primary flex-1 sm:flex-none"
                  size="middle"
                >
                  Saved
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Feed Tabs */}
            <Tabs 
              defaultActiveKey="for-you" 
              className="mb-4 sm:mb-6"
              size={isMobile ? 'small' : 'middle'}
              items={[
                {
                  key: 'for-you',
                  label: (
                    <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <FireOutlined /> <span className="hidden xs:inline">For you</span>
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 sm:space-y-6">
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div className="text-center py-8 sm:py-12">
                              <h3 className="text-base sm:text-lg font-medium heading-color mb-2">
                                No stories found
                              </h3>
                              <p className="paragraph-color text-sm sm:text-base mb-4 px-4">
                                {searchQuery || selectedTopic 
                                  ? "Try adjusting your search or filter to find what you're looking for."
                                  : "Be the first to write a story!"}
                              </p>
                              {user ? (
                                <Button 
                                  type="primary" 
                                  onClick={handleWritePost}
                                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                  size={isMobile ? 'middle' : 'large'}
                                >
                                  Write a story
                                </Button>
                              ) : (
                                <Button
                                  type="primary"
                                  onClick={handleLogin}
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
                    <Empty 
                      description={<span className="text-secondary text-sm sm:text-base">Trending posts coming soon</span>} 
                    />
                  ),
                },
                {
                  key: 'latest',
                  label: (
                    <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <ClockCircleOutlined /> <span className="hidden xs:inline">Latest</span>
                    </span>
                  ),
                  children: (
                    <Empty 
                      description={<span className="text-secondary text-sm sm:text-base">Latest posts coming soon</span>} 
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            {/* Recommended Topics */}
            <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 mb-6 transition-colors duration-300">
              <h2 className="text-base lg:text-lg font-semibold heading-color mb-3 lg:mb-4 flex items-center gap-2">
                <FireOutlined className="text-green-600 dark:text-green-400" />
                Recommended topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {TOPICS.slice(0, 8).map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-colors
                      ${selectedTopic === topic 
                        ? 'bg-green-600 text-white dark:bg-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Authors */}
            <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 mb-6 transition-colors duration-300">
              <h2 className="text-base lg:text-lg font-semibold heading-color mb-3 lg:mb-4 flex items-center gap-2">
                <UserOutlined className="text-blue-600 dark:text-blue-400" />
                Featured writers
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {FEATURED_AUTHORS.map(author => (
                  <div key={author.id} className="flex items-start gap-2 lg:gap-3">
                    <Avatar 
                      size={40} 
                      icon={<UserOutlined />} 
                      className="shrink-0 border-2 border-custom"
                    />
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/profile/${author.id}`}
                        className="font-medium heading-color hover:text-green-600 dark:hover:text-green-400 transition-colors block truncate text-sm lg:text-base"
                      >
                        {author.name}
                      </Link>
                      <p className="text-xs lg:text-sm text-secondary truncate">{author.role}</p>
                      <p className="text-xs text-tertiary mt-0.5 lg:mt-1">{author.followers} followers</p>
                    </div>
                    <Button 
                      type="link" 
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0 shrink-0 text-xs lg:text-sm"
                      onClick={() => {
                        if (!user) {
                          message.warning('Please login to follow authors');
                          router.push('/login');
                        }
                      }}
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading List */}
            {user && (
              <div className="card-bg rounded-lg shadow-sm p-5 lg:p-6 transition-colors duration-300">
                <h2 className="text-base lg:text-lg font-semibold heading-color mb-3 lg:mb-4 flex items-center gap-2">
                  <BookOutlined className="text-purple-600 dark:text-purple-400" />
                  Your reading list
                </h2>
                <p className="text-secondary text-xs lg:text-sm mb-3 lg:mb-4">
                  Save stories to read later or keep for reference.
                </p>
                <Button 
                  type="primary" 
                  block 
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm"
                >
                  View all saved
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}