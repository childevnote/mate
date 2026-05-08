import type { BoardCategory } from "./category";
import type { PaginatedResponse } from "./common";

// 목록용 포스트 타입
export interface PostSummary {
  id: number;
  category: BoardCategory;
  title: string;
  author_id: number;
  author_nickname: string;
  author_university?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  scrap_count: number;
  created_at: string;
}

// 상세용 포스트 타입
export interface PostDetail extends PostSummary {
  is_author: boolean;
  content: string;
  image?: string | null;
  media_urls: string[];
  is_liked: boolean;
  is_scrapped: boolean;
}

export type Post = PostDetail;

export interface PostDetailProps {
  postId: number;
}

export interface PostListProps {
  posts: PostSummary[] | undefined;
  isLoading?: boolean;
  emptyMsg: string;
}

export type PostListResponse = PaginatedResponse<PostSummary>;

export interface PostSectionProps {
  title: string;
  icon: string;
  category?: BoardCategory;
  sort?: string;
  link?: string;
}
