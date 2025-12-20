import Link from 'next/link';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-background p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-primary rounded-md">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {post.title}
          </h3>
          
          {/* 이미지가 있다면 미리보기 (선택 사항) */}
          {post.image && (
             <div className="mb-3 h-32 w-full bg-gray-100 rounded-lg overflow-hidden relative">
               {/* Next/Image 사용 권장하지만, 초기엔 img 태그로 빠르게 구현 */}
               <img src={post.image} alt="preview" className="object-cover w-full h-full" />
             </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-muted-foreground font-bold overflow-hidden">
               {/* 프로필 이미지가 없으면 첫 글자 */}
               {post.author_nickname?.[0]}
            </div>
            <span className="truncate max-w-[80px]">{post.author_nickname}</span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">👁️ {post.view_count}</span>
            <span className="flex items-center gap-1">❤️ {post.like_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}