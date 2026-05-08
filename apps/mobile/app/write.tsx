import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useRouter, Stack } from "expo-router";
import { userAtom } from "../lib/store";
import { postService } from "../lib/api";
import { CATEGORY_OPTIONS } from "@mate/types";
import type { BoardCategory } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";

export default function WriteScreen() {
  const user = useAtomValue(userAtom);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<BoardCategory>("FREE");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: () =>
      postService.createPost({ title, content, category }),
    onSuccess: (data) => {
      router.replace(`/posts/${data.id}`);
    },
    onError: () => {
      Alert.alert("오류", "글 작성에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          로그인이 필요합니다
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

  const selectedCategory = CATEGORY_OPTIONS.find((o) => o.value === category);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "글 작성",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (!title.trim() || !content.trim()) {
                  Alert.alert("알림", "제목과 내용을 모두 입력해주세요.");
                  return;
                }
                createPostMutation.mutate();
              }}
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Text className="text-indigo-600 font-black text-base mr-1">
                  등록
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* 카테고리 선택 */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-700 mb-1">카테고리</Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <Text className="text-base text-gray-800">
              {selectedCategory?.label}
            </Text>
            <ChevronDown size={18} color="#6b7280" />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View className="bg-white border border-gray-200 rounded-xl mt-1 overflow-hidden">
              {CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    setCategory(opt.value);
                    setShowCategoryPicker(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-50 ${
                    category === opt.value ? "bg-indigo-50" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      category === opt.value
                        ? "text-indigo-600 font-bold"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 제목 */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-700 mb-1">제목</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* 내용 */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-1">내용</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 min-h-[200px]"
            placeholder="내용을 자유롭게 입력하세요"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text className="text-xs text-gray-400 text-right mt-1">
            {content.length} / 5000
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
