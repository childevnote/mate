"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Send, Trash2, MessageSquare, CornerDownRight } from "lucide-react";
import { Comment } from "@/types/comment";
import { User } from "@/types/auth";
import { CommentSectionProps } from "@/types/comment";

export default function CommentSection({ postId, postAuthorId, comments,  onRequireLogin }: CommentSectionProps) {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  // 부모-자식 구조 정렬
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

  const createMutation = useMutation({
    mutationFn: (variables: { text: string; parentId?: number }) =>
      postService.createComment(postId, variables.text, variables.parentId),
    
    // 요청 즉시 실행 (서버 응답 기다리지 않음)
    onMutate: async (variables) => {
      // 진행 중인 갱신 요청 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      // 이전 데이터 스냅샷 (에러 시 복구용)
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      // 가짜 댓글 만들기 (UI에 즉시 보여줄 데이터)
      const newComment: Comment = {
        id: Date.now() + Math.random(), // 임시 ID (매우 큰 숫자)
        post_id: postId,
        content: variables.text,
        author_id: user?.id || 0,
        author_nickname: user?.nickname || "나", 
        is_author: user?.id === postAuthorId, // 내가 글쓴이면 true
        author_university: user?.university || undefined,
        
        parent_id: variables.parentId || null,
        children: [],
        created_at: new Date().toISOString(),
        is_deleted: false,
      };

      // 3. 캐시 강제 업데이트 (화면이 즉시 바뀜)
      queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => {
        return [...old, newComment];
      });

      return { previousComments };
    },

    // 에러 나면 원상복구
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", postId], context.previousComments);
      }
      alert("댓글 작성에 실패했습니다.");
    },

    // 성공하든 실패하든 최신 데이터로 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    
    // 성공 시 입력창 비우기 (UI 경험용)
    onSuccess: () => {
        setContent("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ text: content });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
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
              onKeyDown={handleKeyDown}
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
            className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-white cursor-pointer group hover:border-indigo-300 transition-colors relative"
          >
            <span className="text-gray-400 text-sm">댓글을 남겨보세요.</span>
            <div className="absolute bottom-3 right-3 p-2 bg-gray-200 text-white rounded-lg group-hover:bg-indigo-200 transition-colors">
               <Send className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {rootComments.map((rootComment) => (
          <div key={rootComment.id}>
            <CommentItem
              comment={rootComment}
              postAuthorId={postAuthorId}
              user={user}
              onReply={(text, parentId) => createMutation.mutate({ text, parentId })}
              onDelete={(id) => deleteMutation.mutate(id)}
              isSubmitting={createMutation.isPending}
            />
            {childrenMap[rootComment.id]?.map((childComment) => (
              <div key={childComment.id} className="pl-6 mt-2 relative">
                <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg translate-x-2 translate-y-[-50%]" />
                <CommentItem
                  comment={childComment}
                  postAuthorId={postAuthorId}
                  user={user}
                  onReply={(text) => createMutation.mutate({ text, parentId: rootComment.id })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isSubmitting={createMutation.isPending}
                  isReply
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// CommentItem
// ----------------------------------------------------------------------

interface CommentItemProps {
  comment: Comment;
  postAuthorId: number;
  user: User | null;
  onReply: (text: string, parentId: number) => void;
  onDelete: (commentId: number) => void;
  isSubmitting: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  postAuthorId,
  user,
  onReply,
  onDelete,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyContent.trim()) return;
    onReply(replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleReplySubmit();
    }
  };

  // 🔥 [수정 2] 작성자 판별 (낙관적 업데이트 때도 ID 비교로 유지)
  const isPostAuthor = comment.author_id === postAuthorId;
  const isMyComment = user?.id === comment.author_id;
  const isTempComment = comment.id > 2147483647;

  if (comment.is_deleted) {
    return (
      <div className={`p-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm italic ${isReply ? 'ml-6' : ''}`}>
        삭제된 댓글입니다.
      </div>
    );
  }

  return (
    <div className={`group bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-colors ${isReply ? 'bg-gray-50/50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-gray-800">{comment.author_nickname}</span>
          
          {/* 대학 뱃지 */}
          {comment.author_university && (
             <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100">
               {comment.author_university}
             </span>
          )}

          {/* 작성자 뱃지 (조건부 렌더링) */}
          {isPostAuthor && (
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-100">
              작성자
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
          {isMyComment && (
            <button
              onClick={() => { if(confirm("댓글을 삭제하시겠습니까?")) onDelete(comment.id); }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

      <div className="mt-2">
        {!isReplying ? (
          user && (
            <button
              onClick={() => setIsReplying(true)}
              disabled={isTempComment}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                isTempComment ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              {isTempComment ? "전송 중..." : "답글 달기"}
            </button>
          )
        ) : (
          <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <form onSubmit={handleReplySubmit} className="relative">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`@${comment.author_nickname}님에게 답글 남기기...`}
                autoFocus
                className="w-full min-h-[60px] p-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm resize-none outline-none"
              />
              <div className="flex gap-2 absolute bottom-2 right-2">
                 <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">취소</button>
                <button type="submit" disabled={!replyContent.trim() || isSubmitting} className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  <CornerDownRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}