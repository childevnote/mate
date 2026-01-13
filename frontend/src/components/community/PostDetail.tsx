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

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);

  const startTime = useRef<number>(0);

  const { 
    data: post, 
    isLoading, 
    isError, 
    isFetching
  } = useQuery<Post>({
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
      startTime.current = 0;
    }
  }, [isFetching]);

  // 좋아요 Mutation (낙관적 업데이트: 즉시 반영)
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        
        // 현재 상태의 반대로 뒤집기
        const willBeLiked = !old.is_liked;
        
        return {
          ...old,
          is_liked: willBeLiked,
          // 좋아요 추가면 +1, 취소면 -1
          like_count: willBeLiked ? old.like_count + 1 : Math.max(0, old.like_count - 1),
        };
      });

      // 에러 났을 때 복구하기 위해 이전 상태 리턴
      return { previousPost };
    },
    
    // 에러 나면 원상복구 (Rollback)
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      alert("좋아요 처리에 실패했습니다.");
    },
    
    // 성공하든 실패하든 서버랑 최종 동기화 (Sync)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // 스크랩 Mutation (낙관적 업데이트)
  const scrapMutation = useMutation({
    mutationFn: postService.toggleScrap,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        const willBeScrapped = !old.is_scrapped;
        
        return {
          ...old,
          is_scrapped: willBeScrapped,
        };
      });
      
      // 모달 띄우기 조건 계산 (추가하는 행위일 때만 true)
      const isAdding = !previousPost?.is_scrapped;
      
      return { previousPost, isAdding };
    },
    
    // 성공 시 모달 처리
    onSuccess: (data, variables, context) => {
      // "스크랩을 추가한 동작"이었고, 서버도 성공했다면 모달 오픈
      if (context?.isAdding) {
        setIsScrapModalOpen(true);
      }
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

  if (isLoading) return <div className="py-20 text-center">불러오는 중...</div>;
  if (isError || !post) return <div className="py-20 text-center text-red-500">글을 찾을 수 없습니다.</div>;

  const isAuthor = user?.nickname === post.author_nickname;
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <>
      <article className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
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

        {/*  */}
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

        <div className="px-6 py-8 flex justify-center gap-4">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${
              post.is_liked
                ? "bg-red-50 border-red-200 text-red-600 font-bold shadow-inner" 
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${post.is_liked ? "fill-current" : ""}`} />
            <span>좋아요 {post.like_count}</span>
          </button>

          <button
            onClick={handleScrap}
            disabled={scrapMutation.isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${
              post.is_scrapped
                ? "bg-yellow-50 border-yellow-200 text-yellow-600 font-bold shadow-inner"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.is_scrapped ? "fill-current" : ""}`} />
            <span>{post.is_scrapped ? "스크랩됨" : "스크랩"}</span>
          </button>
        </div>

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
      <ScrapModal 
        isOpen={isScrapModalOpen}
        onClose={() => setIsScrapModalOpen(false)}
      />
    </>
  );
}