export interface Comment {
  id: number;
  post_id: number;      
  content: string;
  author_nickname: string;
  parent_id: number | null; 
  children?: Comment[];
  created_at: string;
  updated_at?: string;
}

export interface CommentSectionProps {
  postId: number;
}