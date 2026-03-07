'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { likePost } from '@/store/slices/postSlice';
import { Post } from '@/types/posts';
import {
  ClockCircleOutlined,
  CommentOutlined,
  EyeOutlined,
  HeartFilled,
  HeartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title } = Typography;

// Dynamic import for ReactQuill with ssr: false
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p className="text-sm paragraph-color">Loading preview...</p>
});

import 'react-quill/dist/quill.bubble.css';

interface PostCardProps {
  post: Post;
  onPostClick?: (id: string) => void;
}

// Helper function to normalize post data
const normalizePost = (post: any): Post => {
  // Handle author
  let author = post.author;
  if (!author && post.authorId) {
    author = {
      id: post.authorId,
      name: post.authorName || 'Unknown Author',
      avatar: post.authorAvatar || null
    };
  } else if (!author) {
    author = {
      id: 'unknown',
      name: 'Unknown Author',
      avatar: null
    };
  }

  let tags: string[] = [];
  if (post.tags) {
    tags = post.tags.map((tag: any) => {
      if (typeof tag === 'string') return tag;
      if (tag && typeof tag === 'object') {
        return tag.name || tag.slug || tag.id || String(tag);
      }
      return String(tag);
    });
  }

  return {
    id: post.id || '',
    title: post.title || '',
    content: post.content || '',
    excerpt: post.excerpt || '',
    authorId: post.authorId || author.id,
    author: author,
    tags: tags,
    featuredImage: post.featuredImage || post.coverImage,
    likes: post.likes || post.likesCount || 0,
    likesCount: post.likesCount || post.likes || 0,
    comments: post.comments || post.commentsCount || 0,
    commentsCount: post.commentsCount || post.comments || 0,
    readingTime: post.readingTime || Math.ceil((post.content?.length || 0) / 1000),
    published: post.published || post.status === 'published',
    status: post.status || (post.published ? 'published' : 'draft'),
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || post.createdAt || new Date().toISOString(),
    isLiked: post.isLiked || false
  };
};

export default function PostCard({ post: originalPost, onPostClick }: PostCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [liked, setLiked] = useState(originalPost.isLiked || false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const post = normalizePost(originalPost);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await dispatch(likePost(post.id as string)).unwrap();
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleClick = () => {
    if (onPostClick) {
      onPostClick(post.id as string);
    } else {
      router.push(`/posts/${post.id}`);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/posts/${post.id}#comments`);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    router.push(`/feed?tag=${encodeURIComponent(tag)}`);
  };

  // Plain text fallback for server-side rendering
  const getPlainTextPreview = () => {
    if (!post.content) return '';
    // Remove HTML tags for server-side preview
    return post.content.replace(/<[^>]*>/g, '').substring(0, 150) + (post.content.length > 150 ? '...' : '');
  };

  return (
    <Card 
      hoverable 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 card-bg border-custom overflow-hidden rounded-xl"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side - Content */}
        <div className="flex-1 p-5">
          {/* Author Info */}
          <div className="flex items-center mb-3">
            <Avatar 
              icon={<UserOutlined />} 
              src={post.author?.avatar}
              size={44}
              className="border-2 border-green-500 dark:border-green-400"
            >
              {post.author?.name?.charAt(0) || 'U'}
            </Avatar>
            <div className="ml-3">
              <div className="font-semibold heading-color hover:text-green-600 dark:hover:text-green-400 transition-colors">
                {post.author?.name || 'Unknown Author'}
              </div>
              <div className="flex items-center text-xs text-secondary">
                <Tooltip title={moment(post.createdAt).format('LLLL')}>
                  <ClockCircleOutlined className="mr-1" />
                  <span>{moment(post.createdAt).fromNow()}</span>
                </Tooltip>
                {post.readingTime ? (
                  <>
                    <span className="mx-2">·</span>
                    <EyeOutlined className="mr-1" />
                    <span>{post.readingTime} min read</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Post Title */}
          <Title 
            level={4} 
            className={`mb-2 heading-color transition-all duration-300 line-clamp-2 ${
              isHovered ? 'text-green-600 dark:text-green-400' : ''
            }`}
          >
            {post.title}
          </Title>
          
          {/* Content Preview - with SSR fix */}
          <div className="prose prose-sm max-w-none mb-3 line-clamp-2 text-sm paragraph-color">
            {isMounted ? (
              <ReactQuill
                value={post.content?.substring(0, 300) + (post.content?.length > 300 ? '...' : '')}
                readOnly={true}
                theme="bubble"
                className="quill-preview"
              />
            ) : (
              <p className="text-sm paragraph-color">{getPlainTextPreview()}</p>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag: string) => (
                <Tag 
                  key={tag} 
                  className="px-2 py-0.5 text-xs rounded-full cursor-pointer hover:scale-105 transition-all border-0"
                  style={{ background: '#e6f7e6', color: '#2e7d32' }}
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  #{tag}
                </Tag>
              ))}
              {post.tags.length > 3 && (
                <Tag className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-0">
                  +{post.tags.length - 3}
                </Tag>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-custom">
            <Space size="middle">
              <Button 
                type="text" 
                icon={liked ? 
                  <HeartFilled className="text-red-500 dark:text-red-400 text-base" /> : 
                  <HeartOutlined className="text-secondary text-base hover:text-red-500 transition-colors" />
                }
                onClick={handleLike}
                className="flex items-center gap-1 h-auto px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
              >
                <span className="ml-1 text-xs font-medium">{post.likesCount || post.likes || 0}</span>
              </Button>
              
              <Button 
                type="text" 
                icon={<CommentOutlined className="text-secondary text-base hover:text-blue-500 transition-colors" />}
                onClick={handleCommentClick}
                className="flex items-center gap-1 h-auto px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
              >
                <span className="ml-1 text-xs font-medium">{post.commentsCount || post.comments || 0}</span>
              </Button>
            </Space>

            <Button 
              type="link" 
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0 text-sm font-medium transition-all hover:translate-x-1"
              onClick={handleClick}
            >
              Read more →
            </Button>
          </div>
        </div>

        {/* Right side - Featured Image */}
        {post.featuredImage && !imageError ? (
          <div className="md:w-44 lg:w-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-r-xl flex items-center">
            <div className="w-full flex items-center justify-center">
              <img 
                alt={post.title} 
                src={post.featuredImage}
                className={`w-full object-cover transition-all duration-700 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                onError={() => setImageError(true)}
                style={{ height: '140px', marginTop: '100px' }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>
          </div>
        ) : (
          <div className="md:w-44 lg:w-48 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-r-xl flex items-center justify-center" style={{ height: '160px' }}>
            <span className="text-4xl text-green-700 dark:text-green-300">📷</span>
          </div>
        )}
      </div>
    </Card>
  );
}