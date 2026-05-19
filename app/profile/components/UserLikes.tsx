import type { UserLike } from '@/lib/api/user';
import { HeartFilled } from '@ant-design/icons';
import moment from 'moment';
import { token } from '../constant/theme';
import { EmptyState } from './EmptyState';
import { LoadMoreBtn } from './LoadMoreBtn';

interface UserLikesProps {
  likes: UserLike[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function UserLikes({ likes, onLoadMore, hasMore }: UserLikesProps) {
  return (
    <div>
      {likes.length ? (
        <>
          {likes.map(like => (
            <div
              key={like.id}
              onClick={() => window.location.href = like.postId ? `/posts/${like.postId}` : '#'}
              style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${token.border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 10, cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c6c6'; e.currentTarget.style.background = '#fff9f9'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = token.border; e.currentTarget.style.background = 'transparent'; }}
            >
              <HeartFilled style={{ color: '#e74c3c', fontSize: 18, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14 }}>
                {like.type === 'post'
                  ? <>Liked a post: <strong style={{ color: token.accent }}>{like.postTitle || 'Post'}</strong></>
                  : <>Liked a comment: <em style={{ color: token.muted }}>"{like.content}"</em> on <strong style={{ color: token.accent }}>{like.postTitle || 'Post'}</strong></>
                }
              </div>
              <span style={{ fontSize: 12, color: token.muted, flexShrink: 0 }}>{moment(like.createdAt).fromNow()}</span>
            </div>
          ))}
          {hasMore && <LoadMoreBtn onClick={onLoadMore} />}
        </>
      ) : (
        <EmptyState icon="🤍" text="No likes yet." />
      )}
    </div>
  );
}