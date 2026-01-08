'use client'

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { postService } from '@/services/postService';
import PostCard from './PostCard';
import { PostListResponse } from '@/types/post';

export default function PostList() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const { data, isLoading, isError } = useQuery<PostListResponse>({
    queryKey: ['posts', searchKeyword],
    queryFn: () => postService.getPosts(1, searchKeyword),
    placeholderData: (previousData) => previousData,
  });

  const posts = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-2">데이터를 불러오지 못했습니다.</p>
        <button onClick={() => window.location.reload()} className="text-sm underline text-muted-foreground">
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-2">
        <h2 className="text-xl font-bold text-foreground">
          {searchKeyword ? `'${searchKeyword}' 검색 결과` : '최근 올라온 글'}
        </h2>
        <span className="text-sm text-muted-foreground">
          {/* data.count가 없으면 0으로 처리 */}
            총 <span className="font-bold text-primary">{posts.length}</span>개의 이야기        
        </span>
      </div>

      {/* posts 변수는 무조건 배열이므로 length 체크가 안전함 */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* posts.map 사용 (data.results.map 보다 안전하고 깔끔함) */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-lg">
            {searchKeyword ? '검색 결과가 없습니다.' : '아직 등록된 게시글이 없습니다.'}
          </p>
          {searchKeyword && (
            <p className="text-sm text-muted-foreground mt-2">다른 키워드로 검색해보세요.</p>
          )}
        </div>
      )}
    </div>
  );
}