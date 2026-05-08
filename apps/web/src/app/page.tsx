"use client";

import { Suspense } from "react";
import SearchBar from "@/components/community/SearchBar";
import PostSection from "@/components/community/PostSection";
import { CATEGORY_OPTIONS } from "@/types/category";
import MainLoadLogger from "@/components/common/MainLoadLogger";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainLoadLogger />
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* 상단 검색창 (Suspense로 감싸서 useSearchParams 사용 시의 렌더링 지연 처리) */}
        <div className="flex justify-end mb-8">
          <Suspense fallback={<div>검색창 로딩 중...</div>}>
            <SearchBar />
          </Suspense>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="space-y-12">
          
          {/* 1. 베스트 인기 글 섹션 */}
          <section>
            <PostSection
              title="베스트 인기 글"
              icon="🔥"
              sort="best"
              link="/posts?sort=best"
            />
          </section>

          {/* 2. 실시간 최신 글 섹션 */}
          <section>
            <PostSection
              title="실시간 최신 글"
              icon="⏰"
              sort="latest"
              link="/posts"
            />
          </section>

          {/* 3. 카테고리별 게시판 섹션 (2열 그리드 레이아웃) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {CATEGORY_OPTIONS.map((option) => (
              <PostSection
                key={option.value}
                title={`${option.label} 게시판`}
                icon="📂"
                category={option.value} // "INFO", "FREE" 등
                link={`/posts?category=${option.value}`}
              />
            ))}
          </section>

        </div>
      </main>
    </div>
  );
}