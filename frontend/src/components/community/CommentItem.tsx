"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { Comment } from "@/types/comment";

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: number) => void;
  onDelete: (commentId: number) => void;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
}: CommentItemProps) {
  const user = useAtomValue(userAtom);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onReply(replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
  };

  return (
    <div className="flex flex-col">
      <div
        className={`flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition ${
          comment.parent ? "ml-8 bg-gray-50/50 border-l-2 border-gray-200" : ""
        }`}
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
          {comment.author_nickname[0]}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {comment.author_nickname}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">
            {comment.content}
          </p>

          <div className="flex gap-3 text-xs">
            {user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-500 hover:text-primary font-medium"
              >
                {isReplying ? "취소" : "답글 달기"}
              </button>
            )}

            {user?.nickname === comment.author_nickname && (
              <button
                onClick={() => {
                  if (confirm("삭제하시겠습니까?")) onDelete(comment.id);
                }}
                className="text-red-500 hover:underline"
              >
                삭제
              </button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`${comment.author_nickname}님에게 답글 작성...`}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 disabled:opacity-50"
              >
                등록
              </button>
            </form>
          )}
        </div>
      </div>

      {comment.children && comment.children.length > 0 && (
        <div className="flex flex-col mt-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
