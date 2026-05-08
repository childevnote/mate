"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/authStore";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/error";

export default function PasskeyTestPage() {
  const user = useAtomValue(userAtom);
  const [log, setLog] = useState<string[]>([]);
  const [loginId, setLoginId] = useState("");

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

  // 1. 기기 등록 함수
  const handleRegister = async () => {
    if (!user) {
      addLog("❌ 먼저 일반 로그인을 해주세요!");
      return;
    }
    try {
      addLog("🚀 기기 등록 시작... (지문을 인식해주세요)");
      await authService.registerPasskey(user.id, user.username);
      addLog("✅ 기기 등록 성공! DB passkeys 테이블을 확인해보세요.");
    } catch (e: unknown) { // 👈 any 대신 unknown 사용
      const msg = getErrorMessage(e); // 👈 타입 안전하게 메시지 추출
      addLog(`❌ 등록 실패: ${msg}`);
    }
  };

  // 2. 패스키 로그인 함수
  const handleLogin = async () => {
    if (!loginId) {
      addLog("❌ 아이디를 입력해주세요.");
      return;
    }
    try {
      addLog(`🚀 [${loginId}] 계정으로 패스키 로그인 시도...`);
      const res = await authService.loginPasskey(loginId);
      addLog("✅ 로그인 성공!");
      addLog(`🔑 Access Token: ${res.access_token.substring(0, 20)}...`);
    } catch (e: unknown) { // 👈 any 대신 unknown 사용
      const msg = getErrorMessage(e); // 👈 타입 안전하게 메시지 추출
      addLog(`❌ 로그인 실패: ${msg}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">🔐 패스키 기능 테스트</h1>

      {/* 섹션 1: 기기 등록 */}
      <div className="p-4 border rounded bg-gray-50 dark:bg-zinc-800">
        <h2 className="font-bold text-lg mb-2">1. 기기 등록 (로그인 필수)</h2>
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          현재 로그인된 유저: {user ? user.username : "없음 (로그인 필요)"}
        </p>
        <button
          onClick={handleRegister}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          내 기기 등록하기
        </button>
      </div>

      {/* 섹션 2: 패스키 로그인 */}
      <div className="p-4 border rounded bg-gray-50 dark:bg-zinc-800">
        <h2 className="font-bold text-lg mb-2">2. 패스키 로그인 (로그아웃 상태에서 테스트)</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="아이디 입력"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="border p-2 rounded flex-1 dark:bg-zinc-900 dark:border-zinc-700"
          />
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            패스키로 로그인
          </button>
        </div>
      </div>

      {/* 로그 출력 창 */}
      <div className="p-4 bg-black text-green-400 rounded h-64 overflow-y-auto font-mono text-sm">
        {log.length === 0 && (
          <p className="text-gray-500"></p>
        )}
        {log.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}