"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/authStore";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  // 1. 상태 이름 변경: email -> username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 2. API 요청 Payload 변경 (email -> username)
      const response = await api.post("/api/users/login/", {
        username, // 백엔드가 'username' 필드를 기대해야 함
        password,
      });

      // 3. 응답 처리
      // 백엔드에서 user 객체 안에 'username', 'nickname', 'university'를 다 줘야 함
      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // 4. 상태 업데이트 (변경된 User 타입에 맞춰 저장)
      setUser({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        university: user.university || undefined, // 대학 정보가 없으면 undefined 처리
      });

      alert(`${user.nickname}님 환영합니다!`); // 닉네임으로 환영 인사
      router.push("/");
    } catch (error) {
      console.error("Login Failed:", error);
      alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          로그인
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 5. UI 라벨 및 입력 타입 변경 */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              아이디
            </label>
            <input
              type="text" // 이메일 형식이 아니므로 text로 변경
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition"
          >
            로그인하기
          </button>
        </form>

        {/* 회원가입 링크 등 추가 가능 */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <span className="underline cursor-pointer hover:text-foreground">
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}
