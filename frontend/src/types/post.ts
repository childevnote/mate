import { BoardCategory } from "./category";
import { PaginatedResponse } from "./common";

// 목록용 포스트 타입 (PostSummary)
export interface PostSummary {
  id: number;
  category: BoardCategory;
  title: string;
  author_id: number;
  author_nickname: string;
  view_count: number;
  created_at: string;
}

// 상세용 포스트 타입 (PostDetail)
// 목록용 타입(PostSummary)을 상속받아 확장
export interface PostDetail extends PostSummary {
  is_author: boolean;
  image?: string | null;
  comment_count: number;
  like_count: number;
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