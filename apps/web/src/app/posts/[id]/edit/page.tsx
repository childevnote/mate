"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postService";
import { deleteFiles } from "@/services/mediaService";
import PostForm from "@/components/community/PostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const { id } = React.use(params);
  const postId = Number(id);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostDetail(postId),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      removedUrls,
    }: {
      data: { title: string; content: string; category: string; media_urls: string[] };
      removedUrls: string[];
    }) => {
      const result = await postService.updatePost(postId, data);
      // 백엔드 업데이트 성공 후 Storage에서 제거된 파일 삭제
      if (removedUrls.length > 0) {
        await deleteFiles(removedUrls);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("게시글이 성공적으로 수정되었습니다.");
      router.push(`/posts/${postId}`);
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

  // 레거시 image 필드와 media_urls 병합 (하위 호환)
  const existingMediaUrls = [
    ...(post.image ? [post.image] : []),
    ...(post.media_urls || []),
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">게시글 수정</h1>

        <PostForm
          initialData={{
            title: post.title,
            content: post.content,
            category: post.category,
            media_urls: existingMediaUrls,
          }}
          onSubmit={(data, removedUrls) =>
            updateMutation.mutate({ data, removedUrls })
          }
          isSubmitting={updateMutation.isPending}
        />
      </main>
    </div>
  );
}
