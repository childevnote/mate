export interface Comment {
  id: number;
  post_id: number;      
  content: string;
  
  // 작성자 정보
  author_id: number;
  author_nickname: string;
  is_author: boolean;
  author_university?: string;

  // 대댓글 구조
  parent_id: number | null; 
  children?: Comment[];
  
  created_at: string;
  updated_at?: string;
  
  is_deleted?: boolean;
}

export interface CommentSectionProps {
  postId: number;
}