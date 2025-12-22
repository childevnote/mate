"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postService";
import Navbar from "@/components/layout/Navbar";
import PostForm from "@/components/community/PostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const { id } = React.use(params);
  const postId = Number(id);

  const router = useRouter();
  const queryClient = useQueryClient();

  // 기존 게시글 데이터 불러오기
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostDetail(postId),
  });

  // 수정 요청 Mutation
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) =>
      postService.updatePost(postId, formData),
    onSuccess: () => {
      // 캐시 갱신: 수정된 내용을 즉시 반영하기 위함
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      alert("게시글이 성공적으로 수정되었습니다.");
      router.push(`/posts/${postId}`); // 상세 페이지로 이동
    },
    onError: (err) => {
      console.error(err);
      alert("게시글 수정에 실패했습니다.");
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-20">데이터를 불러오는 중입니다...</div>
    );
  if (isError || !post)
    return (
      <div className="text-center py-20 text-red-500">
        게시글을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">게시글 수정</h1>

        <PostForm
          initialData={{
            title: post.title,
            content: post.content,
            category: post.category,
            image: null,
          }}
          onSubmit={(formData) => updateMutation.mutate(formData)}
          isSubmitting={updateMutation.isPending}
        />
      </main>
    </div>
  );
}
