"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/authStore";
import { authService } from "@/services/authService";
import { api } from "@/lib/axios"; 
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // 로그인 요청 (토큰 발급)
      const data = await authService.login(email, password);
      
      const { access_token, refresh_token } = data; // 필드명 확인 (access_token)

      // 토큰 저장
      localStorage.setItem("accessToken", access_token);
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      }

      // 토큰을 이용해 '내 정보' 가져오기
      const userResponse = await api.get("/users/me");
      const user = userResponse.data;

      // 상태 저장 (Jotai)
      setUser({
        id: user.id,
        username: user.email, // 프론트엔드 모델에 맞춰 매핑
        nickname: user.nickname,
        university: user.university || undefined,
        email: user.email,
      });

      router.push("/");
    } catch (error: unknown) {
      console.error("Login Failed:", error);

      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { detail?: string })?.detail ||
          (error.response?.data as { message?: string })?.message ||
          "아이디 또는 비밀번호를 확인해주세요.";
        setErrorMsg(message);
      } else {
        setErrorMsg("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
            로그인
          </h1>
          <p className="text-sm text-muted-foreground">
            mate에 오신 것을 환영합니다.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              이메일 (아이디)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm text-center font-medium animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            로그인하기
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary underline underline-offset-4 hover:text-foreground transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}