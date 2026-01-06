import { api } from "@/lib/axios";

export const postService = {
  getPosts: async (page = 1, search = "") => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (search) {
      params.append("search", search);
    }

    const response = await api.get(
      `/api/v1/community/posts?${params.toString()}`
    );
    return response.data;
  },

  createPost: async (formData: FormData) => {
    const response = await api.post("/api/v1/community/posts", formData);
    return response.data;
  },

  getPostDetail: async (id: number) => {
    const response = await api.get(`/api/v1/community/posts/${id}/`);
    return response.data;
  },

  updatePost: async (id: number, formData: FormData) => {
    const response = await api.put(`/api/v1/community/posts/${id}/`, formData);
    return response.data;
  },

  deletePost: async (id: number) => {
    await api.delete(`/api/v1/community/posts/${id}/`);
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/v1/users/login/", { email, password });
    return response.data;
  },

  getComments: async (postId: number) => {
    const { data } = await api.get(`/api/v1/community/comments?post=${postId}`);
    return data;
  },

  createComment: async (
    postId: number,
    content: string,
    parentId: number | null = null
  ) => {
    const { data } = await api.post("/api/v1/community/comments/", {
      post: postId,
      content,
      parent: parentId,
    });
    return data;
  },

  deleteComment: async (commentId: number) => {
    await api.delete(`/api/v1/community/comments/${commentId}/`);
  },
};
