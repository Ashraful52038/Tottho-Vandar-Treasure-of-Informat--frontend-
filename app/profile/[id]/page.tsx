'use client';

import type { FollowUser } from '@/lib/api/user';
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
  unfollowUser,
} from '@/store/slices/profileSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  LoadingOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Spin, message } from 'antd';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FollowersList } from '../components/FollowersList';
import { FollowingList } from '../components/FollowingList';
import { UserComments } from '../components/UserComments';
import { UserLikes } from '../components/UserLikes';
import { UserPosts } from '../components/UserPosts';
import { btnFollowing, btnOutline, btnPrimary, token } from '../constant/theme';


export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const {
    profile, posts, comments, likes, followers, following,
    isLoading, totalPosts, totalComments, totalLikes,
    totalFollowers, totalFollowing, currentPage,
  } = useAppSelector((state) => state.profile);

  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const profileId = params?.id as string;
  const isOwnProfile = currentUser?.id ? String(currentUser.id) === profileId : false;

  useEffect(() => {
    if (profileId) {
      dispatch(fetchProfile(profileId));
      dispatch(fetchUserPosts({ userId: profileId, page: 1 }));
      dispatch(fetchUserComments({ userId: profileId, page: 1 }));
      dispatch(fetchUserLikes({ userId: profileId, page: 1 }));
      dispatch(fetchFollowers({ userId: profileId, page: 1 }));
      dispatch(fetchFollowing({ userId: profileId, page: 1 }));
    }
    return () => { dispatch(resetPosts()); dispatch(resetComments()); };
  }, [dispatch, profileId]);

  useEffect(() => {
    if (currentUser && !isOwnProfile && followers.length > 0) {
      setIsFollowing(followers.some((f: FollowUser) => f.id === currentUser.id));
    }
  }, [followers, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser) 
    { 
      router.push('/login');
      return; 
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      if (previousState) {
        await dispatch(unfollowUser(profileId)).unwrap();
        setIsFollowing(false);
        message.success('Unfollowed successfully');
      } else {
        await dispatch(followUser(profileId)).unwrap();
        setIsFollowing(true);
        message.success('Followed successfully');
      }

      await Promise.all([
        dispatch(fetchProfile(profileId)),
        dispatch(fetchFollowers({ userId: profileId, page: 1 })),
        dispatch(fetchFollowing({ userId: profileId, page: 1 })),
      ]);

    } catch { 
      setIsFollowing(previousState);
      message.error('Failed to update follow status');
    }
  };

  if (isLoading && !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: token.bg }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: token.accent }} spin />} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: token.bg }}>
        <div style={{ textAlign: 'center', background: token.surface, border: `1px solid ${token.border}`, borderRadius: 20, padding: '48px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}>👤</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Profile Not Found</h2>
          <p style={{ color: token.muted, marginBottom: 24 }}>The profile you're looking for doesn't exist.</p>
          <button style={btnPrimary} onClick={() => router.push('/feed')}>Go to Feed</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'posts',     label: 'My Posts',   count: totalPosts },
    { key: 'comments',  label: 'Comments',   count: totalComments },
    { key: 'likes',     label: 'Likes',      count: totalLikes },
    { key: 'followers', label: 'Followers',  count: totalFollowers },
    { key: 'following', label: 'Following',  count: totalFollowing },
  ];

  return (
    <div style={{ minHeight: '100vh', background: token.bg, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 64px' }}>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: token.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px 6px 6px', borderRadius: 6, marginBottom: 20, fontFamily: 'inherit' }}
        >
          <ArrowLeftOutlined style={{ fontSize: 13 }} /> Back
        </button>

        {/* Hero Card */}
        <div style={{ background: token.surface, border: `1px solid ${token.border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>

          {/* Banner */}
          <div style={{ height: 120, background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 40%, #74c69d 100%)' }} />

          <div style={{ padding: '0 28px 0' }}>
            {/* Avatar + Action row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -36, marginBottom: 16 }}>
              <Avatar
                size={80}
                src={getFullImageUrl(profile.avatar)}
                icon={<UserOutlined />}
                style={{ border: `3px solid ${token.surface}`, background: token.accentLight, color: token.accent, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,.1)' }}
              />
              <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                {isOwnProfile ? (
                  <button style={btnOutline} onClick={() => router.push('/profile/edit')}>
                    <EditOutlined /> Edit Profile
                  </button>
                ) : (
                  <button style={isFollowing ? btnFollowing : btnPrimary} onClick={handleFollow}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: 'DM Serif Display, Georgia, serif', color: token.text, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {profile.name}
              {/* {profile.verified && <CheckCircleFilled style={{ color: '#0ea5e9', fontSize: 18 }} />} */}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: token.muted, fontSize: 13 }}>
                <MailOutlined style={{ fontSize: 13 }} /> {profile.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: token.muted, fontSize: 13 }}>
                <CalendarOutlined style={{ fontSize: 13 }} /> Joined {moment(profile.createdAt).format('MMMM YYYY')}
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{ marginTop: 10, marginBottom: 20, color: token.text, lineHeight: 1.65, fontSize: 14 }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            borderTop: `1px solid ${token.border}`, marginTop: profile.bio ? 0 : 20 }}>
            {[
              { label: 'Posts',     value: totalPosts,     tab: 'posts' },
              { label: 'Followers', value: totalFollowers, tab: 'followers' },
              { label: 'Following', value: totalFollowing, tab: 'following' },
              { label: 'Likes',     value: totalLikes,     tab: 'likes' },
              { label: 'Comments',  value: totalComments,  tab: 'comments' },
            ].map((s, i) => (
              <div
                key={s.tab}
                onClick={() => setActiveTab(s.tab)}
                style={{ padding: '16px 12px', textAlign: 'center', cursor: 'pointer', background: token.surface2,
                  transition: 'background .12s', borderRight: i < 3 ? `1px solid ${token.border}` : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = token.accentPale)}
                onMouseLeave={e => (e.currentTarget.style.background = token.surface2)}
              >
                <div style={{ fontSize: 20, fontWeight: 600, color: token.text, fontFamily: 'DM Serif Display, serif' }}>
                  {s.value >= 1000 ? `${(s.value / 1000).toFixed(1)}k` : s.value}
                </div>
                <div style={{ fontSize: 11, color: token.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Card */}
        <div style={{ background: token.surface, border: `1px solid ${token.border}`, borderRadius: 20, overflow: 'hidden' }}>

          {/* Tab Nav */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${token.border}`, overflowX: 'auto', padding: '0 8px' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flexShrink: 0, padding: '16px 18px', border: 'none', background: 'none',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  borderBottom: activeTab === t.key ? `2px solid ${token.accent}` : '2px solid transparent',
                  marginBottom: -1, color: activeTab === t.key ? token.accent : token.muted,
                  transition: 'all .15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t.label}
                <span style={{
                  fontSize: 11, padding: '1px 7px', borderRadius: 20, fontWeight: 600,
                  background: activeTab === t.key ? token.accent : token.accentLight,
                  color: activeTab === t.key ? '#fff' : token.accent,
                }}>
                  {t.count >= 1000 ? `${(t.count / 1000).toFixed(1)}k` : t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div style={{ padding: 24 }}>
            {activeTab === 'posts' && (
              <UserPosts
                posts={posts} userId={profileId} isOwnProfile={isOwnProfile}
                onLoadMore={() => dispatch(fetchUserPosts({ userId: profileId, page: currentPage.posts }))}
                hasMore={posts.length < totalPosts}
              />
            )}
            {activeTab === 'comments' && (
              <UserComments
                comments={comments}
                onLoadMore={() => dispatch(fetchUserComments({ userId: profileId, page: currentPage.comments }))}
                hasMore={comments.length < totalComments}
              />
            )}
            {activeTab === 'likes' && (
              <UserLikes
                likes={likes}
                onLoadMore={() => dispatch(fetchUserLikes({ userId: profileId, page: currentPage.likes }))}
                hasMore={likes.length < totalLikes}
              />
            )}
            {activeTab === 'followers' && (
              <FollowersList
                followers={followers} currentUserId={currentUser?.id}
                onLoadMore={() => dispatch(fetchFollowers({ userId: profileId, page: currentPage.followers }))}
                hasMore={followers.length < totalFollowers}
              />
            )}
            {activeTab === 'following' && (
              <FollowingList
                following={following} currentUserId={currentUser?.id}
                onLoadMore={() => dispatch(fetchFollowing({ userId: profileId, page: currentPage.following }))}
                hasMore={following.length < totalFollowing}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}