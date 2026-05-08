import type { AxiosInstance } from "axios";
import type {
  Post,
  Comment,
  PushTokenRequest,
} from "@mate/types";

export function createUserService(api: AxiosInstance) {
  return {
    /** 내가 쓴 글 목록 — /api/v1/community/posts/me (plain list) */
    getMyPosts: async (): Promise<Post[]> => {
      const res = await api.get<Post[]>("/api/v1/community/posts/me");
      return res.data;
    },

    getMyComments: async (userId: number): Promise<Comment[]> => {
      const res = await api.get<Comment[]>(
        `/api/v1/community/comments?author=${userId}`
      );
      return res.data;
    },

    /** 스크랩한 글 목록 — /api/v1/community/posts/scrapped (plain list, no trailing slash) */
    getScrappedPosts: async (): Promise<Post[]> => {
      const res = await api.get<Post[]>("/api/v1/community/posts/scrapped");
      return res.data;
    },

    /** Expo push token 등록 (앱 전용) */
    registerPushToken: async (
      tokenData: PushTokenRequest
    ): Promise<{ message: string }> => {
      const res = await api.post<{ message: string }>(
        `/api/v1/users/push-token`,
        tokenData
      );
      return res.data;
    },
  };
}
