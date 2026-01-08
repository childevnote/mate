"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { postService } from "@/services/postService";
import PostCard from "@/components/community/PostCard";
import { Post } from "@/types/post";

export default function PostList() {
  const searchParams = useSearchParams();
  
  // URL 파라미터 가져오기
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const search = searchParams.get("search") || "";
  
  // 페이지 상태 관리
  const [page, setPage] = useState(1);


  // 데이터 요청
  const { data: posts, isLoading, isError, isFetching } = useQuery<Post[]>({
    queryKey: ["posts", category, sort, search, page],
    queryFn: () => postService.getPosts(page, search, category, sort),
    placeholderData: (prev) => prev, // 로딩 중 깜빡임 방지
  });

  const list = Array.isArray(posts) ? posts : [];
  const isLastPage = list.length < 10;

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500">
        목록을 불러오고 있습니다...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-red-500">
        데이터를 불러오지 못했습니다.
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="py-32 text-center text-gray-400 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-200">
        게시글이 없습니다.
      </div>
    );
  }

  return (
    <div>
      {/* 리스트 렌더링 */}
      <div 
        className={`divide-y divide-gray-100 border-b border-gray-100 transition-opacity duration-200 ${
          isFetching ? "opacity-40 pointer-events-none" : "opacity-100"
        }`}
      >
        {list.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            showCategory={!category} 
          />
        ))}
      </div>

      {/* 페이지네이션 (간단하게 이전/다음 버튼 구현) */}
      <div className="flex justify-center items-center gap-4 mt-8 pb-8">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1 || isFetching} // 로딩 중 클릭 방지
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          이전
        </button>
        
        <span className="text-sm font-medium min-w-[60px] text-center">
          {page} 페이지
        </span>
        
        <button
          onClick={() => setPage((old) => old + 1)}
          disabled={isLastPage || isFetching} // 로딩 중 클릭 방지
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}