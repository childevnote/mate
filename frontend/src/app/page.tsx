// src/app/page.tsx
import Navbar from '@/components/layout/Navbar';
import PostList from '@/components/community/PostList';
import SearchBar from '@/components/community/SearchBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. 상단 네비게이션 */}
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 2. 검색 바 영역 */}
        <div className="flex justify-end mb-8">
          <SearchBar />
        </div>

        {/* 3. 게시글 목록 영역 */}
        <PostList />
      </main>
    </div>
  );
}