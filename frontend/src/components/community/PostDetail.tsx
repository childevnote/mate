'use client'

import { useQuery } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { Post } from '@/types/post';
import Link from 'next/link';

interface PostDetailProps {
  postId: number;
}

export default function PostDetail({ postId }: PostDetailProps) {
  // React Query로 데이터 가져오기
  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: ['post', postId], // postId가 바뀌면 데이터도 바뀜
    queryFn: () => postService.getPostDetail(postId),
  });

  if (isLoading) return <div className="py-20 text-center text-gray-500">게시글을 불러오는 중...</div>;
  if (isError || !post) return <div className="py-20 text-center text-red-500">게시글을 찾을 수 없습니다.</div>;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 1. 헤더: 카테고리, 제목, 작성자 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded">
            {post.category}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {post.author_nickname[0]}
            </div>
            <span className="font-medium text-gray-700">{post.author_nickname}</span>
          </div>
          <div className="flex gap-3 text-sm text-gray-500">
            <span>조회 {post.view_count}</span>
            <span>좋아요 {post.like_count}</span>
          </div>
        </div>
      </div>

      {/* 2. 본문 영역 */}
      <div className="p-6 min-h-[300px]">
        {post.image && (
          <div className="mb-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
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
      <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-100">
        <Link 
          href="/" 
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          목록으로
        </Link>
        {/* 추후 구현: 수정/삭제 버튼 (본인일 경우만) */}
      </div>
    </article>
  );
}