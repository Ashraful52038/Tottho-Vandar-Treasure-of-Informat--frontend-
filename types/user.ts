export interface User {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    avatar?: string;
    bio?: string;
    role: 'user' | 'admin' | 'moderator';
    createdAt?: string;
    updatedAt?: string;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  excerpt?: string;
  authorId?: string | number;
  author?: {
    id: string | number;
    name: string;
    email?: string;
    avatar?: string | null;
  } | User;  // ✅ both formats accepted
  tags: string[] | any[];
  featuredImage?: string | null;
  likes?: number;
  likesCount?: number;
  comments?: number;
  commentsCount?: number;
  readingTime?: number;
  published?: boolean;
  status?: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface MessageResponse {
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    author?: User;
    postId: string;
    likes: number;
    likesCount?: number;
    createdAt: string;
    updatedAt: string;
    isLiked?: boolean;
    parentId?: string; // for nested comments
    replies?: Comment[];
}


export interface PostFilters {
    tag?: string;
    author?: string;
    search?: string;
    sortBy?: 'latest' | 'popular' | 'trending';
    page?: number;
    limit?: number;
}