import { getSupabase } from "@/lib/supabase";

const BUCKET_NAME = "post-media";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 파일 유효성 검사. 에러 메시지를 반환하거나 null(통과).
 */
export function validateFile(file: File): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return `허용되지 않는 파일 형식입니다: ${file.name} (jpg, jpeg, png, webp, mp4, webm만 가능)`;
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return `이미지 파일 크기가 5MB를 초과합니다: ${file.name}`;
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return `영상 파일 크기가 50MB를 초과합니다: ${file.name}`;
  }

  return null;
}

/**
 * 단일 파일을 Supabase Storage에 업로드하고 공개 URL을 반환.
 */
export async function uploadFile(
  file: File,
  userId: number
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const uuid = crypto.randomUUID();
  const filePath = `posts/${userId}/${uuid}.${ext}`;

  const { error } = await getSupabase().storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`업로드 실패 (${file.name}): ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = getSupabase().storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Supabase Storage에서 파일 목록을 삭제.
 */
export async function deleteFiles(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  const paths = urls
    .map((url) => extractStoragePath(url))
    .filter(Boolean) as string[];
  if (paths.length === 0) return;

  const { error } = await getSupabase().storage.from(BUCKET_NAME).remove(paths);

  if (error) {
    console.error("Storage 파일 삭제 실패:", error);
  }
}

/**
 * 전체 공개 URL에서 Storage 경로만 추출.
 * 예) https://xxx.supabase.co/storage/v1/object/public/post-media/posts/1/abc.jpg
 * -> posts/1/abc.jpg
 */
function extractStoragePath(url: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.substring(idx + marker.length));
  } catch {
    return null;
  }
}

/** URL이 영상 파일인지 판별 */
export function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm");
}

/** File 객체가 영상인지 판별 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}
