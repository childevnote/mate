'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { handleGoogleSignIn } from "@/utils/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("세션 없음 또는 에러:", error);
        router.push("/login");
        return;
      }

      // DB에 사용자 정보 저장
      await handleGoogleSignIn(session);

      // 홈으로 이동
      router.push("/");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen text-gray-600">
      로그인 처리 중입니다...
    </div>
  );
}
