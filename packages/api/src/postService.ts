import type { AxiosInstance } from "axios";
import type { PostSummary, PostDetail } from "@mate/types";

export function createPostService(api: AxiosInstance) {
  return {
    getPosts: async (
      page = 1,
      search = "",
      category = "",
      sort = "latest"
    ) => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (sort) params.append("sort", sort);

      const res = await api.get(`/api/v1/community/posts?${params.toString()}`);
      return res.data;
    },

    createPost: async (data: {
      title: string;
      content: string;
      category: string;
      media_urls?: string[];
    }) => {
      const res = await api.post("/api/v1/community/posts", data);
      return res.data;
    },

    getPostDetail: async (id: number): Promise<PostDetail> => {
      const res = await api.get<PostDetail>(`/api/v1/community/posts/${id}`);
      return res.data;
    },

    updatePost: async (
      id: number,
      data: {
        title?: string;
        content?: string;
        category?: string;
        media_urls?: string[];
      }
    ) => {
      const res = await api.put(`/api/v1/community/posts/${id}`, data);
      return res.data;
    },

    deletePost: async (id: number) => {
      await api.delete(`/api/v1/community/posts/${id}`);
    },

    getComments: async (postId: number) => {
      const res = await api.get(`/api/v1/community/comments?post=${postId}`);
      return res.data;
    },

    createComment: async (
      postId: number,
      content: string,
      parentId?: number
    ) => {
      const res = await api.post("/api/v1/community/comments", {
        content,
        post_id: postId,
        parent_id: parentId,
      });
      return res.data;
    },

    deleteComment: async (commentId: number) => {
      const res = await api.delete(
        `/api/v1/community/comments/${commentId}`
      );
      return res.data;
    },

    toggleLike: async (postId: number) => {
      const res = await api.post(`/api/v1/community/posts/${postId}/like`);
      return res.data;
    },

    toggleScrap: async (postId: number) => {
      const res = await api.post(`/api/v1/community/posts/${postId}/scrap`);
      return res.data;
    },

    getMyPosts: async (): Promise<PostSummary[]> => {
      const res = await api.get<PostSummary[]>("/api/v1/community/posts/me");
      return res.data;
    },

    getMyScraps: async (): Promise<PostSummary[]> => {
      const res = await api.get<PostSummary[]>(
        "/api/v1/community/posts/scrapped"
      );
      return res.data;
    },

    getMyComments: async (authorId: number) => {
      const res = await api.get(
        `/api/v1/community/comments?author=${authorId}`
      );
      return res.data;
    },
  };
}
