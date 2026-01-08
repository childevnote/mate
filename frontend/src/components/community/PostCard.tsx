import Link from "next/link";
import { Post } from "@/types/post";
// import Image from "next/image";
import { CATEGORY_LABELS } from "@/types/category";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {

  const hasValidImage = post.image && post.image !== "string" && post.image.trim() !== "";
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-background p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-primary/5 text-primary rounded-md">
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {post.title}
          </h3>

          {/* [수정 포인트] 이미지가 유효할 때만 렌더링 */}
        {hasValidImage ? (
          <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
            <img
              src={post.image!}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : null}
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-muted-foreground font-bold overflow-hidden">
              {/* 프로필 이미지가 없으면 첫 글자 */}
              {post.author_nickname?.[0]}
            </div>
            <span className="truncate max-w-[80px]">
              {post.author_nickname}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1">
                👁️ {post.view_count}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1">
                ❤️ {post.like_count}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬{post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
