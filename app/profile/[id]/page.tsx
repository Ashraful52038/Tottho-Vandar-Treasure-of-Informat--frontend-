'use client';

import type { FollowUser, UserComment, UserLike, UserPost } from '@/lib/api/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import {
  fetchFollowers,
  fetchFollowing,
  fetchProfile,
  fetchUserComments,
  fetchUserLikes,
  fetchUserPosts,
  followUser,
  resetComments,
  resetPosts,
  unfollowUser
} from '@/store/slices/profileSlice';
import {
  CalendarOutlined,
  CheckCircleFilled,
  CommentOutlined,
  EditOutlined,
  EyeOutlined,
  HeartOutlined,
  LoadingOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Row, Spin, Statistic, Tabs, message } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { 
    profile, 
    posts, 
    comments, 
    likes, 
    followers, 
    following,
    isLoading,
    totalPosts,
    totalComments,
    totalLikes,
    totalFollowers,
    totalFollowing,
    currentPage 
  } = useAppSelector((state) => state.profile);
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const profileId = params?.id as string;
  const isOwnProfile = currentUser?.id === profileId;

  useEffect(() => {
    if (profileId) {
      dispatch(fetchProfile(profileId));
      dispatch(fetchUserPosts({ userId: profileId, page: 1 }));
      dispatch(fetchUserComments({ userId: profileId, page: 1 }));
      dispatch(fetchUserLikes({ userId: profileId, page: 1 }));
      dispatch(fetchFollowers({ userId: profileId, page: 1 }));
      dispatch(fetchFollowing({ userId: profileId, page: 1 }));
    }

    return () => {
      dispatch(resetPosts());
      dispatch(resetComments());
    };
  }, [dispatch, profileId]);

  // ফলো স্ট্যাটাস চেক করার জন্য আলাদা ইফেক্ট
  useEffect(() => {
    if (currentUser && !isOwnProfile && followers.length > 0) {
      const isFollow = followers.some((follower: FollowUser) => follower.id === currentUser.id);
      setIsFollowing(isFollow);
    }
  }, [followers, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await dispatch(unfollowUser(profileId)).unwrap();
        setIsFollowing(false);
        message.success('Unfollowed successfully');
      } else {
        await dispatch(followUser(profileId)).unwrap();
        setIsFollowing(true);
        message.success('Followed successfully');
      }
    } catch (error) {
      message.error('Failed to update follow status');
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const loadMorePosts = () => {
    if (posts.length < totalPosts) {
      dispatch(fetchUserPosts({ 
        userId: profileId, 
        page: currentPage.posts 
      }));
    }
  };

  const loadMoreComments = () => {
    if (comments.length < totalComments) {
      dispatch(fetchUserComments({ 
        userId: profileId, 
        page: currentPage.comments
      }));
    }
  };

  const loadMoreLikes = () => {
    if (likes.length < totalLikes) {
      dispatch(fetchUserLikes({ 
        userId: profileId, 
        page: currentPage.likes
      }));
    }
  };

  const loadMoreFollowers = () => {
    if (followers.length < totalFollowers) {
      dispatch(fetchFollowers({ 
        userId: profileId, 
        page: currentPage.followers
      }));
    }
  };

  const loadMoreFollowing = () => {
    if (following.length < totalFollowing) {
      dispatch(fetchFollowing({ 
        userId: profileId, 
        page: currentPage.following
      }));
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Button type="primary" href="/feed" className="bg-green-600 hover:bg-green-700">
            Go to Feed
          </Button>
        </Card>
      </div>
    );
  }

  const items = [
    {
      key: 'posts',
      label: `Posts (${totalPosts})`,
      children: (
        <UserPosts 
          posts={posts} 
          userId={profileId} 
          isOwnProfile={isOwnProfile}
          onLoadMore={loadMorePosts}
          hasMore={posts.length < totalPosts}
        />
      ),
    },
    {
      key: 'comments',
      label: `Comments (${totalComments})`,
      children: (
        <UserComments 
          comments={comments} 
          onLoadMore={loadMoreComments}
          hasMore={comments.length < totalComments}
        />
      ),
    },
    {
      key: 'likes',
      label: `Likes (${totalLikes})`,
      children: (
        <UserLikes 
          likes={likes} 
          onLoadMore={loadMoreLikes}
          hasMore={likes.length < totalLikes}
        />
      ),
    },
    {
      key: 'followers',
      label: `Followers (${totalFollowers})`,
      children: (
        <FollowersList 
          followers={followers} 
          currentUserId={currentUser?.id}
          onLoadMore={loadMoreFollowers}
          hasMore={followers.length < totalFollowers}
        />
      ),
    },
    {
      key: 'following',
      label: `Following (${totalFollowing})`,
      children: (
        <FollowingList 
          following={following} 
          currentUserId={currentUser?.id}
          onLoadMore={loadMoreFollowing}
          hasMore={following.length < totalFollowing}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar
              size={120}
              src={profile.avatar}
              icon={<UserOutlined />}
              className="border-4 border-green-500 shadow-lg"
            />
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-black items-center mb-2">
                    {profile.name}
                    {profile.verified && (
                      <CheckCircleFilled
                        style={{ color: '#0284c7', fontSize: '24px' }} 
                        aria-label="Verified account"
                      />
                    )}
                  </h1>
                  
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MailOutlined />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined />
                      <span>Joined {moment(profile.createdAt).format('MMMM YYYY')}</span>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEditProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      type={isFollowing ? 'default' : 'primary'}
                      onClick={handleFollow}
                      className={!isFollowing ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <Row gutter={[16, 16]} className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Col xs={12} sm={6}>
              <Statistic title="Posts" value={profile.stats?.posts || 0} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Followers" value={profile.stats?.followers || 0} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Following" value={profile.stats?.following || 0} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Likes Received" value={profile.stats?.likes || 0} />
            </Col>
          </Row>
        </Card>

        {/* Tabs Section */}
        <Card className="shadow-sm">
          <Tabs 
            activeKey={activeTab}
            items={items} 
            onChange={setActiveTab}
          />
        </Card>
      </div>
    </div>
  );
}

// ==================== ট্যাব কম্পোনেন্ট ====================

interface TabProps {
  onLoadMore: () => void;
  hasMore: boolean;
}

interface UserPostsProps extends TabProps {
  posts: UserPost[];
  userId: string;
  isOwnProfile: boolean;
}

// ===== ঠিক করা UserPosts কম্পোনেন্ট =====
function UserPosts({ posts, userId, isOwnProfile, onLoadMore, hasMore }: UserPostsProps) {
  return (
    <div className="space-y-4">
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <Button type="primary" href="/posts/create" icon={<EditOutlined />} className="bg-green-600 hover:bg-green-700">
            Create New Post
          </Button>
        </div>
      )}
      
      {posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = `/posts/${post.id}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt || post.content.substring(0, 150)}...
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span><HeartOutlined /> {post.likes || 0}</span>
                <span><CommentOutlined /> {post.comments || 0}</span>
                <span><EyeOutlined /> {post.views || 0}</span>
                <span className="ml-auto">{moment(post.createdAt).fromNow()}</span>
              </div>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button onClick={onLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet</p>
          {isOwnProfile && (
            <Button type="primary" href="/posts/create" className="mt-4 bg-green-600 hover:bg-green-700">
              Create Your First Post
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface UserCommentsProps extends TabProps {
  comments: UserComment[];
}

// ===== ঠিক করা UserComments কম্পোনেন্ট =====
function UserComments({ comments, onLoadMore, hasMore }: UserCommentsProps) {
  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <>
          {comments.map((comment) => (
            <Card 
              key={comment.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = `/posts/${comment.postId}`}
            >
              <p className="text-gray-800 dark:text-gray-200 mb-2">{comment.content}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  on <span className="font-medium text-gray-700 dark:text-gray-300">
                    {comment.postTitle || 'Post'}
                  </span>
                </span>
                <div className="flex items-center gap-4">
                  <span><HeartOutlined /> {comment.likes || 0}</span>
                  <span>{moment(comment.createdAt).fromNow()}</span>
                </div>
              </div>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button onClick={onLoadMore}>Load More</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No comments yet</p>
        </div>
      )}
    </div>
  );
}

interface UserLikesProps extends TabProps {
  likes: UserLike[];
}

// ===== ঠিক করা UserLikes কম্পোনেন্ট =====
function UserLikes({ likes, onLoadMore, hasMore }: UserLikesProps) {
  return (
    <div className="space-y-4">
      {likes.length > 0 ? (
        <>
          {likes.map((like) => (
            <Card 
              key={like.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = like.postId ? `/posts/${like.postId}` : '#'}
            >
              {like.type === 'post' ? (
                <>
                  <p className="text-gray-800 dark:text-gray-200">Liked a post</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {like.postTitle || 'Post'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-800 dark:text-gray-200">Liked a comment</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    "{like.content || ''}"
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    on {like.postTitle || 'Post'}
                  </p>
                </>
              )}
              <div className="text-right text-sm text-gray-500 mt-2">
                {moment(like.createdAt).fromNow()}
              </div>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button onClick={onLoadMore}>Load More</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No likes yet</p>
        </div>
      )}
    </div>
  );
}

interface FollowersListProps extends TabProps {
  followers: FollowUser[];
  currentUserId?: string;
}

// Followers List Component (ঠিক আছে)
function FollowersList({ followers, currentUserId, onLoadMore, hasMore }: FollowersListProps) {
  const dispatch = useAppDispatch();

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        message.success('Unfollowed successfully');
      } else {
        await dispatch(followUser(userId)).unwrap();
        message.success('Followed successfully');
      }
    } catch (error) {
      message.error('Failed to update follow status');
    }
  };

  return (
    <div className="space-y-4">
      {followers.length > 0 ? (
        <>
          {followers.map((follower) => (
            <Card key={follower.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Avatar size={48} src={follower.avatar} icon={<UserOutlined />} />
                <div className="flex-1">
                  <Link href={`/profile/${follower.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-green-600">
                    {follower.name}
                  </Link>
                  {follower.bio && <p className="text-sm text-gray-500">{follower.bio}</p>}
                </div>
                {currentUserId && currentUserId !== follower.id && (
                  <Button 
                    type={follower.isFollowing ? 'default' : 'primary'}
                    onClick={() => handleFollow(follower.id, follower.isFollowing)}
                    className={!follower.isFollowing ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {follower.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button onClick={onLoadMore}>Load More</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No followers yet</p>
        </div>
      )}
    </div>
  );
}

interface FollowingListProps extends TabProps {
  following: FollowUser[];
  currentUserId?: string;
}

// Following List Component (ঠিক আছে)
function FollowingList({ following, currentUserId, onLoadMore, hasMore }: FollowingListProps) {
  const dispatch = useAppDispatch();

  const handleUnfollow = async (userId: string) => {
    try {
      await dispatch(unfollowUser(userId)).unwrap();
      message.success('Unfollowed successfully');
    } catch (error) {
      message.error('Failed to unfollow user');
    }
  };

  return (
    <div className="space-y-4">
      {following.length > 0 ? (
        <>
          {following.map((person) => (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Avatar size={48} src={person.avatar} icon={<UserOutlined />} />
                <div className="flex-1">
                  <Link href={`/profile/${person.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-green-600">
                    {person.name}
                  </Link>
                  {person.bio && <p className="text-sm text-gray-500">{person.bio}</p>}
                </div>
                {currentUserId && currentUserId !== person.id && (
                  <Button 
                    type="default"
                    onClick={() => handleUnfollow(person.id)}
                  >
                    Following
                  </Button>
                )}
              </div>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4">
              <Button onClick={onLoadMore}>Load More</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Not following anyone yet</p>
        </div>
      )}
    </div>
  );
}