import PostList from "@/components/community/PostList";
import SearchBar from "@/components/community/SearchBar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <SearchBar />
        </div>
        <PostList />
      </main>
    </div>
  );
}
