"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostList from "@/components/community/PostList";
import SearchBar from "@/components/community/SearchBar";
import { CATEGORY_LABELS, BoardCategory } from "@/types/category";

function PostsPageContent() {
  const searchParams = useSearchParams();
  
  const rawCategory = searchParams.get("category");
  const sort = searchParams.get("sort") || "latest";
  const search = searchParams.get("search") || "";

  // 2. 카테고리 유효성 검사 (Type Guard)
  // URL에서 가져온 문자열이 실제 정의된 카테고리 키인지 확인
  const isValidCategory = rawCategory && Object.keys(CATEGORY_LABELS).includes(rawCategory);
  const category = isValidCategory ? (rawCategory as BoardCategory) : undefined;

  // 3. 페이지 제목 결정하기
  let pageTitle = "전체 게시글";
  
  if (search) {
    pageTitle = `'${search}' 검색 결과`;
  } else if (sort === "best") {
    pageTitle = "🔥 베스트 인기 글";
  } else if (category) {
    pageTitle = `📂 ${CATEGORY_LABELS[category]} 게시판`;
  } else if (sort === "latest" && !category) {
    pageTitle = "⏰ 실시간 최신 글";
  }

  // 필터 키 생성 (리스트 강제 새로고침용)
  const filterKey = `${category || "ALL"}-${sort}-${search}`;

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
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground">페이지 로딩 중...</div>}>
      <PostsPageContent />
    </Suspense>
  );
}