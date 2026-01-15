import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Axios Request Config 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 무한 루프 방지
    if (!originalRequest || originalRequest.url?.includes("/login") || originalRequest.url?.includes("/refresh")) {
      return Promise.reject(error);
    }

    // 401 에러이고, 아직 재시도하지 않은 요청일 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰 가져오기 (LocalStorage)
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
            throw new Error("리프레시 토큰이 없습니다.");
        }
        // 2. 토큰 리프레시 요청
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/login/refresh`, 
          { refresh_token: refreshToken }, // Body에 담아서 전송
          { 
            headers: { "Content-Type": "application/json" },
            withCredentials: true 
          }
        );

        // 3. 새 토큰 저장
        const newAccessToken = data.access_token;
        localStorage.setItem("accessToken", newAccessToken);
        
        if (data.refresh_token) {
          localStorage.setItem("refreshToken", data.refresh_token);
        }

        // 4. 실패했던 요청의 헤더 업데이트 후 재요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // 리프레시 실패 -> 세션 만료로 간주하고 로그아웃 처리
        console.error("Session expired. Logging out...", refreshError);

        // 스토리지 비우기
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");         // 일반적인 유저 정보 키
        localStorage.removeItem("auth-storage"); // Jotai 등 상태관리 키 (확인 후 적용)

        // 페이지 이동으로 상태 초기화
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);