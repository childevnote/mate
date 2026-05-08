"use client";

import Skeleton from "@/components/common/Skeleton";

export default function PostListSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 px-2">
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="w-12 h-5 rounded-md shrink-0" /> 
        <Skeleton className="w-2/3 h-5 rounded-md" /> 
      </div>

      <div className="ml-4 shrink-0">
        <Skeleton className="w-10 h-4 rounded-md" />
      </div>
    </div>
  );
}