"use client";

import { useRouter } from "next/navigation";

interface LoginAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginAlertModal({ isOpen, onClose }: LoginAlertModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push("/login"); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-[90%] max-w-sm p-6 transform transition-all scale-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            로그인이 필요한 서비스입니다
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            회원이 되시면 좋아요, 스크랩, 댓글 등<br />
            다양한 활동을 하실 수 있습니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleLogin}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-sm"
          >
            로그인 하러가기
          </button>
        </div>
      </div>
    </div>
  );
}