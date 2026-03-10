'use client';

import { Post } from '@/types/posts';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ClockCircleOutlined,
  CommentOutlined,
  EyeOutlined,
  HeartFilled,
  HeartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Card, Tag, Tooltip, Typography } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import { useState } from 'react';

const { Title } = Typography;

interface PostCardProps {
  post: Post;
}

// Helper function to normalize post data
const normalizePost = (post: any): Post => {
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

const getHtmlPreview = (content: string, maxLength: number = 200) => {
  if (!content) return '';
  
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return content;
  }
  
  let textLength = 0;
  let result = '';
  const tagStack: string[] = [];
  
  const tokens = content.split(/(<[^>]*>)/);
  
  for (const token of tokens) {
    if (token.startsWith('<')) {
      result += token;
      if (token.startsWith('</')) {
        const tagName = token.match(/<\/([^>\s]+)/)?.[1];
        if (tagName && tagStack[tagStack.length - 1] === tagName) {
          tagStack.pop();
        }
      } else if (!token.endsWith('/>')) {
        const tagName = token.match(/<([^>\s/]+)/)?.[1];
        if (tagName) {
          tagStack.push(tagName);
        }
      }
    } else {
      const remainingChars = maxLength - textLength;
      if (remainingChars <= 0) break;
      
      if (token.length <= remainingChars) {
        result += token;
        textLength += token.length;
      } else {
        result += token.substring(0, remainingChars) + '...';
        textLength = maxLength;
        break;
      }
    }
  }
  
  while (tagStack.length > 0) {
    const tag = tagStack.pop();
    result += `</${tag}>`;
  }
  
  return result;
};



export default function PostCard({ post: originalPost }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const post = normalizePost(originalPost);
  const imageUrl = getFullImageUrl(post.featuredImage);
  console.log('Generated imageUrl:', imageUrl);

  return (
    <Link href={`/posts/${post.id}`} className="block no-underline">
      <Card 
        hoverable 
        className="group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl border-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        styles={{ 
          body: { padding: 0 },
          root: { 
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        }}
      >
        <div className="flex flex-col md:flex-row relative">
          {/* Left side - Content */}
          <div className="flex-1 p-6">
            {/* Author Info */}
            <div className="flex items-center mb-4">
              <Avatar 
                icon={<UserOutlined />} 
                src={post.author?.avatar}
                size={48}
                className="border-2 border-green-500 dark:border-green-400 shadow-md"
              >
                {post.author?.name?.charAt(0) || 'U'}
              </Avatar>
              <div className="ml-3">
                <div className="font-bold text-black dark:text-gray-800 text-base">
                  {post.author?.name || 'Unknown Author'}
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
              className={`mb-3 text-gray-900 dark:text-gray-100 transition-all duration-300 line-clamp-2 text-xl font-bold ${
                isHovered ? 'text-green-600 dark:text-green-400' : ''
              }`}
            >
              {post.title}
            </Title>
            
            {/* Content Preview - HTML ট্যাগ সহ রেন্ডার হবে */}
            <div className="prose prose-sm max-w-none mb-4 line-clamp-3">
              <div 
                className="text-sm text-black dark:text-gray-1000 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: getHtmlPreview(post.content, 150)
                }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Tag 
                    key={tag} 
                    className="px-3 py-1 text-xs font-medium rounded-full border-0 transition-all hover:shadow-md"
                    style={{ 
                      background: '#e6f7e6', 
                      color: '#2e7d32',
                      cursor: 'default'
                    }}
                  >
                    #{tag}
                  </Tag>
                ))}
                {post.tags.length > 3 && (
                  <Tag className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-0">
                    +{post.tags.length - 3}
                  </Tag>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-5 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                {(post.likesCount ?? 0) > 0 ? (
                  <HeartFilled className="text-red-500 dark:text-red-400 text-lg transition-transform group-hover:scale-110" />
                ) : (
                  <HeartOutlined className="text-lg transition-transform group-hover:scale-110 group-hover:text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {post.likesCount ?? 0} {post.likesCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <CommentOutlined className="text-lg transition-transform group-hover:scale-110 group-hover:text-blue-500" />
                <span className="text-sm font-medium">
                  {post.commentsCount || post.comments || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Featured Image */}
          {post.featuredImage && !imageError ? (
            <div className="md:w-40 lg:w-48 relative overflow-hidden rounded-r-2xl">
              <div className="w-full h-full relative">
                <img 
                  alt={post.title} 
                  src={imageUrl || ' ' }
                  className={`w-full h-40 object-cover transition-all duration-700 `}
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          ) : (
            <div className={`md:w-40 lg:w-48 bg-linear-to-br rounded-r-2xl flex flex-col items-center justify-center p-4 text-center h-40`}>
              <span className="text-3xl mb-2">📝</span>
              <span className="text-white font-medium text-xs opacity-90 line-clamp-2">
                {post.title?.substring(0, 30) || 'No Image'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}