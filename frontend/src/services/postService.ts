import api from '@/lib/axios';

export const postService = {
  // 검색어(search)와 페이지(page)를 받아 리스트 조회
  getPosts: async (page = 1, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) {
      params.append('search', search);
    }
  
    // 최종 URL: /api/community/posts/?page=1&search=파이썬
    const response = await api.get(`/api/community/posts/?${params.toString()}`);
    return response.data;

    
  },

  // 게시글 작성 (이미지 포함)
  createPost: async (formData: FormData) => {
    const response = await api.post('/api/community/posts/', formData);
    return response.data;
  },

  getPostDetail: async (id: number) => {
    const response = await api.get(`/api/community/posts/${id}/`);
    return response.data;
  }
};