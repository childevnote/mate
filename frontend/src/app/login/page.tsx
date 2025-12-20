'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { authService } from '@/services/authService';
import { userAtom } from '@/store/authStore';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const router = useRouter();
  // Jotai 상태 업데이트 함수 가져오기
  const setUser = useSetAtom(userAtom);

  // 입력폼 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // React Query useMutation 설정
  const loginMutation = useMutation({
    mutationFn: authService.login,

    // 성공했을 때 실행될 로직
    onSuccess: (user) => {
      console.log('로그인 성공:', user);
      setUser(user); // Jotai 전역 상태에 유저 정보 저장
      router.push('/'); // 메인 페이지로 이동
    },

    // 실패했을 때 실행될 로직
    onError: (error: AxiosError<{ detail: string }>) => {
      console.error('로그인 실패:', error);
      // 백엔드에서 보내준 에러 메시지가 있으면 보여주고, 없으면 기본 메시지 출력
      const message = error.response?.data?.detail || '아이디 또는 비밀번호를 확인해주세요.';
      alert(message);
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 유효성 검사 (간단하게)
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    // 뮤테이션 실행
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 입력란 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="아이디를 입력하세요"
            />
          </div>

          {/* 비밀번호 입력란 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 로그인 버튼 */}
          <div>
            <button
              type="submit"
              // 로딩 중일 때는 버튼 비활성화
              disabled={loginMutation.isPending}
              className={`w-full px-4 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${loginMutation.isPending 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center text-gray-600">
          아직 계정이 없으신가요?{' '}
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}