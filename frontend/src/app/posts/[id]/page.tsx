"use client";

import React from "react";
import PostDetail from "@/components/community/PostDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { id } = React.use(params);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PostDetail postId={Number(id)} />
      </main>
    </div>
  );
}
