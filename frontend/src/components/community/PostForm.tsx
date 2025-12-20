'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 폼에서 사용할 데이터 타입 정의
interface PostFormData {
  title: string;
  content: string;
  category: string;
  image: File | null;
}

interface PostFormProps {
  initialData?: PostFormData; // 수정 모드일 때 초기값
  onSubmit: (formData: FormData) => void; // 부모에게 데이터 전달
  isSubmitting: boolean;
}

export default function PostForm({ initialData, onSubmit, isSubmitting }: PostFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'FREE');
  const [image, setImage] = useState<File | null>(initialData?.image || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // FormData로 변환 (이미지 전송 필수)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* 1. 카테고리 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">카테고리</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        >
          <option value="FREE">자유게시판</option>
          <option value="INFO">정보공유</option>
          <option value="QUESTION">질문하기</option>
        </select>
      </div>

      {/* 2. 제목 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          required
        />
      </div>

      {/* 3. 본문 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 자유롭게 작성해주세요"
          className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
          required
        />
      </div>

      {/* 4. 이미지 업로드 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">이미지 첨부 (선택)</label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
          />
        </div>
      </div>

      {/* 5. 버튼 그룹 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-white bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:bg-indigo-300"
        >
          {isSubmitting ? '저장 중...' : '등록하기'}
        </button>
      </div>
    </form>
  );
}