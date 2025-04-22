"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        // 로그인 안 되어 있으면 로그인 페이지로 이동
        router.replace("/login");
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">마이페이지</h2>
        <div className="mb-4">
          <div>
            <b>이메일:</b> {user?.email}
          </div>
          <div>
            <b>유저 ID:</b> {user?.id}
          </div>
          {/* 필요하다면 추가 정보 표시 */}
        </div>
        <Button className="w-full" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}
