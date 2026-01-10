import { api } from "@/lib/axios";
import {
  LoginResponse,
  CheckUsernameResponse,
  PasskeySignupRequest, // 새로 만든 타입
  EmailSendRequest,     // 새로 만든 타입
  EmailVerifyRequest    // 새로 만든 타입
} from "@/types/auth";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

export const authService = {
  /**
   * 아이디 중복 체크
   */
  checkUsername: async (username: string) => {
    const response = await api.get<CheckUsernameResponse>(
      `/api/v1/users/check-username?username=${username}`
    );
    return response.data;
  },

  /**
   * 📧 1. 이메일 인증번호 발송
   */
  sendVerificationEmail: async (email: string) => {
    const data: EmailSendRequest = { email };
    // 백엔드 엔드포인트는 auth.py 등에 구현되었다고 가정 (/api/v1/auth/email/send)
    const response = await api.post("/api/v1/auth/email/send", data);
    return response.data;
  },

  /**
   * 2. 이메일 인증번호 확인
   */
  verifyEmailCode: async (email: string, code: string) => {
    const data: EmailVerifyRequest = { email, code };
    const response = await api.post("/api/v1/auth/email/verify", data);
    return response.data;
  },

  /**
   * 3. 패스키로 회원가입 (One-Step)
   * 이메일 인증이 완료된 후 호출해야 함
   */
  signupWithPasskey: async (signupData: PasskeySignupRequest) => {
    try {
      // 3-1. 서버에 가입 옵션 요청 (아이디 중복 체크 및 Challenge 생성)
      const { data: options } = await api.post("/api/v1/auth/passkey/signup/options", {
        username: signupData.username,
      });

      // 3-2. 브라우저 지문 인식 (회원가입 모드)
      const attResp = await startRegistration(options);

      // 3-3. 서버에 검증 요청 + 회원 정보 전송 -> 가입 완료 & 토큰 수신
      // 백엔드 passkey.py의 signup_verify 함수와 매칭
      const response = await api.post<LoginResponse>("/api/v1/auth/passkey/signup/verify", {
        username: signupData.username,
        nickname: signupData.nickname,
        email: signupData.email,
        university_id: signupData.university_id,
        response: attResp, // 지문 인식 결과
      });

      // 3-4. 토큰 저장 (자동 로그인)
      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error("Passkey signup failed:", error);
      throw error;
    }
  },

  /**
   * 4. 패스키 로그인
   */
  loginPasskey: async (username: string) => {
    try {
      // 4-1. 서버에 로그인 옵션 요청
      const { data: options } = await api.post("/api/v1/auth/passkey/login/options", {
        username: username,
      });

      // 4-2. 브라우저 지문 인식
      const asseResp = await startAuthentication(options);

      // 4-3. 검증 및 토큰 발급
      const response = await api.post<LoginResponse>("/api/v1/auth/passkey/login/verify", {
        username: username,
        response: asseResp,
      });

      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error("Passkey login failed:", error);
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  /**
   * 기기 추가 등록 (마이페이지용)
   * 이미 로그인된 유저가 새 기기를 등록할 때 사용
   */
  registerPasskey: async (userId: number, username: string) => {
    try {
      const { data: options } = await api.post("/api/v1/auth/passkey/register/options", {
        user_id: userId,
      });

      const attResp = await startRegistration(options);

      await api.post("/api/v1/auth/passkey/register/verify", {
        username: username,
        response: attResp,
      });

      return true;
    } catch (error) {
      console.error("Device registration failed:", error);
      throw error;
    }
  },
};