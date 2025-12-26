import PostList from "@/components/community/PostList";
import SearchBar from "@/components/community/SearchBar";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <Suspense fallback={<div>검색창 로딩 중...</div>}>
            <SearchBar />
          </Suspense>
        </div>
        <Suspense fallback={<div>게시글 목록 로딩 중...</div>}>
          <PostList />
        </Suspense>
      </main>
    </div>
  );
}
