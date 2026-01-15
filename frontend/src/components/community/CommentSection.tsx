"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Send, CornerDownRight, Trash2, MessageSquare } from "lucide-react";
import { Comment } from "@/types/comment";
import { User } from "@/types/auth";

interface CommentSectionProps {
  postId: number;
  onRequireLogin: () => void;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function CommentSection({ postId, onRequireLogin }: CommentSectionProps) {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  // 1. 댓글 조회
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
  });

  // 2. 댓글 목록을 "부모-자식" 구조로 정렬 (1차원 답글 구조)
  // useMemo를 사용하여 렌더링 최적화
  const { rootComments, childrenMap } = useMemo(() => {
    const roots: Comment[] = [];
    const map: Record<number, Comment[]> = {};

    // 날짜순 정렬 (오래된 순)
    const sorted = [...comments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((comment) => {
      if (!comment.parent_id) {
        roots.push(comment);
      } else {
        if (!map[comment.parent_id]) {
          map[comment.parent_id] = [];
        }
        map[comment.parent_id].push(comment);
      }
    });

    return { rootComments: roots, childrenMap: map };
  }, [comments]);

  // 3. 작성/답글 Mutation (낙관적 업데이트 적용)
  const createMutation = useMutation({
    mutationFn: (variables: { text: string; parentId?: number }) =>
      postService.createComment(postId, variables.text, variables.parentId),

    onMutate: async ({ text, parentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      // 가짜 댓글 객체 생성
      const tempId = Date.now(); // 임시 ID
      const newComment: Comment = {
        id: tempId,
        post_id: postId,
        content: text,
        author_id: user?.id || 0,
        author_nickname: user?.nickname || "나",
        author_university: user?.university || "",
        created_at: new Date().toISOString(),
        parent_id: parentId || null,
        is_author: true,
        is_deleted:false
      };

      // 캐시 업데이트
      queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => [
        ...old,
        newComment,
      ]);

      return { previousComments };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousComments);
      alert("댓글 작성에 실패했습니다.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // 4. 삭제 Mutation (낙관적 업데이트 적용)
  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      queryClient.setQueryData<Comment[]>(["comments", postId], (old: Comment[] = []) =>
        old.filter((c) => c.id !== commentId)
      );

      return { previousComments };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["comments", postId], context?.previousComments);
      alert("삭제 실패");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // 핸들러: 메인 댓글 작성
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ text: content });
    setContent("");
  };

  // 핸들러: 엔터키 입력 (Shift+Enter는 줄바꿈, 그냥 Enter는 전송)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.defaultPrevented || e.repeat) return;

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
        댓글 <span className="text-indigo-600">{comments.length}</span>
      </h3>

      {/* 메인 댓글 입력창 */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="따뜻한 댓글을 남겨주세요."
              className="w-full min-h-[80px] p-4 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!content.trim() || createMutation.isPending}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div
            onClick={onRequireLogin}
            className="w-full min-h-[80px] p-4 rounded-xl border border-gray-200 bg-white cursor-pointer group hover:border-indigo-300 transition-colors relative"
          >
            <span className="text-gray-400 text-sm">댓글을 남겨보세요.</span>
            <div className="absolute bottom-3 right-3 p-2 bg-gray-200 text-white rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Send className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* 댓글 목록 렌더링 */}
      <div className="space-y-4">
        {rootComments.map((rootComment) => (
          <div key={rootComment.id}>
            {/* 부모 댓글 */}
            <CommentItem
              comment={rootComment}
              user={user}
              onReply={(text, parentId) => createMutation.mutate({ text, parentId })}
              onDelete={(id) => deleteMutation.mutate(id)}
              isSubmitting={createMutation.isPending}
            />

            {/* 자식 댓글들 (들여쓰기 적용) */}
            {childrenMap[rootComment.id]?.map((childComment) => (
              <div key={childComment.id} className="pl-6 mt-2 relative">
                {/* 대댓글 계층구조 선 (디자인 포인트) */}
                <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg translate-x-2 translate-y-[-50%]" />
                
                <CommentItem
                  comment={childComment}
                  user={user}
                  // 대댓글에 답글을 달면 -> 원글(rootComment.id)의 대댓글로 처리
                  onReply={(text) =>
                    createMutation.mutate({ text, parentId: rootComment.id })
                  }
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
// Sub Component: Individual Comment Item
// ----------------------------------------------------------------------

interface CommentItemProps {
  comment: Comment;
  user: User | null;
  onReply: (text: string, parentId: number) => void;
  onDelete: (commentId: number) => void;
  isSubmitting: boolean;
  isReply?: boolean; // 대댓글 여부
}

function CommentItem({
  comment,
  user,
  onReply,
  onDelete,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const isTempComment = comment.id > 2147483647;
  
  const handleReplySubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyContent.trim()) return;
    
    // 부모 ID 전달 (isReply가 true여도 props로 전달받은 로직에 의해 처리됨)
    onReply(replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  const isMyComment = user?.id === comment.author_id;
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
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-800">
            {comment.author_nickname}
          </span>
          {comment.author_university && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100">
              {comment.author_university}
            </span>
          )}
          {/* 작성자 표시 (선택사항) */}
          {comment.is_author && (
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
              작성자
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
           <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
          
          {/* 삭제 버튼: 내 글일 때만 */}
          {isMyComment && (
            <button
              onClick={() => {
                if(confirm("댓글을 삭제하시겠습니까?")) onDelete(comment.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* 답글 달기 버튼 & 폼 */}
      <div className="mt-2">
        {!isReplying ? (
          user && (
            <button
              onClick={() => setIsReplying(true)}
              disabled={isTempComment}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              답글 달기
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
                 <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  >
                    취소
                 </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
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