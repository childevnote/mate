export interface Comment {
  id: number;
  post: number;
  content: string;
  author_nickname: string;
  parent: number | null;
  children?: Comment[];
  created_at: string;
  updated_at?: string;
}

export interface CommentSectionProps {
  postId: number;
}
