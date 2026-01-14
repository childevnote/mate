"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

// 상태 및 서비스
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { authService } from "@/services/authService";

// 컴포넌트
import MyPageSidebar from "@/components/mypage/MyPageSidebar";
import MyInfoSection from "@/components/mypage/MyInfoSection";
import PostList from "@/components/mypage/PostList";
import CommentList from "@/components/mypage/CommentList";

type TabType = "info" | "posts" | "comments" | "scraps";

export default function MyPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // 1. 내가 쓴 글 조회
  const { data: myPosts } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => postService.getMyPosts(),
    enabled: !!user && activeTab === "posts",
  });

  // 2. 내가 쓴 댓글 조회
  const { data: myComments } = useQuery({
    queryKey: ["myComments", user?.id],
    queryFn: () => postService.getMyComments(user!.id),
    enabled: !!user && activeTab === "comments",
  });

  // 3. 스크랩한 글 조회
  const { data: scrappedPosts } = useQuery({
    queryKey: ["scrappedPosts"],
    queryFn: () => postService.getMyScraps(),
    enabled: !!user && activeTab === "scraps",
  });

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  // 비로그인 처리
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">로그인이 필요한 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-10 text-gray-900">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* 왼쪽: 사이드바 컴포넌트 */}
        <MyPageSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />

        {/* 오른쪽: 메인 컨텐츠 컴포넌트 */}
        <main className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm min-h-[600px]">
          {activeTab === "info" && <MyInfoSection user={user} />}
          
          {activeTab === "posts" && (
            <PostList posts={myPosts} emptyMsg="아직 작성한 글이 없습니다." />
          )}
          
          {activeTab === "comments" && (
            <CommentList comments={myComments} />
          )}
          
          {activeTab === "scraps" && (
            <PostList posts={scrappedPosts} emptyMsg="스크랩한 글이 없습니다." />
          )}
        </main>
      </div>
    </div>
  );
}