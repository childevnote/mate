import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "expo-router";
import { userAtom } from "../../lib/store";
import { postService, authService } from "../../lib/api";
import type { PostSummary } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "info" | "posts" | "scraps";

export default function MyPageScreen() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const { data: myPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => postService.getMyPosts(),
    enabled: !!user && activeTab === "posts",
  });

  const { data: scrappedPosts, isLoading: isScrapsLoading } = useQuery({
    queryKey: ["scrappedPosts"],
    queryFn: () => postService.getMyScraps(),
    enabled: !!user && activeTab === "scraps",
  });

  const deletePostMutation = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["myPosts"] }),
  });

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    router.replace("/login");
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          로그인이 필요합니다
        </Text>
        <Text className="text-sm text-gray-500 mb-8 text-center">
          마이페이지를 이용하려면 로그인해주세요.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="bg-indigo-600 px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">로그인하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 프로필 헤더 */}
        <View className="bg-white border-b border-gray-100 px-4 py-6">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center">
              <Text className="text-2xl font-black text-indigo-600">
                {user.nickname[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-gray-900">
                {user.nickname}
              </Text>
              <Text className="text-sm text-gray-500">{user.email}</Text>
              {user.university && (
                <View className="mt-1 self-start bg-blue-50 border border-blue-100 rounded px-2 py-0.5">
                  <Text className="text-xs text-blue-600 font-bold">
                    {user.university}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 인증 배지 */}
          <View className="flex-row gap-2 mt-4">
            <View
              className={`px-3 py-1 rounded-full ${
                user.is_student_verified
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  user.is_student_verified
                    ? "text-green-700"
                    : "text-gray-500"
                }`}
              >
                {user.is_student_verified ? "✅ 재학생 인증" : "재학생 미인증"}
              </Text>
            </View>
          </View>
        </View>

        {/* 탭 메뉴 */}
        <View className="flex-row bg-white border-b border-gray-100">
          {(["info", "posts", "scraps"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab
                  ? "border-indigo-600"
                  : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === tab ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {tab === "info" ? "내 정보" : tab === "posts" ? "내 글" : "스크랩"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        <View className="p-4">
          {activeTab === "info" && (
            <View className="gap-4">
              <InfoRow label="아이디" value={user.username} />
              <InfoRow label="닉네임" value={user.nickname} />
              <InfoRow label="이메일" value={user.email} />
              {user.school_email && (
                <InfoRow label="학교 이메일" value={user.school_email} />
              )}
              <TouchableOpacity
                onPress={handleLogout}
                className="mt-4 bg-red-50 border border-red-100 rounded-xl py-3 items-center"
              >
                <Text className="text-red-600 font-bold">로그아웃</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "posts" && (
            <>
              {isPostsLoading ? (
                <ActivityIndicator color="#4f46e5" className="mt-8" />
              ) : (
                <PostList
                  posts={myPosts}
                  emptyMsg="아직 작성한 글이 없습니다."
                  onDelete={(id) => deletePostMutation.mutate(id)}
                />
              )}
            </>
          )}

          {activeTab === "scraps" && (
            <>
              {isScrapsLoading ? (
                <ActivityIndicator color="#4f46e5" className="mt-8" />
              ) : (
                <PostList
                  posts={scrappedPosts}
                  emptyMsg="스크랩한 글이 없습니다."
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white rounded-xl px-4 py-4 border border-gray-100">
      <Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
      <Text className="text-base text-gray-900 font-semibold">{value}</Text>
    </View>
  );
}

function PostList({
  posts,
  emptyMsg,
  onDelete,
}: {
  posts?: PostSummary[];
  emptyMsg: string;
  onDelete?: (id: number) => void;
}) {
  const router = useRouter();

  if (!posts?.length) {
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-gray-400 text-sm">{emptyMsg}</Text>
      </View>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          onPress={() => router.push(`/posts/${post.id}`)}
          className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm"
        >
          <Text className="font-bold text-gray-900 mb-1" numberOfLines={2}>
            {post.title}
          </Text>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xs text-gray-400 capitalize">
              {post.category}
            </Text>
            <View className="flex-row gap-2">
              {onDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onDelete(post.id);
                  }}
                  className="px-2 py-1 bg-red-50 rounded"
                >
                  <Text className="text-xs text-red-500 font-bold">삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}
