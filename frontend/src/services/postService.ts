import { api } from "@/lib/axios";
import { PostSummary } from "@/types/post";

export const postService = {
  getPosts: async (page = 1, search = "", category = "", sort = "latest") => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);

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
    const response = await api.get(`/api/v1/community/posts/${id}`);
    return response.data;
  },

  updatePost: async (id: number, formData: FormData) => {
    const response = await api.put(`/api/v1/community/posts/${id}`, formData);
    return response.data;
  },

  deletePost: async (id: number) => {
    await api.delete(`/api/v1/community/posts/${id}`);
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/v1/users/login", { email, password });
    return response.data;
  },

  getComments: async (postId: number) => {
    const { data } = await api.get(`/api/v1/community/comments?post=${postId}`);
    return data;
  },

  createComment: async (
    postId: number,
    content: string,
    parentId?: number
  ) => {
    const response = await api.post("/api/v1/community/comments", {
      content: content,
      post_id: postId,
      parent_id: parentId,
    });
    return response.data;
  },

  deleteComment: async (commentId: number) => {
    const response = await api.delete(`/api/v1/community/comments/${commentId}`);
    return response.data;
  },

  toggleLike: async (postId: number) => {
    const { data } = await api.post(`/api/v1/community/posts/${postId}/like`);
    return data;
  },

  toggleScrap: async (postId: number) => {
    const { data } = await api.post(`/api/v1/community/posts/${postId}/scrap`);
    return data;
  },

  // 내가 쓴 글 조회
  getMyPosts: async () => {
    // 백엔드의 /posts/me 엔드포인트 호출
    const { data } = await api.get<PostSummary[]>("/api/v1/community/posts/me");
    return data;
  },

  // 내가 스크랩한 글 조회
  getMyScraps: async () => {
    // 백엔드의 /posts/scrapped 엔드포인트 호출
    const { data } = await api.get<PostSummary[]>("/api/v1/community/posts/scrapped");
    return data;
  },

  // 내 댓글 조회
  getMyComments: async (authorId: number) => {
    const { data } = await api.get(`/api/v1/community/comments?author=${authorId}`);
    return data;
  },
};
