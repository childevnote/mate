import Link from "next/link";
import { PostSummary } from "@/types/post";

interface PostListProps {
  posts: PostSummary[] | undefined;
  emptyMsg: string;
  mode: "my_posts" | "scraps";
  onAction: (postId: number) => void; 
}

export default function PostList({ posts, emptyMsg, mode, onAction }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {posts.map((post) => (
        <div 
          key={post.id}
          className="group relative bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
        >
          <Link href={`/posts/${post.id}`} className="block p-4 pb-10"> {/* 버튼 공간 확보를 위해 pb-10 */}
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
              {post.title}
            </h4>
            <div className="flex gap-3 text-xs text-gray-500 font-medium">
              <span>👁️ {post.view_count}</span>
            </div>
          </Link>

          <div className="absolute bottom-3 right-4 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction(post.id);
              }}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                mode === "my_posts" 
                  ? "text-red-500 hover:bg-red-50" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {mode === "my_posts" ? "삭제" : "스크랩 취소"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}