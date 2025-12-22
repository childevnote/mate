"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Post } from "@/types/post";
import Link from "next/link";

interface PostDetailProps {
  postId: number;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);

  // React Query로 데이터 가져오기
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<Post>({
    queryKey: ["post", postId], // postId가 바뀌면 데이터도 바뀜
    queryFn: () => postService.getPostDetail(postId),
  });

  const deleteMutation = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      alert("게시글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 목록 새로고침
      router.push("/"); // 메인으로 쫓아내기
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
  return (
    <article className="bg-background rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 1. 헤더: 카테고리, 제목, 작성자 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded">
            {post.category}
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
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-muted-foreground">
              {post.author_nickname[0]}
            </div>
            <span className="font-medium text-gray-700">
              {post.author_nickname}
            </span>
          </div>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>조회 {post.view_count}</span>
            <span>좋아요 {post.like_count}</span>
          </div>
        </div>
      </div>

      {/* 2. 본문 영역 */}
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
        {/* 줄바꿈 처리를 위해 whitespace-pre-wrap 사용 */}
        <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {post.content}
        </p>
      </div>

      {/* 3. 하단 버튼 영역 */}
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
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
