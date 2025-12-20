
import api from '@/lib/axios';

export const authService = {
  // 로그인 요청
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/users/login/', credentials);
    const { access, refresh, user } = response.data;

    // 토큰 저장 (로그인 유지용)
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    return user;
  },

  // 내 프로필 조회
  getMe: async () => {
    const response = await api.get('/api/users/me/');
    return response.data;
  }
};