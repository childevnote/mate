import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    return error.message; // 서버 응답이 없으면 기본 Axios 메시지
  }

  if (error instanceof Error && error.name === "NotAllowedError") {
    return "인증이 취소되었습니다. (타임아웃 또는 사용자 취소)";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}