import type { AxiosInstance } from "axios";
import type {
  Post,
  Comment,
  PaginatedResponse,
  PasswordChangeRequest,
  UserActionResponse,
  PushTokenRequest,
} from "@mate/types";

export function createUserService(api: AxiosInstance) {
  return {
    getMyPosts: async (userId: number): Promise<Post[]> => {
      const res = await api.get<PaginatedResponse<Post>>(
        `/api/v1/community/posts?author=${userId}`
      );
      return res.data.results;
    },

    getMyComments: async (userId: number): Promise<Comment[]> => {
      const res = await api.get<Comment[]>(
        `/api/v1/community/comments?author=${userId}`
      );
      return res.data;
    },

    getScrappedPosts: async (): Promise<Post[]> => {
      const res = await api.get<PaginatedResponse<Post>>(
        `/api/v1/community/posts/scrapped/`
      );
      return res.data.results;
    },

    changePassword: async (
      passwordData: PasswordChangeRequest
    ): Promise<UserActionResponse> => {
      const res = await api.post<UserActionResponse>(
        `/api/v1/users/change-password/`,
        passwordData
      );
      return res.data;
    },

    deleteAccount: async (): Promise<UserActionResponse> => {
      const res = await api.delete<UserActionResponse>(
        `/api/v1/users/delete-account/`
      );
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
