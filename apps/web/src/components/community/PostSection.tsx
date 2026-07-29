"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/postService";
import PostCard from "@/components/community/PostCard";
import { PostSummary, PostSectionProps } from "@/types/post";
import PostListSkeleton from "@/components/community/PostListSkeleton";

export default function PostSection({
  title,
  icon,
  category, 
  sort = "latest",
  link,
}: PostSectionProps) {
  
  const { data, isLoading, isError } = useQuery<PostSummary[]>({
    queryKey: ["posts", category, sort],
    queryFn: () => postService.getPosts(1, "", category, sort),
  });

  // 데이터 안전하게 처리 (배열인지 확인 후 슬라이싱)
  const list = Array.isArray(data) ? data.slice(0, 5) : [];

  // 삭제: 게시글이 없다고 섹션을 숨기지 않고 빈 상태 UI를 표시하도록 변경
  return (
    <div className="flex flex-col h-full">
      {/* 섹션 헤더 영역 */}
      <div className="flex justify-between items-center mb-2 px-1 border-b-2 border-gray-800 pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <span className="text-xl">{icon}</span> {title}
        </h2>
        
        {/* 링크가 존재할 때만 렌더링 */}
        {link && (
          <Link
            href={link}
            className="text-xs text-gray-500 hover:text-primary hover:underline"
          >
            더보기 &gt;
          </Link>
        )}
      </div>

      {/* 게시글 리스트 영역 */}
      <div className="bg-background flex-grow flex flex-col gap-1"> 
        {/* 👇 [수정] 로딩 상태에 따라 분기 처리 */}
        {isLoading ? (
          // 로딩 중: 스켈레톤 5개 보여주기
          Array.from({ length: 5 }).map((_, i) => (
            <PostListSkeleton key={i} />
          ))
        ) : isError ? (
          // 에러 발생 시 에러 메시지 표시
          <div className="py-10 text-center text-red-400 text-sm flex flex-col items-center gap-2">
            <span className="text-2xl opacity-50">⚠️</span>
            <span>데이터를 불러오지 못했습니다.</span>
          </div>
        ) : list.length === 0 ? (
          // 데이터가 없을 때 빈 상태 표시
          <div className="py-10 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
            <span className="text-2xl opacity-50">📭</span>
            <span>게시글이 없습니다.</span>
          </div>
        ) : (
          // 로딩 완료: 실제 데이터 보여주기
          list.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              // 카테고리 필터가 걸려있는 섹션이면 뱃지를 숨김 (!"" === true)
              showCategory={!category}
            />
          ))
        )}
      </div>
    </div>
  );
}