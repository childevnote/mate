'use client'

import React from 'react'; // React.use()를 사용하기 위해 import
import Navbar from '@/components/layout/Navbar';
import PostDetail from '@/components/community/PostDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  // Next.js 15+부터 params는 Promise입니다. React.use()로 언랩합니다.
  const { id } = React.use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PostDetail postId={Number(id)} />
      </main>
    </div>
  );
}