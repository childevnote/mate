"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Send } from "lucide-react";
import { Comment, CommentSectionProps } from "@/types/comment";

import CommentItem from "./CommentItem";
import Toast from "@/components/ui/Toast";
import CommonModal from "@/components/ui/CommonModal";

export default function CommentSection({ postId, postAuthorId, comments, onRequireLogin }: CommentSectionProps) {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  // 상태 관리: 삭제 대상 ID, 토스트 표시 여부
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const { rootComments, childrenMap } = useMemo(() => {
    const roots: Comment[] = [];
    const map: Record<number, Comment[]> = {};
    const sorted = [...comments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sorted.forEach((comment) => {
      if (!comment.parent_id) {
        roots.push(comment);
      } else {
        if (!map[comment.parent_id]) map[comment.parent_id] = [];
        map[comment.parent_id].push(comment);
      }
    });
    return { rootComments: roots, childrenMap: map };
  }, [comments]);

  // 1. 댓글 작성 Mutation (기존 동일)
  const createMutation = useMutation({
    mutationFn: (variables: { text: string; parentId?: number }) =>
      postService.createComment(postId, variables.text, variables.parentId),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      const newComment: Comment = {
        id: Date.now() + Math.random(),
        post_id: postId,
        content: variables.text,
        author_id: user?.id || 0,
        author_nickname: user?.nickname || "나",
        is_author: user?.id === postAuthorId,
        author_university: user?.university || undefined,
        parent_id: variables.parentId || null,
        children: [],
        created_at: new Date().toISOString(),
        is_deleted: false,
      };

      queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => [...old, newComment]);
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(["comments", postId], context.previousComments);
      alert("작성 실패");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => {
        return old.filter(c => c.id !== commentId);
      });

      setShowToast(true);

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(["comments", postId], context.previousComments);
      setShowToast(false);
      alert("삭제 실패");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;
    const textToSend = content;
    setContent("");
    createMutation.mutate({ text: textToSend });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 삭제 요청 핸들러 (모달 열기)
  const handleDeleteRequest = (commentId: number) => {
    setDeleteTargetId(commentId);
  };

  // 삭제 확정 핸들러
  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          댓글 <span className="text-indigo-600">{comments?.length || 0}</span>
        </h3>

        {/* 입력창 */}
        <div className="mb-8">
          {user ? (
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="따뜻한 댓글을 남겨주세요."
                className="w-full min-h-[100px] p-4 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500"
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
            <div onClick={onRequireLogin} className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-white cursor-pointer group hover:border-indigo-300 transition-colors relative">
              <span className="text-gray-400 text-sm">댓글을 남겨보세요.</span>
              <div className="absolute bottom-3 right-3 p-2 bg-gray-200 text-white rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Send className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {rootComments.map((rootComment) => (
            <div key={rootComment.id}>
              <CommentItem
                comment={rootComment}
                postAuthorId={postAuthorId}
                user={user}
                onReply={(text, parentId) => createMutation.mutate({ text, parentId })}
                onDelete={handleDeleteRequest}
              />
              {childrenMap[rootComment.id]?.map((childComment) => (
                <div key={childComment.id} className="pl-6 mt-2 relative">
                  <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg translate-x-2 translate-y-[-50%]" />
                  <CommentItem
                    comment={childComment}
                    postAuthorId={postAuthorId}
                    user={user}
                    onReply={(text) => createMutation.mutate({ text, parentId: rootComment.id })}
                    onDelete={handleDeleteRequest}
                    isReply
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <CommonModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="댓글 삭제"
        message="정말 이 댓글을 삭제하시겠습니까?"
        mode="confirm"
        theme="danger"
        confirmText="삭제"
        onConfirm={handleDeleteConfirm}
      />

      <Toast
        message="댓글이 삭제되었습니다."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </>
  );
}