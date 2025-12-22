import axios from "axios";

// Axios 인스턴스 생성 (기본 설정)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (Request Interceptor) 설정
// API를 쏠 때마다 로컬 스토리지에서 토큰을 꺼내 헤더에 자동으로 붙여줌
api.interceptors.request.use(
  (config) => {
    // 브라우저 환경인지 확인 (Next.js 서버 사이드 렌더링 에러 방지)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        // 토큰이 있으면 Authorization 헤더에 Bearer 토큰 추가
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
