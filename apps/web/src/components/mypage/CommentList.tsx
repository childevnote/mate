import Link from "next/link";
import { Comment as IComment } from "@/types/comment";

interface CommentListProps {
  comments: IComment[] | undefined;
  onDelete: (commentId: number) => void;
}

export default function CommentList({ comments, onDelete }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p>작성한 댓글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div 
          key={comment.id} 
          className="group block bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-200 relative"
        >
          {/* 클릭 시 게시글 이동 */}
          <Link href={`/posts/${comment.post_id}`} className="block p-4">
            <div className="flex justify-between items-start mb-2 gap-4">
               <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md line-clamp-1 max-w-[70%]">
                 {comment.post_title || "제목 없음"}
               </span>
            </div>

            <p className="text-gray-800 text-sm mb-2 line-clamp-2">
              {comment.content}
            </p>
            
            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </div>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(comment.id);
            }}
            className="absolute bottom-4 right-4 text-xs font-medium text-red-400 hover:text-red-600 hover:underline z-10"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}