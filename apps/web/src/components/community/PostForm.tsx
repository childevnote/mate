"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { Plus, X, Loader2, Film } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/types/category";
import { userAtom } from "@/store/authStore";
import {
  uploadFile,
  validateFile,
  isVideoFile,
  isVideoUrl,
} from "@/services/mediaService";

export interface PostFormData {
  title: string;
  content: string;
  category: string;
  media_urls: string[];
}

interface PostFormProps {
  initialData?: PostFormData;
  onSubmit: (data: PostFormData, removedUrls: string[]) => void;
  isSubmitting: boolean;
}

const MAX_MEDIA_COUNT = 10;
const ACCEPT_TYPES = ".jpg,.jpeg,.png,.webp,.mp4,.webm";

export default function PostForm({
  initialData,
  onSubmit,
  isSubmitting,
}: PostFormProps) {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [category, setCategory] = useState(initialData?.category || "FREE");

  // 미디어 상태
  const [existingUrls, setExistingUrls] = useState<string[]>(
    initialData?.media_urls || []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 미리보기 URL 생성 및 메모리 정리
  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFiles]);

  const totalMediaCount = existingUrls.length + newFiles.length;

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (totalMediaCount + files.length > MAX_MEDIA_COUNT) {
      alert(`미디어는 최대 ${MAX_MEDIA_COUNT}개까지 첨부할 수 있습니다.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }
    if (validFiles.length > 0) {
      setNewFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 기존 미디어 제거
  const removeExistingMedia = (url: string) => {
    setExistingUrls((prev) => prev.filter((u) => u !== url));
    setRemovedUrls((prev) => [...prev, url]);
  };

  // 새 파일 제거
  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploadError(null);
    let uploadedUrls: string[] = [];

    // 새 파일들을 Supabase Storage에 업로드
    if (newFiles.length > 0) {
      setIsUploading(true);
      try {
        uploadedUrls = await Promise.all(
          newFiles.map((file) => uploadFile(file, user.id))
        );
      } catch (err) {
        console.error(err);
        setUploadError("파일 업로드에 실패했습니다. 다시 시도해주세요.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const finalMediaUrls = [...existingUrls, ...uploadedUrls];

    onSubmit(
      { title, content, category, media_urls: finalMediaUrls },
      removedUrls
    );
  };

  const isDisabled = isUploading || isSubmitting;
  const buttonText = isUploading
    ? "파일 업로드 중..."
    : isSubmitting
      ? "저장 중..."
      : initialData
        ? "수정하기"
        : "등록하기";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background p-6 rounded-xl shadow-sm border border-gray-100"
    >
      {/* 1. 카테고리 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          카테고리
        </label>
        <select
          aria-label="카테고리 선택"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-primary transition"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}게시판
            </option>
          ))}
        </select>
      </div>

      {/* 2. 제목 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-primary transition"
          required
        />
      </div>

      {/* 3. 본문 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 자유롭게 작성해주세요"
          className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-primary transition resize-none"
          required
        />
      </div>

      {/* 4. 미디어 첨부 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-1">
          미디어 첨부{" "}
          <span className="text-xs font-normal text-gray-400">
            ({totalMediaCount}/{MAX_MEDIA_COUNT})
          </span>
        </label>
        <p className="text-xs text-gray-400 mb-3">
          사진(jpg, png, webp) 5MB 이하 · 영상(mp4, webm) 50MB 이하
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {/* 기존 미디어 썸네일 */}
          {existingUrls.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {isVideoUrl(url) ? (
                <div className="relative w-full h-full">
                  <video
                    src={url}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeExistingMedia(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* 새 파일 미리보기 */}
          {newFiles.map((file, index) => (
            <div
              key={`new-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-blue-200 bg-blue-50"
            >
              {isVideoFile(file) ? (
                <div className="relative w-full h-full">
                  <video
                    src={previewUrls[index]}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrls[index]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* "새 파일" 뱃지 */}
              <span className="absolute bottom-1 left-1 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">
                NEW
              </span>
            </div>
          ))}

          {/* 추가 버튼 */}
          {totalMediaCount < MAX_MEDIA_COUNT && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <Plus className="w-8 h-8" />
              <span className="text-xs mt-1">추가</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadError && (
          <p className="text-sm text-red-500 mt-2">{uploadError}</p>
        )}
      </div>

      {/* 업로드 진행 상태 */}
      {isUploading && (
        <div className="mb-4 flex items-center gap-2 text-primary text-sm bg-primary/5 px-4 py-3 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>파일을 업로드하고 있습니다...</span>
        </div>
      )}

      {/* 5. 버튼 그룹 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-background border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className="px-6 py-2 text-white bg-primary rounded-lg font-bold hover:bg-primary/90 transition disabled:bg-primary/40 flex items-center gap-2"
        >
          {(isUploading || isSubmitting) && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {buttonText}
        </button>
      </div>
    </form>
  );
}
