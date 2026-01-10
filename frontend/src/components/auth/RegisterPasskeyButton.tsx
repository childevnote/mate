"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/error";

interface Props {
  user: { id: number; username: string };
}

export default function RegisterPasskeyButton({ user }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!confirm("현재 기기를 로그인 수단으로 등록하시겠습니까?")) return;
    
    setIsLoading(true);
    try {
      await authService.registerPasskey(user.id, user.username);
      alert("✅ 기기가 성공적으로 등록되었습니다!");
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegister}
      disabled={isLoading}
      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition disabled:opacity-50"
    >
      {isLoading ? "등록 중..." : "📱 현재 기기 추가 등록"}
    </button>
  );
}