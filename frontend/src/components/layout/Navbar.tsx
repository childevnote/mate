"use client";

import Link from "next/link";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { userAtom, isLoggedInAtom } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";

export default function Navbar() {
  const user = useAtomValue(userAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    // 로컬 스토리지 토큰 삭제 및 상태 초기화
    queryClient.clear();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black tracking-[-0.075em] text-foreground hover:opacity-80 transition-opacity">
            mate
          </span>
        </Link>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {user?.university && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                  {user.university}
                </span>
              )}
              <Link
                href="/write"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary transition shadow-sm"
              >
                새 글 쓰기
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition group"
                aria-label="마이페이지로 이동"
              >
                <div className="text-sm font-bold text-gray-700 group-hover:text-black hidden md:block">
                  {user?.nickname}님
                </div>
                {/* 닉네임 첫 글자로 만든 아바타 */}
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold border border-primary/20">
                  {user?.nickname[0]}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-gray-800"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
