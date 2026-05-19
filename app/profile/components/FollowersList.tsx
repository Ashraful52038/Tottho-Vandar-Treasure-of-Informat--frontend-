import { FollowUser } from "@/lib/api/user";
import { useAppDispatch } from "@/store/hooks/reduxHooks";
import { followUser, unfollowUser } from "@/store/slices/profileSlice";
import { message } from "antd";
import { EmptyState } from "./EmptyState";
import { FollowCard } from "./FollowCard";
import { LoadMoreBtn } from "./LoadMoreBtn";

interface FollowersListProps {
    followers: FollowUser[];
    currentUserId?: string;
    hasMore: boolean;
    onLoadMore: () => void;
}

export function FollowersList({ followers, currentUserId, onLoadMore, hasMore }: FollowersListProps) {
  const dispatch = useAppDispatch();
  const handleFollow = async (userId: string, isF: boolean) => {
    try {
      if (isF) await dispatch(unfollowUser(userId)).unwrap();
      else await dispatch(followUser(userId)).unwrap();
      message.success(isF ? 'Unfollowed' : 'Followed');
    } catch { message.error('Failed'); }
  };
  return (
    <div>
      {followers.length ? (
        <>
          {followers.map(f => (
            <FollowCard key={f.id} user={f} currentUserId={currentUserId} onToggle={() => handleFollow(f.id, f.isFollowing)} />
          ))}
          {hasMore && <LoadMoreBtn onClick={onLoadMore} />}
        </>
      ) : (
        <EmptyState icon="👥" text="No followers yet." />
      )}
    </div>
  );
}