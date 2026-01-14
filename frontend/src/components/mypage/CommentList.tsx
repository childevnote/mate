import Link from "next/link";
import { Comment as IComment } from "@/types/comment";

interface CommentListProps {
  comments: IComment[] | undefined;
}

export default function CommentList({ comments }: CommentListProps) {
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
        <Link
          key={comment.id}
          href={`/posts/${comment.post_id}`}
          className="group block p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-200"
        >
          <p className="text-gray-800 text-sm mb-2 line-clamp-2">
            {comment.content}
          </p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              이동 →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}