"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/authStore";
import { authService } from "@/services/authService";
import { api } from "@/lib/axios"; 
import Link from "next/link";
import { getErrorMessage } from "@/utils/error";
import { User } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [username, setUsername] = useState(""); 
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setErrorMsg("");
    setIsLoading(true);

    try {
      // 1. 패스키 로그인 시도
      await authService.loginPasskey(username);
      
      // 2. 토큰을 이용해 '내 정보' 가져오기
      const userResponse = await api.get<User>("/api/v1/users/me");
      const user = userResponse.data;

      // 3. 상태 저장 (Jotai)
      setUser({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        university: user.university,
        school_email: user.school_email,
        is_student_verified: user.is_student_verified,
        is_active: user.is_active,
      });

      router.push("/");
    } catch (error: unknown) {
      console.error("Login Failed:", error);
      const message = getErrorMessage(error);
      setErrorMsg(message);
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
            아이디를 입력하고 패스키로 로그인하세요.
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
                지문 인증 중...
              </>
            ) : "🔐 패스키로 로그인"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/find/id" className="hover:text-foreground transition-colors">
            아이디 찾기
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