"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/postService";
import PostCard from "@/components/community/PostCard";
import { Post } from "@/types/post";
import { PostSectionProps } from "@/types/post";


export default function PostSection({
  title,
  icon,
  category = "", 
  sort = "latest",
  link,
}: PostSectionProps) {
  
  const { data } = useQuery<Post[]>({
    queryKey: ["posts", category, sort],
    queryFn: () => postService.getPosts(1, "", category, sort),
  });

  // 데이터 안전하게 처리 (배열인지 확인 후 슬라이싱)
  const list = Array.isArray(data) ? data.slice(0, 5) : [];

  // 게시글이 없으면 섹션 자체를 렌더링하지 않음 (빈 박스 방지)
  if (list.length === 0) return null;

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
      <div className="bg-background flex-grow">
        {list.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            // 카테고리 필터가 걸려있는 섹션이면 뱃지를 숨김 (!"" === true)
            showCategory={!category}
          />
        ))}
      </div>
    </div>
  );
}