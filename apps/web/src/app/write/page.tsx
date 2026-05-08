"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postService";
import PostForm from "@/components/community/PostForm";

export default function WritePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; category: string; media_urls: string[] }) =>
      postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/");
    },
    onError: (error) => {
      console.error(error);
      alert("게시글 등록에 실패했습니다.");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          새로운 이야기 작성
        </h1>
        <PostForm
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      </main>
    </div>
  );
}
