import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useSetAtom } from "jotai";
import { useRouter } from "expo-router";
import { userAtom } from "../lib/store";
import { authService, api } from "../lib/api";
import type { User } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return;
    setIsLoading(true);

    try {
      // 1. 패스키 로그인 옵션 요청
      const options = await authService.getLoginPasskeyOptions(username);

      // 2. 플랫폼 패스키 인증 (React Native에서는 expo-passkeys 또는 
      //    react-native-passkey 라이브러리 필요. 현재는 OTP 폴백을 사용)
      //    TODO: 실제 앱에서는 아래를 react-native-passkey 호출로 교체
      Alert.alert(
        "패스키 인증",
        "실제 앱에서는 이 시점에 시스템 생체인증 UI가 표시됩니다.\n개발 환경에서는 OTP 로그인을 이용해 주세요.",
        [{ text: "확인" }]
      );

      // 3. 로그인 검증 (실제 구현 시 biometric response 전달)
      // await authService.loginPasskeyVerify(username, biometricResponse);

      // 4. 사용자 정보 가져오기 (토큰이 있을 경우)
      const user = await authService.getMe() as User;
      setUser(user);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("로그인 실패", "다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-10">
            <Text className="text-4xl font-black tracking-tighter text-indigo-600 mb-2">
              mate
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              아이디를 입력하고 패스키로 로그인하세요.
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-sm font-bold text-gray-700 mb-2">아이디</Text>
            <TextInput
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 bg-gray-50 mb-5"
              placeholder="아이디를 입력하세요"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || !username.trim()}
              className={`py-4 rounded-xl items-center ${
                username.trim()
                  ? "bg-indigo-600"
                  : "bg-gray-200"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`font-black text-base ${
                    username.trim() ? "text-white" : "text-gray-400"
                  }`}
                >
                  🔐 패스키로 로그인
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/signup")}
            className="mt-6 items-center"
          >
            <Text className="text-sm text-gray-500">
              계정이 없으신가요?{" "}
              <Text className="text-indigo-600 font-bold">회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
