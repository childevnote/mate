"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService";
import { Comment, CommentSectionProps } from "@/types/comment";
import CommentItem from "./CommentItem";

export default function CommentSection({ postId }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
  });

  const commentTree = useMemo(() => {
    const map = new Map<number, Comment>();
    const roots: Comment[] = [];

    comments.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });

    comments.forEach((c) => {
      const node = map.get(c.id);
      if (!node) return;

      if (c.parent_id) {
        const parentNode = map.get(c.parent_id);
        if (parentNode) {
          parentNode.children?.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  const createMutation = useMutation({
    mutationFn: ({
      text,
      parentId,
    }: {
      text: string;
      parentId: number | null;
    }) => postService.createComment(postId, text, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      setContent("");
    },
    onError: () => alert("댓글 작성에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: postService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) return alert("로그인이 필요합니다.");
    createMutation.mutate({ text: content, parentId: null });
  };

  const handleReply = (replyText: string, parentId: number) => {
    if (!user) return alert("로그인이 필요합니다.");
    createMutation.mutate({ text: replyText, parentId });
  };

  return (
    <div className="bg-background border-t border-gray-100 p-6">
      <h3 className="text-lg font-bold mb-4">
        댓글 <span className="text-primary">{comments.length}</span>
      </h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              user
                ? "따뜻한 댓글을 남겨주세요."
                : "로그인 후 댓글을 남길 수 있습니다."
            }
            disabled={!user}
            className="w-full min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition"
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={!content.trim() || createMutation.isPending}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {createMutation.isPending ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {commentTree.map((rootComment) => (
          <CommentItem
            key={rootComment.id}
            comment={rootComment}
            onReply={handleReply}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-lg">
            아직 댓글이 없습니다.
            <br />첫 번째 댓글의 주인공이 되어보세요!
          </p>
        )}
      </div>
    </div>
  );
}
