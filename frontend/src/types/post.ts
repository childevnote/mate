export interface Post {
  id: number;
  category: string;
  title: string;
  content: string;
  image?: string | null;
  author_nickname: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface PostDetailProps {
  postId: number;
}

export interface PostListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}
