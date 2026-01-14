import Link from "next/link";
import { PostSummary } from "@/types/post";

interface PostListProps {
  posts: PostSummary[] | undefined;
  emptyMsg: string;
}

export default function PostList({ posts, emptyMsg }: PostListProps) {
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
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="group block p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
        >
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
            <span>💬 {post.comment_count}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}