'use client';

import LoginModal from '@/app/(auth)/login/page';
import SignupModal from '@/app/(auth)/signup/page';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { logout } from '@/store/slices/authSlice';
import { Tag as TagType } from '@/types/tags';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  BellOutlined,
  EditOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Dropdown, Input, MenuProps, message } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../notification/WebSocketContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onTopicSelect?: (topic: string) => void;
  onTagSelect?: (tagId: string) => void;
  selectedTopic?: string;
  searchQuery?: string;
  tags?: TagType[];
  selectedTagIds?: string[];
}

export default function Navbar({ onSearch, searchQuery = '',tags = [], onTagSelect, selectedTagIds = []}: NavbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // State declarations
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { isConnected, notifications: wsNotifications, unreadCount: wsUnreadCount, markAllAsRead: wsMarkAllAsRead } = useWebSocketContext();
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => { 
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
        const shouldOpenLogin = searchParams.get('openLogin') === 'true';
        if (shouldOpenLogin) {
            setIsLoginOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('openLogin');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

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

    useEffect(() => {
    if (wsNotifications.length > 0) {
      const formattedNotifs = wsNotifications.map((notif: any, index: number) => ({
        id: index,
        type: notif.type,
        message: `${notif.title}: ${notif.message}`,
        time: new Date(notif.createdAt * 1000).toLocaleTimeString(),
        read: false
      }));
      setLocalNotifications(formattedNotifs);
    }
  }, [wsNotifications]);

  const handleMarkAllAsReadLocal = () => {
    wsMarkAllAsRead();
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    message.success('All notifications marked as read');
  };

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(localSearchQuery);
    }
  };

  // Login/Signup handlers
  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  const handleSignup = () => {
    setIsSignupOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleCloseSignup = () => {
    setIsSignupOpen(false);
  };

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
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
            onClick={handleMarkAllAsReadLocal}
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
    ...(localNotifications.length > 0 ? localNotifications.map((notif) => ({
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

  // Get unread count
  const displayUnreadCount = localNotifications.filter(n => !n.read).length;

  const handleWritePost = () => {
    if (!user) {
      message.warning('Please login to write a post');
      setIsLoginOpen(true);
    } else if (!user.verified) {
      message.warning('Please verify your email before posting');
      router.push('/verify-email/sent');
    } else {
      router.push('/posts/create');
    }
  };

  return (
    <>
      {/* Navbar */}
      {user && !isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs z-50">
          🔌 Reconnecting...
        </div>
      )}
      <nav className="nav-bg border-custom border-b sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={pathname === '/profile/edit' ? '#' : '/'} 
              onClick={(e) => {
                if (pathname === '/profile/edit') {
                  e.preventDefault();
                  return;
                }
              }}className="flex items-center space-x-2">
              <GlobalOutlined style={{ fontSize: '24px' }} className="logo-color" />
              <span className="text-xl sm:text-2xl font-serif font-bold logo-color truncate max-w-37.5 sm:max-w-full">
                Tottho Vandar
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-4 lg:mx-8">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined className="text-tertiary" />}
                value={localSearchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="rounded-full input-bg border-0 input-hover transition-colors text-primary placeholder-tertiary"
              />
            </div>

            {/* Right Menu - Desktop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <Button
                type="text"
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleDarkMode}
                className="text-secondary hover:text-primary"
              />
              
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
                  <Badge count={displayUnreadCount} size="small" offset={[-5, 5]}>
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
                        src={getFullImageUrl(user.avatar)} 
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
                <div className="flex items-center gap-2">
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
                    onClick={handleSignup} 
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    size="middle"
                  >
                    <span className="hidden lg:inline">Sign up</span>
                    <span className="lg:hidden">Sign up</span>
                  </Button>
                </div>
              )}
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
                <Badge count={displayUnreadCount} size="small">
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
          value={localSearchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
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
            onClick={handleMarkAllAsReadLocal}
            className="text-green-600"
          >
            Mark all read
          </Button>
        }
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {localNotifications.length > 0 ? (
            localNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => {
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
                    dispatch(logout());
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
              {(tags || []).slice(0, 6).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (onTagSelect) {
                      onTagSelect(tag.id);
                    }
                    setSidebarDrawerOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${selectedTagIds.includes(tag.id)
                      ? 'bg-green-600 text-white dark:bg-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSignUpClick={handleSwitchToSignup}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={handleCloseSignup}
        onLoginClick={handleSwitchToLogin}
      />
    </>
  );
}