import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Axios Request Config에 _retry 속성을 추가하기 위한 인터페이스 확장
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

    // config가 없거나, 로그인 요청 에러라면 그냥 리턴 (무한 루프 방지)
    if (!originalRequest || originalRequest.url?.includes("/login")) {
      return Promise.reject(error);
    }

    // 401 에러이고, 아직 재시도하지 않은 요청일 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 1. 토큰 갱신 요청 (기본 axios 인스턴스 사용 -> 인터셉터 영향 안 받음)
        // 백엔드 엔드포인트가 /api/v1/login/refresh 인지 꼭 확인하세요!
        const { data } = await axios.post(`${BASE_URL}/api/v1/login/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        // 2. 새 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // 3. 실패했던 요청의 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. 재요청 (api 인스턴스 사용)
        return api(originalRequest);

      } catch (refreshError) {
        // 리프레시 토큰도 만료되었거나 갱신 실패 시 -> 강제 로그아웃
        console.error("Session expired. Logging out...", refreshError);

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // 페이지 이동으로 확실하게 털어내기
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);