import LoginPage from "@/app/login/page";
import api from "@/lib/axios";

export const postService = {
  getPosts: async (page = 1, search = "") => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (search) {
      params.append("search", search);
    }

    const response = await api.get(
      `/api/community/posts/?${params.toString()}`
    );
    return response.data;
  },

  createPost: async (formData: FormData) => {
    const response = await api.post("/api/community/posts/", formData);
    return response.data;
  },

  getPostDetail: async (id: number) => {
    const response = await api.get(`/api/community/posts/${id}/`);
    return response.data;
  },

  updatePost: async (id: number, formData: FormData) => {
    const response = await api.put(`/api/community/posts/${id}/`, formData);
    return response.data;
  },

  deletePost: async (id: number) => {
    await api.delete(`/api/community/posts/${id}/`);
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/users/login/", { email, password });
    return response.data;
  },
};
