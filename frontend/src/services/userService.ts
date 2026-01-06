import { api } from "@/lib/axios";
import { Comment as IComment } from "@/types/comment";
import { PaginatedResponse } from "@/types/common";
import { Post } from "@/types/post";
import { PasswordChangeRequest, UserActionResponse } from "@/types/user";

export const userService = {
  getMyPosts: async (userId: number): Promise<Post[]> => {
    const { data } = await api.get<PaginatedResponse<Post>>(
      `/api/v1/community/posts/?author=${userId}`
    );
    return data.results;
  },

  getMyComments: async (userId: number): Promise<IComment[]> => {
    const { data } = await api.get<IComment[]>(
      `/api/v1/community/comments/?author=${userId}`
    );
    return data;
  },

  getScrappedPosts: async (): Promise<Post[]> => {
    const { data } = await api.get<PaginatedResponse<Post>>(
      `/api/v1/community/posts/scrapped/`
    );
    return data.results;
  },

  changePassword: async (
    passwordData: PasswordChangeRequest
  ): Promise<UserActionResponse> => {
    const { data } = await api.post<UserActionResponse>(
      `/api/users/change-password/`,
      passwordData
    );
    return data;
  },

  deleteAccount: async (): Promise<UserActionResponse> => {
    const { data } = await api.delete<UserActionResponse>(
      `/api/users/delete-account/`
    );
    return data;
  },
};
