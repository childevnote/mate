"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import Link from "next/link";

import { ThumbsUp, Bookmark } from "lucide-react"; 

import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Post, PostDetailProps } from "@/types/post";
import { CATEGORY_LABELS } from "@/types/category";

// 컴포넌트
import CommentSection from "@/components/community/CommentSection";
import LoginAlertModal from "@/components/ui/LoginAlertModal";

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const startTime = useRef<number>(0);

  const { data: post, isLoading, isError, isFetching } = useQuery<Post>({
    queryKey: ["post", postId], 
    queryFn: () => {
      startTime.current = performance.now();
      return postService.getPostDetail(postId);
    },
  });

  useEffect(() => {
    if (!isFetching && startTime.current > 0) {
      const duration = performance.now() - startTime.current;
      console.log(`[Load] ${duration.toFixed(2)}ms`);
    }
  }, [isFetching, postId]);

  // 좋아요 Mutation
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  // 스크랩 Mutation
  const scrapMutation = useMutation({
    mutationFn: postService.toggleScrap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      alert("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/");
    },
  });

  // 🔒 공통 권한 체크 핸들러
  const handleRequireLogin = (action: () => void) => {
    if (!user) {
      setIsLoginModalOpen(true); // 비회원이면 모달 오픈
      return;
    }
    action(); // 회원이면 원래 하려던 동작 수행
  };

  const handleLike = () => handleRequireLogin(() => likeMutation.mutate(postId));
  const handleScrap = () => handleRequireLogin(() => scrapMutation.mutate(postId));
  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate(postId);
  };

  if (isLoading) return <div className="py-20 text-center">불러오는 중...</div>;
  if (isError || !post) return <div className="py-20 text-center text-red-500">글을 찾을 수 없습니다.</div>;

  const isAuthor = user?.nickname === post.author_nickname;
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <>
      <article className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* 헤더 영역 */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded">
              {categoryLabel}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-gray-500">
              {post.author_nickname?.[0] || "?"}
            </div>
            <div>
              <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                {post.author_nickname}
              </span>
              <span className="text-xs text-gray-400">조회 {post.view_count}</span>
            </div>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="p-6 min-h-[200px]">
          {post.image && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800">
              <img src={post.image} alt={post.title} className="w-full object-contain max-h-[500px]" />
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-300">
            {post.content}
          </p>
        </div>

        <div className="px-6 py-8 flex justify-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${
              post.is_liked
                ? "bg-red-50 border-red-200 text-red-600 font-bold"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${post.is_liked ? "fill-current" : ""}`} />
            <span>좋아요 {post.like_count}</span>
          </button>

          <button
            onClick={handleScrap}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${
              post.is_scrapped
                ? "bg-yellow-50 border-yellow-200 text-yellow-600 font-bold"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.is_scrapped ? "fill-current" : ""}`} />
            <span>스크랩</span>
          </button>
        </div>

        {/* 하단 버튼 (목록/수정/삭제) */}
        <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800">
          <Link
            href="/"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            목록으로
          </Link>
          {isAuthor && (
            <div className="flex gap-2">
              <Link
                href={`/posts/${postId}/edit`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <CommentSection postId={postId} onRequireLogin={() => setIsLoginModalOpen(true)} />
      </article>

      <LoginAlertModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}