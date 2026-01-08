"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostList from "@/components/community/PostList";
import SearchBar from "@/components/community/SearchBar";
import { CATEGORY_LABELS } from "@/types/category";

function PostsPageContent() {
  const searchParams = useSearchParams();
  
  // URL에서 파라미터 읽기
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const search = searchParams.get("search") || "";

  // 페이지 제목 결정하기
  let pageTitle = "전체 게시글";
  
  if (search) {
    pageTitle = `'${search}' 검색 결과`;
  } else if (sort === "best") {
    pageTitle = "🔥 베스트 인기 글";
  } else if (category && CATEGORY_LABELS[category]) {
    pageTitle = `📂 ${CATEGORY_LABELS[category]} 게시판`;
  } else if (sort === "latest" && !category) {
    pageTitle = "⏰ 실시간 최신 글";
  }


  const filterKey = `${category}-${sort}-${search}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
          <div className="w-full md:w-auto">
            <SearchBar />
          </div>
        </div>

        <div className="bg-background border-t border-gray-100 min-h-[500px]">
          <PostList key={filterKey} />
        </div>
      </main>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">페이지 로딩 중...</div>}>
      <PostsPageContent />
    </Suspense>
  );
}