// app/feed/page.tsx
'use client';

import PostCard from '@/components/posts/PostCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { logout } from '@/store/slices/authSlice';
import { fetchPosts } from '@/store/slices/postSlice';
import {
  BellOutlined,
  BookOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FireOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  ReloadOutlined,
  RiseOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Dropdown, Empty, Input, MenuProps, Select, Space, Spin, Tabs, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignupModal from '../(auth)/signup/page';

const { TabPane } = Tabs;
const { Option } = Select;

const TOPICS = [
  'Programming', 'Technology', 'AI', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'Data Science', 'Machine Learning', 'UI/UX', 'Startup'
];

// Featured Authors - এটা API থেকে আসবে পরে
const FEATURED_AUTHORS = [
  { id: 1, name: 'Sarah Johnson', role: 'Tech Lead at Google', followers: '12.5K' },
  { id: 2, name: 'Michael Chen', role: 'AI Researcher', followers: '8.2K' },
  { id: 3, name: 'Emma Wilson', role: 'Startup Founder', followers: '15K' },
  { id: 4, name: 'David Kumar', role: 'Cloud Architect', followers: '6.8K' },
];

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'like', message: 'John liked your post', time: '5 min ago', read: false },
  { id: 2, type: 'comment', message: 'Sarah commented on your post', time: '1 hour ago', read: false },
  { id: 3, type: 'follow', message: 'Mike started following you', time: '3 hours ago', read: true },
  { id: 4, type: 'mention', message: 'Emma mentioned you in a comment', time: '1 day ago', read: true },
];

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { posts: storePosts, isLoading, error } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Profile menu items
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Link href={`/profile/${user?.id}`} className="flex items-center gap-2">
          <UserOutlined /> My Profile
        </Link>
      ),
    },
    {
      key: 'settings',
      label: (
        <Link href="/settings" className="flex items-center gap-2">
          <SettingOutlined /> Settings
        </Link>
      ),
    },
    {
      key: 'my-posts',
      label: (
        <Link href="/my-posts" className="flex items-center gap-2">
          <EditOutlined /> My Posts
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span className="flex items-center gap-2 text-red-600">
          <LogoutOutlined /> Logout
        </span>
      ),
      onClick: () => {
        // Handle logout logic here
        dispatch(logout());
        message.success('Logged out successfully');
        router.push('/');
      },
    },
  ];

  // Notification menu items
  const notificationMenuItems: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div className="flex justify-between items-center w-80 px-4 py-2">
          <span className="font-semibold">Notifications</span>
          <Button 
            type="link" 
            size="small" 
            onClick={() => {
              setNotifications(notifications.map(n => ({ ...n, read: true })));
            }}
            className="text-green-600"
          >
            Mark all as read
          </Button>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    ...(notifications.length > 0 ? notifications.map((notif, index) => ({
      key: notif.id.toString(),
      label: (
        <div className={`w-80 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`} />
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
            </div>
          </div>
        </div>
      ),
    })) : [
      {
        key: 'empty',
        label: (
          <div className="w-80 px-4 py-8 text-center text-gray-500">
            No notifications
          </div>
        ),
        disabled: true,
      }
    ]),
    {
      type: 'divider',
    },
    {
      key: 'view-all',
      label: (
        <div className="w-80 px-4 py-2 text-center">
          <Link href="/notifications" className="text-green-600 hover:text-green-700">
            View all notifications
          </Link>
        </div>
      ),
    },
  ];

  // Real data from backend
  const posts = storePosts || [];

  useEffect(() => {
    loadPosts();
  }, [dispatch, retryCount, selectedTopic, searchQuery]);

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

  const handleLogin = () => {
    router.push('/login?redirect=/feed');
  };

  const handleSignup = () => {
    router.push('/signup?redirect=/feed');
  };

  const handleWritePost = () => {
    if (!user) {
      message.warning('Please login to write a post');
      router.push('/login?redirect=/posts/create');
    } else if (!user.verified) {
      message.warning('Please verify your email before posting');
      router.push('/verify-email/sent');
    } else {
      router.push('/posts/create');
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-primary">
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
      <nav className="nav-bg border-custom border-b sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Always visible */}
            <Link href="/" className="flex items-center space-x-2">
              <GlobalOutlined style={{ fontSize: '24px' }} className="logo-color" />
              <span className="text-xl sm:text-2xl font-serif font-bold logo-color truncate max-w-37.5 sm:max-w-full">
                Tottho Vandar
              </span>
            </Link>

            {/* Search Bar - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-4 lg:mx-8">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined className="text-tertiary" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full input-bg border-0 input-hover transition-colors text-primary placeholder-tertiary"
              />
            </div>

            {/* Right Menu - Desktop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {/* Dark Mode Toggle Button */}
              <Button
                type="text"
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleDarkMode}
                className="text-secondary hover:text-primary"
              />
              
              {/* Notification Bell with Badge */}
              {user && (
                <Dropdown 
                  menu={{ items: notificationMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  dropdownRender={(menu) => (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      {menu}
                    </div>
                  )}
                >
                  <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                    <Button
                      type="text"
                      icon={<BellOutlined className="text-xl" />}
                      className="text-secondary hover:text-primary relative"
                    />
                  </Badge>
                </Dropdown>
              )}

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleWritePost}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                size="middle"
              >
                <span className="hidden lg:inline">Write</span>
              </Button>

              {user ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Dropdown 
                    menu={{ items: profileMenuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <div className="cursor-pointer flex items-center gap-2">
                      <Avatar 
                        src={user.avatar} 
                        icon={<UserOutlined />}
                        className="border-2 border-custom hover:border-green-500 transition-colors"
                        size={40}
                      />
                      <span className="hidden lg:inline text-secondary hover:text-primary transition-colors">
                        {user.name?.split(' ')[0]}
                      </span>
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <Space size={4} className="lg:space-x-2">
                  <Button 
                    type="text" 
                    onClick={handleLogin}
                    className="text-secondary hover:text-primary"
                    size="middle"
                  >
                    Login
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => setIsSignupOpen(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    size="middle"
                  >
                    <span className="hidden lg:inline">Sign up</span>
                    <span className="lg:hidden">Sign up</span>
                  </Button>
                </Space>
              )}
               <SignupModal
                isOpen={isSignupOpen}
                onClose={() => setIsSignupOpen(false)}
                onLoginClick={() => {
                    setIsSignupOpen(false);
                    setIsLoginOpen(true);
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                type="text"
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleDarkMode}
                className="text-secondary hover:text-primary"
              />
              {user && (
                <Badge count={unreadCount} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => setNotificationDrawerOpen(true)}
                    className="text-secondary hover:text-primary"
                  />
                </Badge>
              )}
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                className="text-secondary hover:text-primary"
              />
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setSidebarDrawerOpen(true)}
                className="text-secondary hover:text-primary"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Drawer */}
      <Drawer
        title="Search"
        placement="top"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        height="auto"
        className="dark:bg-gray-800"
        styles={{
          header: { 
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--nav-bg)',
            color: 'var(--text-primary)'
          },
          body: { 
            padding: '16px',
            background: 'var(--bg-primary)'
          }
        }}
      >
        <Input
          placeholder="Search posts..."
          prefix={<SearchOutlined className="text-tertiary" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-full input-bg border-0 input-hover transition-colors text-primary placeholder-tertiary w-full"
          autoFocus
          size="large"
        />
        <div className="flex justify-end mt-4">
          <Button onClick={() => setMobileMenuOpen(false)}>
            Close
          </Button>
        </div>
      </Drawer>

      {/* Mobile Notifications Drawer */}
      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setNotificationDrawerOpen(false)}
        open={notificationDrawerOpen}
        width={300}
        className="dark:bg-gray-800"
        styles={{
          header: { 
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--nav-bg)',
            color: 'var(--text-primary)'
          },
          body: { 
            padding: 0,
            background: 'var(--bg-primary)'
          }
        }}
        extra={
          <Button 
            type="link" 
            size="small" 
            onClick={() => {
              setNotifications(notifications.map(n => ({ ...n, read: true })));
            }}
            className="text-green-600"
          >
            Mark all read
          </Button>
        }
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => {
                  // Handle notification click
                  setNotificationDrawerOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </Drawer>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setSidebarDrawerOpen(false)}
        open={sidebarDrawerOpen}
        width={300}
        className="dark:bg-gray-800"
        styles={{
          header: { 
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--nav-bg)',
            color: 'var(--text-primary)'
          },
          body: { 
            padding: '16px',
            background: 'var(--bg-primary)'
          }
        }}
      >
        {/* Mobile User Info */}
        {user ? (
          <div className="mb-6 p-4 card-bg rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar 
                src={user.avatar} 
                icon={<UserOutlined />}
                size={48}
                className="border-2 border-custom"
              />
              <div className="flex-1">
                <p className="font-medium heading-color">{user.name}</p>
                <p className="text-sm text-secondary truncate">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Link href={`/profile/${user.id}`} className="text-center">
                <div className="text-sm font-medium heading-color">Posts</div>
                <div className="text-xs text-secondary">12</div>
              </Link>
              <Link href={`/profile/${user.id}?tab=followers`} className="text-center">
                <div className="text-sm font-medium heading-color">Followers</div>
                <div className="text-xs text-secondary">1.2K</div>
              </Link>
              <Link href={`/profile/${user.id}?tab=following`} className="text-center">
                <div className="text-sm font-medium heading-color">Following</div>
                <div className="text-xs text-secondary">340</div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            <Button 
              type="primary" 
              block
              onClick={() => {
                setSidebarDrawerOpen(false);
                handleLogin();
              }}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700"
            >
              Login
            </Button>
            <Button 
              block
              onClick={() => {
                setSidebarDrawerOpen(false);
                handleSignup();
              }}
            >
              Sign up
            </Button>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="space-y-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            onClick={() => {
              setSidebarDrawerOpen(false);
              handleWritePost();
            }}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700"
          >
            Write a Post
          </Button>

          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            <Link 
              href="/feed"
              className="block px-4 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setSidebarDrawerOpen(false)}
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  href={`/profile/${user.id}`}
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setSidebarDrawerOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  href="/my-posts"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setSidebarDrawerOpen(false)}
                >
                  My Posts
                </Link>
                <Link 
                  href="/saved"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setSidebarDrawerOpen(false)}
                >
                  Saved
                </Link>
                <Link 
                  href="/settings"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setSidebarDrawerOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  onClick={() => {
                    setSidebarDrawerOpen(false);
                    message.success('Logged out successfully');
                    router.push('/');
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Topics */}
          <div>
            <h3 className="font-medium heading-color mb-2 px-2">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {TOPICS.slice(0, 6).map(topic => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setSidebarDrawerOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${selectedTopic === topic 
                      ? 'bg-green-600 text-white dark:bg-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Main Content - Same as before */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Responsive text sizes */}
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

        {/* Search and Filter Bar - Responsive */}
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
            {/* Feed Tabs - Responsive */}
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

          {/* Sidebar - Hidden on mobile, visible on desktop */}
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

            {/* Reading List - if user is logged in */}
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