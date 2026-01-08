"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Post } from "@/types/post";
import Link from "next/link";
import CommentSection from "@/components/community/CommentSection";
import { PostDetailProps } from "@/types/post";
import { CATEGORY_LABELS } from "@/types/category";

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);

  const startTime = useRef<number>(0);

  // React Query로 데이터 가져오기
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
      console.log(`[상세글 로딩 완료] (ID:${postId}) 소요시간: ${duration.toFixed(2)}ms`);
    }
  }, [isFetching, postId]);


  const deleteMutation = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      alert("게시글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/");
    },
    onError: (err) => {
      console.error(err);
      alert("삭제에 실패했습니다. 권한이 없거나 서버 오류입니다.");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm("정말로 이 글을 삭제하시겠습니까? 복구할 수 없습니다.")
    ) {
      deleteMutation.mutate(postId);
    }
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-muted-foreground">
        게시글을 불러오는 중...
      </div>
    );
  if (isError || !post)
    return (
      <div className="py-20 text-center text-red-500">
        게시글을 찾을 수 없습니다.
      </div>
    );

  const isAuthor = user?.nickname === post.author_nickname;
  
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <article className="bg-background rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded">
            {categoryLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">
          {post.title}
        </h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
              {post.author_nickname?.[0] || "?"}
            </div>
            <span className="font-medium text-gray-700">
              {post.author_nickname || "알 수 없는 사용자"}
            </span>
          </div>

          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>조회 {post.view_count}</span>
            <span>좋아요 {post.like_count}</span>
            <span>댓글 {post.comment_count}</span>
          </div>
        </div>
      </div>

      <div className="p-6 min-h-[300px]">
        {post.image && (
          <div className="mb-6 rounded-lg overflow-hidden bg-background border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-[500px] object-contain mx-auto"
            />
          </div>
        )}
        <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {post.content}
        </p>
      </div>

      <div className="p-6 bg-background flex justify-between items-center border-t border-gray-100">
        <Link
          href="/"
          className="px-4 py-2 bg-background border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-background transition"
        >
          목록으로
        </Link>
        {isAuthor && (
          <div className="flex gap-2">
            <Link
              href={`/posts/${postId}/edit`}
              aria-label="게시글 수정하기"
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              aria-label="게시글 삭제하기"
              className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <CommentSection postId={postId} />
    </article>
  );
}