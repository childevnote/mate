"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Send } from "lucide-react";
import { Comment } from "@/types/comment";

interface CommentSectionProps {
  postId: number;
  onRequireLogin: () => void;
}

export default function CommentSection({ postId, onRequireLogin }: CommentSectionProps) {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
  });

  const createMutation = useMutation({
    mutationFn: (newContent: string) => postService.createComment(postId, newContent),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] }); // 댓글 수 갱신
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate(content);
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        댓글 <span className="text-indigo-600">{comments?.length || 0}</span>
      </h3>

      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요."
              className="w-full min-h-[100px] p-4 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div 
            onClick={onRequireLogin} 
            className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-white cursor-text group hover:border-indigo-300 transition-colors relative"
          >
            <span className="text-gray-400 text-sm">
              댓글을 남겨보세요.
            </span>
            <div className="absolute bottom-3 right-3 p-2 bg-gray-200 text-white rounded-lg group-hover:bg-indigo-200 transition-colors">
               <Send className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {comments?.map((comment: Comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-800">{comment.author_nickname}</span>
                {comment.author_university && (
                   <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                     {comment.author_university}
                   </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}