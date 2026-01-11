import Link from "next/link";
import { Post } from "@/types/post";
import { CATEGORY_LABELS } from "@/types/category";

interface PostCardProps {
  post: Post;
  showCategory?: boolean;
}

export default function PostCard({ post, showCategory = true }: PostCardProps) {
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
  const hasImage = post.image && post.image !== "string";

  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="flex items-center justify-between py-3 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer min-h-[50px] rounded-lg">
        
        {/* 왼쪽: 카테고리 + 제목 */}
        <div className="flex items-center gap-3 overflow-hidden">
          {showCategory && (
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500 min-w-[30px]">
                {categoryLabel}
              </span>
            </div>
          )}

          {/* 제목 */}
          <div className="flex items-center gap-2 truncate">
            <h3 className="text-[15px] font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            {/* 이미지가 있는 글이면 아이콘 표시 */}
            {hasImage && (
              <span className="text-xs text-gray-400">📷</span>
            )}
            {/* 새 글이면 N 표시 (24시간 이내) */}
            {new Date().getTime() - new Date(post.created_at).getTime() < 24 * 60 * 60 * 1000 && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">N</span>
            )}
          </div>
        </div>

        {/* 오른쪽: 메타 정보 (작성자, 조회, 좋아요) */}
        <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0 ml-4">
          <span className="hidden sm:inline-block truncate max-w-[60px]">
            {post.author_nickname || "익명"}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              👁️ {post.view_count}
            </span>
            {post.like_count > 0 && (
              <span className="flex items-center gap-0.5 text-red-400">
                ❤️ {post.like_count}
              </span>
            )}
            {post.comment_count > 0 && (
              <span className="flex items-center gap-0.5 text-blue-400">
                💬 {post.comment_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}