"use client";

import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

interface ScrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScrapModal({ isOpen, onClose }: ScrapModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-[90%] max-w-sm p-6 transform transition-all scale-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            스크랩이 완료되었습니다!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            마이페이지의 스크랩 보관함에 저장되었습니다.<br />
            보관함으로 이동하시겠습니까?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            계속 보기
          </button>
          <button
            onClick={() => {
              onClose();
              router.push("/mypage?tab=scraps");
            }}
            className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-colors shadow-sm"
          >
            보관함 가기
          </button>
        </div>
      </div>
    </div>
  );
}