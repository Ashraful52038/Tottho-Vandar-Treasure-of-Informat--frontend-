'use client';

import { Comment } from '@/types/comments';
import { DeleteOutlined, LikeFilled, LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, List } from 'antd';
import moment from 'moment';
import { useState } from 'react';

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (comment: Comment) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  currentUser: any;
  isAuthor: boolean;
}

export const CommentItem = ({ comment, replies, onReply, onLike, onDelete, currentUser, isAuthor }: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const isCommentAuthor = currentUser?.id === comment.author?.id;
  const canDelete = isCommentAuthor || isAuthor;

  const handleLikeClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onLike(comment.id);
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <List.Item className="border-b last:border-b-0 py-4">
      <div className="flex gap-3">
        <Avatar src={comment.author?.avatar} icon={<UserOutlined />} size={40}>
          {comment.author?.name?.charAt(0)}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-semibold">{comment.author?.name}</span>
              <span className="text-xs text-gray-500 ml-2">{moment(comment.createdAt).fromNow()}</span>
            </div>
            {canDelete && (
              <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(comment.id)} />
            )}
          </div>
          
          <p className="text-gray-800 mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button type="text" size="small" disabled={isLoading}
              icon={comment.isLiked ? <LikeFilled className="text-blue-500" /> : <LikeOutlined />}
              onClick={handleLikeClick}>
              {comment.likes || 0}
            </Button>
            
            {currentUser && (
              <Button type="text" size="small" onClick={() => onReply(comment)}>Reply</Button>
            )}
            
            {replies.length > 0 && (
              <Button type="text" size="small" onClick={() => setShowReplies(!showReplies)}>
                {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {showReplies && replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <List dataSource={replies} renderItem={(reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  currentUser={currentUser}
                  isAuthor={isAuthor}
                />
              )} />
            </div>
          )}
        </div>
      </div>
    </List.Item>
  );
};