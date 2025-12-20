'use client'

import Link from 'next/link';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { userAtom, isLoggedInAtom } from '@/store/authStore';

export default function Navbar() {
  const user = useAtomValue(userAtom);
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();

  const handleLogout = () => {
    // 로컬 스토리지 토큰 삭제 및 상태 초기화
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight">
          MATE
        </Link>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {user?.nickname}님
              </span>
              <Link 
                href="/write" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
              >
                새 글 쓰기
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}