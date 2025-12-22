"use client";

import Link from "next/link";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { userAtom, isLoggedInAtom } from "@/store/authStore";

export default function Navbar() {
  const user = useAtomValue(userAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();

  const handleLogout = () => {
    // 로컬 스토리지 토큰 삭제 및 상태 초기화
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
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

              <span className="text-sm font-medium hidden sm:inline text-foreground">
                {user?.nickname}님
              </span>
              <Link
                href="/write"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
              >
                새 글 쓰기
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
