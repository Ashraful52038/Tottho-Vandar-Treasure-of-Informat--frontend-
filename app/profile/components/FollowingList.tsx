import { FollowUser } from "@/lib/api/user";
import { useAppDispatch } from "@/store/hooks/reduxHooks";
import { followUser, unfollowUser } from "@/store/slices/profileSlice";
import { message } from "antd";
import { EmptyState } from "./EmptyState";
import { FollowCard } from "./FollowCard";
import { LoadMoreBtn } from "./LoadMoreBtn";

interface FollowingListProps {
    following: FollowUser[];
    currentUserId?: string;
    onLoadMore:() => void;
    hasMore: boolean;
}

export function FollowingList({ following, currentUserId, onLoadMore, hasMore }: FollowingListProps) {
  const dispatch = useAppDispatch();

  const handleToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        message.success('Unfollowed');
      }else {
        await dispatch(followUser(userId)).unwrap();
        message.success('Followed');
      }
    } catch {
      message.error('Failed');
    }
  };
  return (
    <div>
      {following.length ? (
        <>
          {following.map(f => (
            <FollowCard key={f.id} user={f} currentUserId={currentUserId} 
            onToggle={() => handleToggle(f.id, f.isFollowing)} />
          ))}
          {hasMore && <LoadMoreBtn onClick={onLoadMore} />}
        </>
      ) : (
        <EmptyState icon="🔍" text="Not following anyone yet." />
      )}
    </div>
  );
}