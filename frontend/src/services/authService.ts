import { api } from "@/lib/axios";
import { LoginResponse, SignupRequest } from "@/types/auth";
import { CheckUsernameResponse } from "@/types/auth";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

export const authService = {
  checkUsername: async (username: string) => {
    const response = await api.get<CheckUsernameResponse>(
      `/api/v1/users/check-username?username=${username}`
    );
    return response.data;
  },

  register: async (signupData: SignupRequest) => {
    const response = await api.post("/api/v1/users/register", signupData);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post<LoginResponse>(
      "/api/v1/auth/login", 
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.access_token) {
      localStorage.setItem("accessToken", response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem("refreshToken", response.data.refresh_token);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  
  /**
   * 기기 등록 (로그인 된 상태에서 호출)
   * @param userId 유저 PK (DB ID)
   * @param username 유저 아이디 (Challenge 검증용)
   */
  registerPasskey: async (userId: number, username: string) => {
    try {
      // 서버에 등록 옵션(Challenge) 요청
      const { data: options } = await api.post("/api/v1/auth/passkey/register/options", {
        user_id: userId,
      });

      // 브라우저 지문/FaceID 프롬프트 실행
      const attResp = await startRegistration(options);

      // 결과를 서버로 전송하여 검증 및 저장
      await api.post("/api/v1/auth/passkey/register/verify", {
        username: username, 
        response: attResp,
      });

      return true;
    } catch (error) {
      console.error("Passkey registration failed:", error);
      throw error;
    }
  },

  /**
   * 패스키 로그인 (아이디 입력 후 호출)
   * @param username 유저 아이디
   */
  loginPasskey: async (username: string) => {
    try {
      // 서버에 로그인 옵션(Challenge) 요청
      const { data: options } = await api.post("/api/v1/auth/passkey/login/options", {
        username: username,
      });

      // 브라우저 지문 인식 프롬프트 실행
      const asseResp = await startAuthentication(options);

      // 결과를 서버로 전송하여 검증 -> 성공 시 토큰 발급
      const response = await api.post<LoginResponse>("/api/v1/auth/passkey/login/verify", {
        username: username,
        response: asseResp,
      });

      // 토큰 저장 (일반 로그인과 동일 로직)
      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error("Passkey login failed:", error);
      throw error;
    }
  },
};