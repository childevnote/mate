'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { postService } from '@/services/postService';
import Navbar from '@/components/layout/Navbar';
import PostForm from '@/components/community/PostForm';

export default function WritePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query Mutation (데이터 생성 로직)
  const createMutation = useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      // 1. 목록 캐시 날리기 (새 글을 받아오기 위해)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // 2. 메인으로 이동
      router.push('/');
    },
    onError: (error) => {
      console.error(error);
      alert('게시글 등록에 실패했습니다.');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">새로운 이야기 작성</h1>
        
        {/* 폼 컴포넌트 재사용 */}
        <PostForm 
          onSubmit={(formData) => createMutation.mutate(formData)}
          isSubmitting={createMutation.isPending}
        />
      </main>
    </div>
  );
}