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
import { useSetAtom } from "jotai";
import { useRouter } from "expo-router";
import { userAtom } from "../lib/store";
import { authService } from "../lib/api";
import type { User } from "@mate/types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [step, setStep] = useState<"form" | "email">("form");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setLoadingKey = (key: string, val: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const handleCheckUsername = async () => {
    if (!username.trim()) return;
    setLoadingKey("username", true);
    try {
      const result = await authService.checkUsername(username);
      if (result.isAvailable) {
        setIsIdChecked(true);
        Alert.alert("사용 가능", "사용 가능한 아이디입니다.");
      } else {
        Alert.alert("사용 불가", "이미 사용 중인 아이디입니다.");
      }
    } catch {
      Alert.alert("오류", "중복 확인에 실패했습니다.");
    } finally {
      setLoadingKey("username", false);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoadingKey("emailSend", true);
    try {
      await authService.sendVerificationEmail(email);
      setIsCodeSent(true);
      Alert.alert("발송 완료", `[${email}]로 인증번호가 발송되었습니다.`);
    } catch {
      Alert.alert("오류", "이메일 발송에 실패했습니다.");
    } finally {
      setLoadingKey("emailSend", false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) return;
    setLoadingKey("emailVerify", true);
    try {
      await authService.verifyEmailCode(email, verifyCode);
      setIsEmailVerified(true);
      Alert.alert("인증 완료", "이메일 인증이 완료되었습니다.");
    } catch {
      Alert.alert("오류", "인증번호가 올바르지 않습니다.");
    } finally {
      setLoadingKey("emailVerify", false);
    }
  };

  const handleSignup = async () => {
    if (!isIdChecked) return Alert.alert("알림", "아이디 중복 확인을 해주세요.");
    if (!nickname.trim()) return Alert.alert("알림", "닉네임을 입력해주세요.");
    if (!isEmailVerified) return Alert.alert("알림", "이메일 인증을 완료해주세요.");

    setLoadingKey("submit", true);
    try {
      // 1. 패스키 회원가입 옵션 요청
      const options = await authService.getSignupPasskeyOptions(username);

      // TODO: 실제 앱에서는 react-native-passkey로 biometric 등록 후
      //       authService.signupPasskeyVerify() 호출
      Alert.alert(
        "패스키 등록",
        "실제 앱에서는 이 시점에 시스템 생체인증 UI가 표시됩니다.",
        [{ text: "확인" }]
      );

      // const attResp = await Passkey.register(options);
      // await authService.signupPasskeyVerify({ username, nickname, email, response: attResp });
      // const user = await authService.getMe() as User;
      // setUser(user);
      // router.replace("/(tabs)");
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("가입 실패", "다시 시도해 주세요.");
    } finally {
      setLoadingKey("submit", false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8">
          <Text className="text-2xl font-black text-gray-900 mb-1">
            mate 회원가입
          </Text>
          <Text className="text-sm text-gray-500 mb-8">
            패스키로 빠르고 안전하게 가입하세요.
          </Text>

          {/* 아이디 */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-1">아이디</Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base bg-white"
                placeholder="영문, 숫자 조합"
                value={username}
                onChangeText={(v) => {
                  setUsername(v);
                  setIsIdChecked(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleCheckUsername}
                disabled={isIdChecked || loading.username}
                className={`px-4 py-3 rounded-xl items-center justify-center ${
                  isIdChecked ? "bg-green-100" : "bg-gray-800"
                }`}
              >
                {loading.username ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    className={`text-xs font-bold ${
                      isIdChecked ? "text-green-700" : "text-white"
                    }`}
                  >
                    {isIdChecked ? "✔ 확인됨" : "중복확인"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 닉네임 */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-1">닉네임</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-white"
              placeholder="활동명"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          {/* 이메일 인증 */}
          <View className="mb-6 bg-white rounded-xl border border-gray-100 p-4">
            <Text className="text-sm font-bold text-gray-700 mb-3">
              연락용 이메일 인증
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50"
                placeholder="example@gmail.com"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setIsCodeSent(false);
                  setIsEmailVerified(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isEmailVerified}
              />
              <TouchableOpacity
                onPress={handleSendCode}
                disabled={isEmailVerified || loading.emailSend}
                className="bg-gray-800 px-3 rounded-xl items-center justify-center"
              >
                {loading.emailSend ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-xs text-white font-bold">
                    {isCodeSent ? "재전송" : "인증번호"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {isCodeSent && !isEmailVerified && (
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50"
                  placeholder="인증번호 6자리"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  onPress={handleVerifyCode}
                  disabled={loading.emailVerify}
                  className="bg-blue-600 px-4 rounded-xl items-center justify-center"
                >
                  {loading.emailVerify ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-xs text-white font-bold">확인</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {isEmailVerified && (
              <Text className="text-green-600 text-sm font-bold">
                ✅ 인증이 완료되었습니다.
              </Text>
            )}
          </View>

          {/* 가입 버튼 */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={!isEmailVerified || loading.submit}
            className={`py-4 rounded-2xl items-center ${
              isEmailVerified ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            {loading.submit ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`font-black text-base ${
                  isEmailVerified ? "text-white" : "text-gray-400"
                }`}
              >
                🔐 지문 등록하고 가입 완료
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="mt-5 items-center"
          >
            <Text className="text-sm text-gray-500">
              이미 계정이 있으신가요?{" "}
              <Text className="text-indigo-600 font-bold">로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
