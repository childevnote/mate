import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

api.interceptors.response.use(
  (response) => response, // 성공한 응답은 그대로 통과
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않은 요청이라면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지용 플래그

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // 리프레시 토큰조차 없다면 로그아웃
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // 백엔드에 토큰 갱신 요청
        const { data } = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        // 새 토큰 저장
        localStorage.setItem("accessToken", data.access);

        // 실패했던 요청의 헤더를 새 토큰으로 교체
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;

        // 실패했던 요청 재전송
        return api(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 (리프레시 토큰도 만료됨) -> 강제 로그아웃 처리
        console.error("Session expired. Logging out...");

        // 저장소 비우기
        localStorage.removeItem("user"); // userAtom 저장 키
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // 로그인 페이지로 튕겨내기 (window.location을 써야 새로고침 되면서 상태가 초기화됨)
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
