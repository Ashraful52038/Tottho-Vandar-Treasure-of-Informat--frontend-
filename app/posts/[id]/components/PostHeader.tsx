import { ArrowLeftOutlined, CommentOutlined, DeleteOutlined, EditOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';

interface PostHeaderProps {
  likes: number;
  comments: number;
  isAuthor: boolean;
  isLiked?: boolean;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCommentClick: () => void;
}

export function PostHeader({ likes, comments, isAuthor, onLike, isLiked, onEdit, onDelete, onCommentClick }: PostHeaderProps) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/feed">
            <ArrowLeftOutlined className="text-xl" />
          </Link>
          
          <div className="flex gap-2">
            <Button icon={isLiked || likes > 0 ? <HeartFilled className="text-red-500" /> : <HeartOutlined />} onClick={onLike}>
              {likes}
            </Button>
            <Button icon={<CommentOutlined />} onClick={onCommentClick}>
              {comments}
            </Button>
            {isAuthor && (
              <>
                <Button icon={<EditOutlined />} onClick={onEdit}>Edit</Button>
                <Button danger icon={<DeleteOutlined />} onClick={onDelete}>Delete</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}