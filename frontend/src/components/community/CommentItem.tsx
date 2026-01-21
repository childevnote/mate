"use client";

import { useState } from "react";
import { Trash2, MessageSquare, CornerDownRight } from "lucide-react";
import { Comment } from "@/types/comment";
import { User } from "@/types/auth";

interface CommentItemProps {
  comment: Comment;
  postAuthorId: number;
  user: User | null;
  onReply: (text: string, parentId: number) => void;
  onDelete: (commentId: number) => void;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  postAuthorId,
  user,
  onReply,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyContent.trim()) return;
    const textToSend = replyContent;
    setReplyContent("");
    setIsReplying(false);
    onReply(textToSend, comment.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  const isPostAuthor = comment.author_id === postAuthorId;
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-gray-800">{comment.author_nickname}</span>

          {comment.author_university && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100">
              {comment.author_university}
            </span>
          )}

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
              onClick={() => onDelete(comment.id)}
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
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors"
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
                className="w-full min-h-[60px] p-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm resize-none outline-none disabled:text-gray-400"
              />
              <div className="flex gap-2 absolute bottom-2 right-2">
                <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">취소</button>
                <button type="submit" disabled={!replyContent.trim()} className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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