"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

// 상태 및 서비스
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { authService } from "@/services/authService";

// 타입
import { PostSummary } from "@/types/post";
import { Comment as IComment } from "@/types/comment";

// 컴포넌트
import MyPageSidebar from "@/components/mypage/MyPageSidebar";
import MyInfoSection from "@/components/mypage/MyInfoSection";
import PostList from "@/components/mypage/PostList";
import CommentList from "@/components/mypage/CommentList";
import Spinner from "@/components/ui/Spinner"; // 🔥 스피너 컴포넌트 (파일 경로 확인!)

type TabType = "info" | "posts" | "comments" | "scraps";

export default function MyPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // ----------------------------------------------------------------
  // 1. Data Fetching
  // enabled 옵션 때문에 탭을 누르는 순간 fetch가 시작되며 isLoading이 true가 됩니다.
  // ----------------------------------------------------------------
  
  // 내가 쓴 글
  const { data: myPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => postService.getMyPosts(),
    enabled: !!user && activeTab === "posts",
  });

  // 내가 쓴 댓글
  const { data: myComments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["myComments", user?.id],
    queryFn: () => postService.getMyComments(user!.id),
    enabled: !!user && activeTab === "comments",
  });

  // 스크랩한 글
  const { data: scrappedPosts, isLoading: isScrapsLoading } = useQuery({
    queryKey: ["scrappedPosts"],
    queryFn: () => postService.getMyScraps(),
    enabled: !!user && activeTab === "scraps",
  });

  // ----------------------------------------------------------------
  // 2. Mutations (낙관적 업데이트 적용)
  // ----------------------------------------------------------------

  // 게시글 삭제
  const deletePostMutation = useMutation({
    mutationFn: postService.deletePost,
    onMutate: async (deletedPostId) => {
      await queryClient.cancelQueries({ queryKey: ["myPosts"] });
      const previousPosts = queryClient.getQueryData<PostSummary[]>(["myPosts"]);

      queryClient.setQueryData<PostSummary[]>(["myPosts"], (old) => {
        if (!old) return [];
        return old.filter((post) => post.id !== deletedPostId);
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["myPosts"], context?.previousPosts);
      alert("삭제 실패");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });

  // 댓글 삭제
  const deleteCommentMutation = useMutation({
    mutationFn: postService.deleteComment,
    onMutate: async (deletedCommentId) => {
      const queryKey = ["myComments", user?.id];
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<IComment[]>(queryKey);

      queryClient.setQueryData<IComment[]>(queryKey, (old) => {
        if (!old) return [];
        return old.filter((comment) => comment.id !== deletedCommentId);
      });

      return { previousComments, queryKey };
    },
    onError: (err, variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousComments);
      }
      alert("댓글 삭제 실패");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myComments", user?.id] });
    },
  });

  // 스크랩 취소
  const unscrapMutation = useMutation({
    mutationFn: postService.toggleScrap,
    onMutate: async (unscrappedPostId) => {
      await queryClient.cancelQueries({ queryKey: ["scrappedPosts"] });
      const previousScraps = queryClient.getQueryData<PostSummary[]>(["scrappedPosts"]);

      queryClient.setQueryData<PostSummary[]>(["scrappedPosts"], (old) => {
        if (!old) return [];
        return old.filter((post) => post.id !== unscrappedPostId);
      });

      return { previousScraps };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["scrappedPosts"], context?.previousScraps);
      alert("스크랩 취소 실패");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["scrappedPosts"] });
    },
  });

  // ----------------------------------------------------------------
  // 3. Handlers
  // ----------------------------------------------------------------
  
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("정말 이 글을 삭제하시겠습니까?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleUnscrap = (postId: number) => {
    if (confirm("스크랩을 취소하시겠습니까?")) {
      unscrapMutation.mutate(postId);
    }
  };

  // ----------------------------------------------------------------
  // 4. Render Logic (가독성 개선)
  // ----------------------------------------------------------------

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case "info":
        return <MyInfoSection user={user} />;
      
      case "posts":
        if (isPostsLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <Spinner className="w-10 h-10 text-indigo-500" />
            </div>
          );
        }
        return (
          <PostList 
            posts={myPosts} 
            emptyMsg="아직 작성한 글이 없습니다." 
            mode="my_posts"
            onAction={handleDeletePost}
          />
        );

      case "comments":
        if (isCommentsLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <Spinner className="w-10 h-10 text-indigo-500" />
            </div>
          );
        }
        return (
          <CommentList 
            comments={myComments} 
            onDelete={handleDeleteComment}
          />
        );

      case "scraps":
        if (isScrapsLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <Spinner className="w-10 h-10 text-indigo-500" />
            </div>
          );
        }
        return (
          <PostList 
            posts={scrappedPosts} 
            emptyMsg="스크랩한 글이 없습니다." 
            mode="scraps"
            onAction={handleUnscrap}
          />
        );
        
      default:
        return null;
    }
  };

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
        {/* 사이드바 */}
        <MyPageSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm min-h-[600px] relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}