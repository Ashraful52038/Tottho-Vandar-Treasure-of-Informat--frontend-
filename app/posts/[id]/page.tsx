'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { addComment, deleteComment, fetchComments } from '@/store/slices/commentSlice'; // likeComment সরানো হয়েছে
import { deletePost, fetchPostById, likePost, updateCommentCount } from '@/store/slices/postSlice';
import { Comment } from '@/types/comments';
import { Post } from '@/types/posts';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip,
  message
} from 'antd';
import moment from 'moment';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { CommentItem } from './components/CommentItem';

const ReactQuill = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />
  }
);

// Post normalize function (unchanged)
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentPost, isLoading, error } = useAppSelector((state) => state.posts);
  const { comments, isLoading: commentsLoading } = useAppSelector((state) => state.comments);
  const { user } = useAppSelector((state) => state.auth);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  // Ref for scrolling to comments section
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchPostById(params.id as string));
      dispatch(fetchComments(params.id as string));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentPost) {
      console.log('Post data:', currentPost);
      console.log('Featured image:', currentPost.featuredImage);
      console.log('Image URL:', getFullImageUrl(currentPost.featuredImage));
      setImageTimestamp(Date.now());
    }
  }, [currentPost]);

  const handleLike = async () => {
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

  const handleCommentSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) {
      message.warning('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(addComment({
        content: commentText,
        postId: params.id as string,
        parentId: replyTo?.id
      })).unwrap();

      message.success('Comment added successfully');
      setCommentText('');
      setReplyTo(null);
      dispatch(updateCommentCount({ postId: params.id as string, delta: 1 }));
      
      dispatch(fetchComments(params.id as string));
    } catch (error) {
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Comment like function removed

  const handleCommentDelete = async (commentId: string) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      message.success('Comment deleted');
      dispatch(updateCommentCount({ postId: params.id as string, delta: -1 }));
      dispatch(fetchComments(params.id as string));
      setDeleteCommentId(null);
    } catch (error) {
      message.error('Failed to delete comment');
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setCommentText(`@${comment.author.name} `);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setCommentText('');
  };

  // Function to scroll to comments section
  const scrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Normalize the post data
  const post = normalizePost(currentPost);
  const isAuthor = user?.id === post.authorId;
  const likesCount = post?.likesCount || post?.likes || 0;
  
  // Add timestamp to image URL to prevent caching
  const baseImageUrl = getFullImageUrl(post.featuredImage);
  const imageUrl = baseImageUrl ? `${baseImageUrl}${baseImageUrl.includes('?') ? '&' : '?'}t=${imageTimestamp}` : '';
  
  const tagNames = post.tags || [];
  const mainComments = comments.filter(c => !c.parentId);

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
                icon={likesCount > 0 ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                onClick={handleLike}
              >
                {likesCount}
              </Button>
              {/* Comment button with scroll to comments */}
              <Button 
                icon={<CommentOutlined />} 
                onClick={scrollToComments}
              >
                {comments.length}
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
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden border-0">
          
          {/* Featured Image with cache-busting timestamp */}
          {post.featuredImage && !imageError ? (
            <div className="w-full bg-gray-100">
              <img 
                alt={post.title} 
                src={imageUrl}
                className="w-full object-contain"
                style={{ maxHeight: '500px' }}
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  setImageError(true);
                }}
                onLoad={() => console.log('Image loaded successfully:', imageUrl)}
              />
            </div>
          ) : (
            /* Gradient Fallback */
            <div className="w-full h-64 bg-linear-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-6xl">📝</span>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center mb-6">
              <Avatar 
                icon={<UserOutlined />} 
                src={post.author?.avatar}
                size={64}
                className="border-2 border-green-500 shadow-md"
              >
                {post.author?.name?.charAt(0) || 'U'}
              </Avatar>
              <div className="ml-4">
                <div className="font-bold text-gray-900 text-xl">
                  {post.author?.name || 'Unknown Author'}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ClockCircleOutlined className="mr-1" />
                  <Tooltip title={moment(post.createdAt).format('LLLL')}>
                    <span>{moment(post.createdAt).fromNow()}</span>
                  </Tooltip>
                  {post.readingTime ? (
                    <>
                      <span className="mx-2">·</span>
                      <span>{post.readingTime} min read</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-serif font-bold mb-6">
              {post.title}
            </h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <ReactQuill
                value={post.content}
                readOnly={true}
                theme="bubble"
              />
            </div>

            {/* Tags */}
            {tagNames.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {tagNames.map((tag: string) => (
                  <Link key={tag} href={`/feed?tag=${tag}`}>
                    <Tag 
                      className="px-4 py-1.5 text-sm font-medium rounded-full border-0 cursor-pointer transition-all hover:shadow-md"
                      style={{ 
                        background: '#e6f7e6', 
                        color: '#2e7d32'
                      }}
                    >
                      #{tag}
                    </Tag>
                  </Link>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                {likesCount > 0 ? (
                  <HeartFilled className="text-red-500 text-xl transition-transform hover:scale-110" />
                ) : (
                  <HeartOutlined className="text-xl transition-transform hover:scale-110 hover:text-red-500" />
                )}
                <span className="text-base font-medium">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <CommentOutlined className="text-xl transition-transform hover:scale-110 hover:text-blue-500" />
                <span className="text-base font-medium">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section - added ref */}
        <div ref={commentsSectionRef} className="mt-8 bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-2xl font-serif font-semibold mb-4">
            Comments ({comments.length})
          </h3>
          
          {/* Comment Input */}
          {user ? (
            <div className="mb-8">
              {replyTo && (
                <div className="mb-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">
                    Replying to <span className="font-semibold">{replyTo.author.name}</span>
                  </span>
                  <Button type="link" size="small" onClick={cancelReply}>
                    Cancel
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <Avatar 
                  src={user.avatar} 
                  icon={<UserOutlined />}
                  size={40}
                >
                  {user.name?.charAt(0)}
                </Avatar>
                <div className="flex-1">
                  <Input.TextArea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyTo ? "Write your reply..." : "Write a comment..."}
                    className="mb-2"
                  />
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleCommentSubmit}
                    loading={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {replyTo ? 'Post Reply' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg mb-8">
              <p className="text-gray-600 mb-3">Please login to comment</p>
              <Button type="primary" href="/login" className="bg-green-600 hover:bg-green-700">
                Login
              </Button>
            </div>
          )}
          
          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <Spin />
            </div>
          ) : mainComments.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={mainComments}
              renderItem={(comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={comments.filter(c => c.parentId === comment.id)}
                  onReply={handleReply}
                  onDelete={handleCommentDelete}
                  currentUser={user}
                  isAuthor={isAuthor}
                />
              )}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CommentOutlined className="text-4xl text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg">No comments yet</p>
              <p className="text-gray-400">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Post Confirmation Modal */}
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

      {/* Delete Comment Confirmation Modal */}
      <Modal
        title="Delete Comment"
        open={!!deleteCommentId}
        onOk={() => deleteCommentId && handleCommentDelete(deleteCommentId)}
        onCancel={() => setDeleteCommentId(null)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this comment?</p>
      </Modal>
    </div>
  );
}