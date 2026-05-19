import { UserComment } from "@/lib/api/user";
import { HeartOutlined } from "@ant-design/icons";
import moment from "moment";
import { token } from "../constant/theme";
import { EmptyState } from "./EmptyState";
import { LoadMoreBtn } from "./LoadMoreBtn";

interface UserCommentsProps{
    comments: UserComment[];
    hasMore: boolean;
    onLoadMore: () => void;
}

export function UserComments({ comments, onLoadMore, hasMore }: UserCommentsProps) {
  return (
    <div>
      {comments.length ? (
        <>
          {comments.map(c => (
            <div
              key={c.id}
              onClick={() => window.location.href = `/posts/${c.postId}`}
              style={{ display: 'flex', gap: 14, border: `1px solid ${token.border}`, borderRadius: 12,
              padding: '16px 20px', marginBottom: 12, cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = token.border2; e.currentTarget.style.background = token.accentPale; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = token.border; e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: 3, borderRadius: 2, background: token.accentLight, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: token.text, marginBottom: 8, lineHeight: 1.6 }}>{c.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: token.muted }}>
                  <span>on <span style={{ color: token.accent, fontWeight: 500 }}>{c.postTitle || 'Post'}</span></span>
                  <span><HeartOutlined /> {c.likes || 0} · {moment(c.createdAt).fromNow()}</span>
                </div>
              </div>
            </div>
          ))}
          {hasMore && <LoadMoreBtn onClick={onLoadMore} />}
        </>
      ) : (
        <EmptyState icon="💬" text="No comments yet." />
      )}
    </div>
  );
}