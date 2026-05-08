import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import { postService } from "../../lib/api";
import type { PostSummary } from "@mate/types";
import { CATEGORY_OPTIONS } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";

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
      className="bg-white border-b border-gray-100 px-4 py-4 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-2 mb-1">
        <View className="bg-indigo-50 px-2 py-0.5 rounded">
          <Text className="text-xs text-indigo-600 font-bold">
            {post.category}
          </Text>
        </View>
        {post.author_university && (
          <Text className="text-xs text-blue-500 font-semibold">
            {post.author_university}
          </Text>
        )}
      </View>
      <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
        {post.title}
      </Text>
      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-xs text-gray-500">{post.author_nickname}</Text>
        <View className="flex-row gap-3">
          <Text className="text-xs text-gray-400">👁 {post.view_count}</Text>
          <Text className="text-xs text-gray-400">❤️ {post.like_count}</Text>
          <Text className="text-xs text-gray-400">💬 {post.comment_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PostsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; sort?: string }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState(params.category ?? "");
  const [sort] = useState(params.sort ?? "latest");

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", page, search, category, sort],
    queryFn: () => postService.getPosts(page, search, category, sort),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 상단 검색/필터 */}
      <View className="bg-white border-b border-gray-100 px-4 py-3">
        <Text className="text-xl font-black text-gray-900 mb-3">게시판</Text>

        {/* 검색 입력 */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-3">
          <Search size={16} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-sm text-gray-700"
            placeholder="검색어를 입력하세요"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* 카테고리 필터 */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: "", label: "전체" }, ...CATEGORY_OPTIONS]}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setCategory(item.value);
                setPage(1);
              }}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                category === item.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  category === item.value ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 게시글 목록 */}
      {isLoading ? (
        <ActivityIndicator className="mt-12" color="#4f46e5" />
      ) : (
        <FlatList
          data={posts as PostSummary[]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => router.push(`/posts/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4f46e5"
            />
          }
          ListEmptyComponent={
            <View className="flex items-center justify-center py-16">
              <Text className="text-gray-400 text-sm">
                게시글이 없습니다.
              </Text>
            </View>
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => setPage((p) => p + 1)}
        />
      )}
    </SafeAreaView>
  );
}
