import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 (그대로 유지)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인 요청에 대한 에러는 그대로 반환
    if (originalRequest.url?.includes("/login")) {
        return Promise.reject(error);
    }

    // 401 에러이고, 재시도 플래그가 없을 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(`${BASE_URL}/api/v1/login/refresh`, {
          refresh_token: refreshToken, 
        });
        const newAccessToken = data.access_token;
        
        // 새 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        
        if (data.refresh_token) {
            localStorage.setItem("refreshToken", data.refresh_token);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // axios 인스턴스로 재요청 (api 객체 사용)
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Refresh token expired. Logging out...");
        
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);