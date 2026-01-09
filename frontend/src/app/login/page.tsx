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

  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true); // 로딩 시작

    try {
      const data = await authService.login(username, password);
      
      const { access_token, refresh_token } = data;

      // 토큰 저장
      localStorage.setItem("accessToken", access_token);
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      }

      // 토큰을 이용해 '내 정보' 가져오기
      const userResponse = await api.get("/api/v1/users/me");
      const user = userResponse.data;

      // 상태 저장 (Jotai)
      setUser({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        university: user.university || undefined,
        email: user.email || undefined
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
    } finally {
      setIsLoading(false);
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
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
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
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2
              ${isLoading 
                ? "bg-primary/70 text-primary-foreground/70 cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                로그인 중...
              </>
            ) : "로그인하기"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/find/id" className="hover:text-foreground transition-colors">
            아이디 찾기
          </Link>
          <span className="h-3 w-px bg-border"></span>
          <Link href="/find/password" className="hover:text-foreground transition-colors">
            비밀번호 찾기
          </Link>
          <span className="h-3 w-px bg-border"></span>
          <Link
            href="/signup"
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}