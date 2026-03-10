'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { deletePost, fetchPostById, likePost } from '@/store/slices/postSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Modal,
  Space,
  Spin,
  Tag,
  message
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Generate a random gradient for posts without image (same as PostCard)
const getRandomGradient = () => {
  const gradients = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-teal-400',
    'from-green-400 to-cyan-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
    'from-indigo-400 to-purple-400',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentPost, isLoading, error } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchPostById(params.id as string));
    }
  }, [dispatch, params.id]);

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await dispatch(likePost(params.id as string)).unwrap();
    } catch (error) {
      message.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(params.id as string)).unwrap();
      message.success('Post deleted successfully');
      router.push('/feed');
    } catch (error) {
      message.error('Failed to delete post');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/posts/edit/${params.id}`);
  };

  const getTagNames = (tags: any[]): string[] => {
    if (!tags || !Array.isArray(tags)) return [];
    return tags.map(tag => {
      if (typeof tag === 'string') return tag;
      if (tag && typeof tag === 'object') {
        if (tag.name) return tag.name;
        if (tag.slug) return tag.slug;
        if (tag.id) return String(tag.id);
      }
      return '';
    }).filter(tag => tag !== '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="Error"
          description={error || 'Post not found'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const isAuthor = user?.id === currentPost.authorId;
  const tagNames = getTagNames(currentPost.tags || []);
  const likesCount = currentPost?.likesCount || currentPost?.likes || 0;

  // Use the same image utility function as PostCard
  const imageUrl = getFullImageUrl(currentPost.featuredImage);
  const randomGradient = getRandomGradient();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="text-gray-600 hover:text-gray-900">
              <ArrowLeftOutlined className="text-xl" />
            </Link>
            <Space>
              <Button
                icon={(likesCount > 0) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                onClick={handleLike}
              >
                {likesCount}
              </Button>
              <Button icon={<CommentOutlined />}>
                {currentPost.commentsCount || 0}
              </Button>
              {isAuthor && (
                <>
                  <Button icon={<EditOutlined />} onClick={handleEdit}>
                    Edit
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          
          {/* ✅ Large Featured Image at the top - same style as PostCard but bigger */}
          <div className="relative w-full h-96 bg-gray-100 overflow-hidden">
            {imageUrl && !imageError ? (
              <>
                <img 
                  src={imageUrl}
                  alt={currentPost.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}
                  onError={() => setImageError(true)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-70'
                }`} />
                
                {/* Image caption/title overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-lg">
                    {currentPost.title}
                  </h1>
                  <div className="flex items-center text-white/90 text-sm">
                    <ClockCircleOutlined className="mr-1" />
                    <span>{moment(currentPost.createdAt).format('MMMM D, YYYY')}</span>
                    <span className="mx-2">·</span>
                    <span>{currentPost.readingTime || 5} min read</span>
                  </div>
                </div>
              </>
            ) : (
              // Gradient fallback when no image or image error
              <div className={`w-full h-full bg-gradient-to-br ${randomGradient} flex flex-col items-center justify-center`}>
                <span className="text-6xl mb-4">📝</span>
                <h1 className="text-4xl font-serif font-bold text-white text-center px-4 drop-shadow-lg">
                  {currentPost.title}
                </h1>
                <div className="flex items-center text-white/90 text-sm mt-4">
                  <ClockCircleOutlined className="mr-1" />
                  <span>{moment(currentPost.createdAt).format('MMMM D, YYYY')}</span>
                  <span className="mx-2">·</span>
                  <span>{currentPost.readingTime || 5} min read</span>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Author Info - Moved below image */}
            <div className="flex items-center mb-6">
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                src={currentPost.author?.avatar}
                className="border-2 border-gray-200"
              >
                {currentPost.author?.name?.charAt(0)}
              </Avatar>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentPost.author?.name || 'Unknown Author'}
                </h2>
                <div className="flex items-center text-gray-500 mt-1">
                  <span>Posted on {moment(currentPost.createdAt).format('MMMM D, YYYY')}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tagNames.length > 0 && (
              <div className="mb-6">
                {tagNames.map((tagName) => (
                  <Link key={tagName} href={`/feed?tag=${tagName}`}>
                    <Tag 
                      className="px-4 py-1.5 text-sm font-medium rounded-full border-0 cursor-pointer hover:opacity-80 transition-all"
                      style={{ 
                        background: '#e6f7e6', 
                        color: '#2e7d32',
                        marginRight: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      #{tagName}
                    </Tag>
                  </Link>
                ))}
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-lg max-w-none">
              <ReactQuill
                value={currentPost.content}
                readOnly={true}
                theme="bubble"
              />
            </div>

            {/* Stats at the bottom */}
            <div className="flex items-center gap-6 pt-6 mt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                {(likesCount > 0) ? (
                  <HeartFilled className="text-red-500 text-xl" />
                ) : (
                  <HeartOutlined className="text-xl" />
                )}
                <span className="text-base font-medium">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <CommentOutlined className="text-xl" />
                <span className="text-base font-medium">
                  {currentPost.commentsCount || 0} {currentPost.commentsCount === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-serif font-semibold mb-4">
            Comments ({currentPost.commentsCount || 0})
          </h3>
          <p className="text-gray-500 text-center py-8">
            Comments section coming soon...
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Post"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this post?</p>
        <p className="text-red-500">This action cannot be undone!</p>
      </Modal>
    </div>
  );
}