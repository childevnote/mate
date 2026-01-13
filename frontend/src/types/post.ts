import { BoardCategory } from "./category";
import { PaginatedResponse } from "./common";

export interface Post {
  id: number;
  category: BoardCategory;
  title: string;
  content: string;
  image?: string | null;
  
  // 작성자 정보
  author_id: number;
  author_nickname: string;
  is_author: boolean;

  // 통계
  view_count: number;
  like_count: number;
  comment_count: number;
  
  created_at: string;

  is_liked: boolean;     
  is_scrapped: boolean;
}

export interface PostDetailProps {
  postId: number;
}

export interface PostListProps {
  posts: Post[] | undefined;
  isLoading?: boolean;
  emptyMsg: string;
}

export type PostListResponse = PaginatedResponse<Post>;

export interface PostSectionProps {
  title: string;
  icon: string;
  category?: BoardCategory; 
  sort?: string;     
  link?: string;     
}