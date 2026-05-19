import { FollowUser } from "@/lib/api/user";
import { getFullImageUrl } from "@/utils/imageUtils";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import Link from "next/link";
import { btnFollowing, btnOutline, token } from "../constant/theme";


export function FollowCard({ user, currentUserId, onToggle }: { user: FollowUser; currentUserId?: string; onToggle: () => void; }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${token.border}`,
    borderRadius: 12, padding: '14px 18px', marginBottom: 10, transition: 'border-color .15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = token.border2)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = token.border)}
    >
      <Avatar
        size={44} src={getFullImageUrl(user.avatar)} icon={<UserOutlined />}
        style={{ background: token.accentLight, color: token.accent, flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <Link href={`/profile/${user.id}`} style={{ fontWeight: 500, color: token.accent,
            fontSize: 14, textDecoration: 'none' }}>
          {user.name}
        </Link>
        {user.bio && <p style={{ fontSize: 12, color: token.muted, marginTop: 2 }}>{user.bio}</p>}
      </div>
      {currentUserId && currentUserId !== user.id && (
        <button
          onClick={onToggle}
          style={{ ...(user.isFollowing ? btnFollowing : btnOutline), fontSize: 12, padding: '6px 14px' }}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}