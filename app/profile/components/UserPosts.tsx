import PostCard from "@/components/posts/PostCard";
import { UserPost } from "@/lib/api/user";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import { btnPrimary } from "../constant/theme";
import { EmptyState } from "./EmptyState";
import { LoadMoreBtn } from "./LoadMoreBtn";

interface UserPostsProps { 
    posts: UserPost[]; 
    userId: string;
    isOwnProfile: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

export function UserPosts({ posts, isOwnProfile, onLoadMore, hasMore }: UserPostsProps) {
  return (
    <div>
      {isOwnProfile && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Link href="/posts/create">
            <button style={btnPrimary}><PlusOutlined /> Create Post</button>
          </Link>
        </div>
      )}
      {posts.length ? (
        <>
          <div style={{ display: 'grid', gap: 14 }}>
            {posts.map(post => <PostCard key={post.id} post={post as any} />)}
          </div>
          {hasMore && <LoadMoreBtn onClick={onLoadMore} />}
        </>
      ) : (
        <EmptyState icon="📝" text="No posts yet." />
      )}
    </div>
  );
}