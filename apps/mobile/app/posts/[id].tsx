import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { userAtom } from "../../lib/store";
import { postService } from "../../lib/api";
import type { Comment } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, Bookmark, Trash2 } from "lucide-react-native";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const {
    data: post,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostDetail(postId),
    enabled: !!postId,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
    enabled: !!postId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchComments()]);
    setRefreshing(false);
  };

  const likeMutation = useMutation({
    mutationFn: () => postService.toggleLike(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const scrapMutation = useMutation({
    mutationFn: () => postService.toggleScrap(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      postService.createComment(postId, comment, replyTo ?? undefined),
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", postId] }),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => postService.deletePost(postId),
    onSuccess: () => router.back(),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Stack.Screen options={{ title: post.category }} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
      >
        {/* 게시글 본문 */}
        <View className="bg-white px-4 py-6 border-b border-gray-100">
          {/* 카테고리 & 삭제 버튼 */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-indigo-50 px-2 py-0.5 rounded">
              <Text className="text-xs text-indigo-600 font-bold">
                {post.category}
              </Text>
            </View>
            {post.is_author && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("게시글 삭제", "정말 삭제하시겠습니까?", [
                    { text: "취소", style: "cancel" },
                    {
                      text: "삭제",
                      style: "destructive",
                      onPress: () => deletePostMutation.mutate(),
                    },
                  ])
                }
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-xl font-black text-gray-900 mb-3">
            {post.title}
          </Text>

          {/* 작성자 정보 */}
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
              <Text className="text-sm font-bold text-indigo-600">
                {post.author_nickname[0]}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-700">
                {post.author_nickname}
              </Text>
              {post.author_university && (
                <Text className="text-xs text-blue-500">
                  {post.author_university}
                </Text>
              )}
            </View>
            <Text className="text-xs text-gray-400 ml-auto">
              {new Date(post.created_at).toLocaleDateString("ko-KR")}
            </Text>
          </View>

          <Text className="text-base text-gray-700 leading-6">{post.content}</Text>

          {/* 좋아요/스크랩 버튼 */}
          <View className="flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => {
                if (!user) return router.push("/login");
                likeMutation.mutate();
              }}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                post.is_liked
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Heart
                size={16}
                color={post.is_liked ? "#ef4444" : "#6b7280"}
                fill={post.is_liked ? "#ef4444" : "none"}
              />
              <Text
                className={`text-sm font-bold ${
                  post.is_liked ? "text-red-500" : "text-gray-500"
                }`}
              >
                {post.like_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!user) return router.push("/login");
                scrapMutation.mutate();
              }}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                post.is_scrapped
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Bookmark
                size={16}
                color={post.is_scrapped ? "#f59e0b" : "#6b7280"}
                fill={post.is_scrapped ? "#f59e0b" : "none"}
              />
              <Text
                className={`text-sm font-bold ${
                  post.is_scrapped ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                {post.scrap_count}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 ml-auto">
              <Text className="text-xs text-gray-400">👁 {post.view_count}</Text>
            </View>
          </View>
        </View>

        {/* 댓글 목록 */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-sm font-bold text-gray-500 mb-3">
            댓글 {post.comment_count}개
          </Text>
          {(comments as Comment[])?.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.id}
              onReply={(id) => setReplyTo(id)}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* 댓글 입력창 */}
      <View className="bg-white border-t border-gray-100 px-4 py-3">
        {replyTo && (
          <View className="flex-row items-center justify-between bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
            <Text className="text-xs text-blue-600">답글 작성 중</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text className="text-xs text-gray-400">취소</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="flex-row items-end gap-2">
          <TextInput
            className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 border border-gray-200"
            placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성하세요"}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            editable={!!user}
          />
          <TouchableOpacity
            onPress={() => {
              if (!user) return router.push("/login");
              if (!comment.trim()) return;
              commentMutation.mutate();
            }}
            disabled={!comment.trim() || commentMutation.isPending}
            className={`px-4 py-2.5 rounded-xl ${
              comment.trim() ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                comment.trim() ? "text-white" : "text-gray-400"
              }`}
            >
              등록
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: number;
  onReply: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isAuthor = currentUserId === comment.author_id;
  const isReply = comment.parent_id !== null;

  if (comment.is_deleted) {
    return (
      <View className={`py-3 border-b border-gray-100 ${isReply ? "pl-6" : ""}`}>
        <Text className="text-sm text-gray-400 italic">삭제된 댓글입니다.</Text>
      </View>
    );
  }

  return (
    <View
      className={`py-3 border-b border-gray-100 ${
        isReply ? "pl-6 bg-gray-50 rounded-lg mb-1" : ""
      }`}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          {isReply && (
            <Text className="text-gray-300 text-sm">└</Text>
          )}
          <Text className="text-sm font-bold text-gray-700">
            {comment.author_nickname}
          </Text>
          {comment.author_university && (
            <Text className="text-xs text-blue-500">
              {comment.author_university}
            </Text>
          )}
        </View>
        <Text className="text-xs text-gray-400">
          {new Date(comment.created_at).toLocaleDateString("ko-KR")}
        </Text>
      </View>
      <Text className="text-sm text-gray-700 mb-2">{comment.content}</Text>
      <View className="flex-row gap-3">
        {!isReply && (
          <TouchableOpacity onPress={() => onReply(comment.id)}>
            <Text className="text-xs text-gray-400">답글</Text>
          </TouchableOpacity>
        )}
        {isAuthor && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert("댓글 삭제", "정말 삭제하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                  text: "삭제",
                  style: "destructive",
                  onPress: () => onDelete(comment.id),
                },
              ])
            }
          >
            <Text className="text-xs text-red-400">삭제</Text>
          </TouchableOpacity>
        )}
      </View>
      {comment.children?.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          currentUserId={currentUserId}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}
