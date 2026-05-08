import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { postService } from "../../lib/api";
import type { PostSummary } from "@mate/types";
import { CATEGORY_OPTIONS } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Clock } from "lucide-react-native";

function PostCard({
  post,
  onPress,
}: {
  post: PostSummary;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center gap-2 mb-1">
        <View className="bg-indigo-50 px-2 py-0.5 rounded">
          <Text className="text-xs text-indigo-600 font-bold">
            {post.category}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">{post.author_university}</Text>
      </View>
      <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
        {post.title}
      </Text>
      <View className="flex-row gap-3 mt-1">
        <Text className="text-xs text-gray-400">👁 {post.view_count}</Text>
        <Text className="text-xs text-gray-400">❤️ {post.like_count}</Text>
        <Text className="text-xs text-gray-400">💬 {post.comment_count}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PostSection({
  title,
  icon,
  posts,
  isLoading,
  onViewAll,
}: {
  title: string;
  icon: React.ReactNode;
  posts?: PostSummary[];
  isLoading: boolean;
  onViewAll: () => void;
}) {
  const router = useRouter();

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="text-lg font-black text-gray-900">{title}</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-sm text-indigo-600 font-semibold">
            전체보기 →
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator color="#4f46e5" />
      ) : (
        posts?.slice(0, 5).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => router.push(`/posts/${post.id}`)}
          />
        ))
      )}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const { data: bestPosts, isLoading: isBestLoading, refetch: refetchBest } = useQuery({
    queryKey: ["posts", "best"],
    queryFn: () => postService.getPosts(1, "", "", "best"),
  });

  const { data: latestPosts, isLoading: isLatestLoading, refetch: refetchLatest } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: () => postService.getPosts(1, "", "", "latest"),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBest(), refetchLatest()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-4">
        <Text className="text-3xl font-black tracking-tighter text-indigo-600">
          mate
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          대학생 익명 커뮤니티
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
      >
        {/* 베스트 인기 글 */}
        <PostSection
          title="베스트 인기 글"
          icon={<Flame size={20} color="#ef4444" />}
          posts={bestPosts}
          isLoading={isBestLoading}
          onViewAll={() => router.push("/posts?sort=best")}
        />

        {/* 실시간 최신 글 */}
        <PostSection
          title="실시간 최신 글"
          icon={<Clock size={20} color="#3b82f6" />}
          posts={latestPosts}
          isLoading={isLatestLoading}
          onViewAll={() => router.push("/posts")}
        />

        {/* 카테고리별 게시판 */}
        <Text className="text-lg font-black text-gray-900 mb-3">
          카테고리 게시판
        </Text>
        <View className="flex-row flex-wrap gap-3 pb-8">
          {CATEGORY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => router.push(`/posts?category=${opt.value}`)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1 min-w-[40%] active:bg-indigo-50"
            >
              <Text className="text-base font-bold text-gray-800">
                📂 {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
