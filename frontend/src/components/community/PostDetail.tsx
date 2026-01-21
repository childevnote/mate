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

import CommentSection from "@/components/community/CommentSection";
import LoginAlertModal from "@/components/ui/LoginAlertModal";
import ScrapModal from "@/components/ui/ScrapModal";
import Skeleton from "@/components/common/Skeleton";

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);

  const startTime = useRef<number>(0);

  // 1. 글 상세 데이터 요청
  const {
    data: post,
    isLoading: isPostLoading,
    isError,
    isFetching
  } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => {
      startTime.current = performance.now();
      return postService.getPostDetail(postId);
    },
  });

  // 2. 댓글 데이터도 여기서 같이 요청 (병렬 로딩)
  const {
    data: comments = [],
    isLoading: isCommentLoading
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
  });

  // 3. 둘 중 하나라도 로딩 중이면 전체 로딩 화면 표시
  const isAllLoading = isPostLoading || isCommentLoading;

  useEffect(() => {
    if (!isFetching && startTime.current > 0) {
      const duration = performance.now() - startTime.current;
      console.log(`[Load] ${duration.toFixed(2)}ms`);
      startTime.current = 0;
    }
  }, [isFetching]);

  // 좋아요 Mutation
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);
      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        const willBeLiked = !old.is_liked;
        return {
          ...old,
          is_liked: willBeLiked,
          like_count: willBeLiked ? old.like_count + 1 : Math.max(0, old.like_count - 1),
        };
      });
      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      alert("좋아요 처리에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // 스크랩 Mutation
  const scrapMutation = useMutation({
    mutationFn: postService.toggleScrap,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);
      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        const willBeScrapped = !old.is_scrapped;
        return { ...old, is_scrapped: willBeScrapped };
      });
      const isAdding = !previousPost?.is_scrapped;
      return { previousPost, isAdding };
    },
    onSuccess: (data, variables, context) => {
      if (context?.isAdding) setIsScrapModalOpen(true);
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      alert("스크랩 처리에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
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

  const handleRequireLogin = (action: () => void) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    action();
  };

  const handleLike = () => handleRequireLogin(() => likeMutation.mutate(postId));
  const handleScrap = () => handleRequireLogin(() => scrapMutation.mutate(postId));
  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate(postId);
  };

  if (isError) return <div className="py-20 text-center text-red-500">글을 찾을 수 없습니다.</div>;

  // 통합 로딩 화면 (글 스켈레톤 + 댓글 스켈레톤)
  if (isAllLoading || !post) {
    return (
      <article className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden min-h-screen">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        {/* 댓글 스켈레톤 연결 */}
        <div className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 p-6">
          <Skeleton className="h-6 w-20 mb-6" />
          <Skeleton className="h-24 w-full rounded-xl mb-8" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 h-24">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-2"> <Skeleton className="w-16 h-4" /> <Skeleton className="w-10 h-4" /> </div>
                  <Skeleton className="w-20 h-3" />
                </div>
                <Skeleton className="w-full h-3 mb-2" />
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  }

  const isAuthor = user?.nickname === post.author_nickname;
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <>
      <article className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* 헤더 */}
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
                  {post.author_nickname}
                </span>

                {post.author_university && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 font-medium">
                    {post.author_university}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">조회 {post.view_count}</span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 min-h-[200px]">
          {post.image && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800">
              <img src={post.image} alt={post.title} className="w-full object-contain max-h-[500px]" />
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-300">
            {post.title}
          </p>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-8 flex justify-center gap-4">
          <button onClick={handleLike} disabled={likeMutation.isPending} className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${post.is_liked ? "bg-red-50 border-red-200 text-red-600 font-bold shadow-inner" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <ThumbsUp className={`w-5 h-5 ${post.is_liked ? "fill-current" : ""}`} />
            <span>좋아요 {post.like_count}</span>
          </button>

          <button onClick={handleScrap} disabled={scrapMutation.isPending} className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${post.is_scrapped ? "bg-yellow-50 border-yellow-200 text-yellow-600 font-bold shadow-inner" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <Bookmark className={`w-5 h-5 ${post.is_scrapped ? "fill-current" : ""}`} />
            <span>{post.is_scrapped ? "스크랩됨" : "스크랩"}</span>
          </button>
        </div>

        {/* 푸터 (목록/수정/삭제) */}
        <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800">
          <Link href="/" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">목록으로</Link>
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/posts/${postId}/edit`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">수정</Link>
              <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">삭제</button>
            </div>
          )}
        </div>

        <CommentSection
          postId={postId}
          postAuthorId={post.author_id}
          comments={comments}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />
      </article>

      <LoginAlertModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ScrapModal isOpen={isScrapModalOpen} onClose={() => setIsScrapModalOpen(false)} />
    </>
  );
}