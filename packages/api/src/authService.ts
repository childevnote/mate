import type { AxiosInstance } from "axios";
import type {
  LoginResponse,
  CheckUsernameResponse,
  PasskeySignupRequest,
  EmailSendRequest,
  EmailVerifyRequest,
  PasskeyItem,
} from "@mate/types";
import { TOKEN_KEYS } from "./storage";
import type { StorageAdapter } from "./storage";

/**
 * Creates auth service functions.
 * Passkey biometric calls (`startRegistration` / `startAuthentication`) are
 * intentionally NOT included here — they are platform-specific and must be
 * handled in each app (web: @simplewebauthn/browser, mobile: platform API).
 */
export function createAuthService(api: AxiosInstance, storage: StorageAdapter) {
  return {
    /** 아이디 중복 체크 */
    checkUsername: async (username: string) => {
      const res = await api.get<CheckUsernameResponse>(
        `/api/v1/users/check-username?username=${username}`
      );
      return res.data;
    },

    /** 이메일 인증번호 발송 */
    sendVerificationEmail: async (email: string) => {
      const data: EmailSendRequest = { email };
      const res = await api.post("/api/v1/auth/email/send", data);
      return res.data;
    },

    /** 이메일 인증번호 확인 */
    verifyEmailCode: async (email: string, code: string) => {
      const data: EmailVerifyRequest = { email, code };
      const res = await api.post("/api/v1/auth/email/verify", data);
      return res.data;
    },

    /**
     * 패스키 회원가입 검증 (biometric step은 호출자가 수행)
     * Returns tokens on success.
     */
    signupPasskeyVerify: async (
      payload: PasskeySignupRequest & { response: unknown }
    ) => {
      const res = await api.post<LoginResponse>(
        "/api/v1/auth/passkey/signup/verify",
        {
          username: payload.username,
          nickname: payload.nickname,
          email: payload.email,
          university_id: payload.university_id,
          response: payload.response,
        }
      );
      const { access_token, refresh_token } = res.data;
      if (access_token) await storage.setItem(TOKEN_KEYS.ACCESS, access_token);
      if (refresh_token) await storage.setItem(TOKEN_KEYS.REFRESH, refresh_token);
      return res.data;
    },

    /** 패스키 회원가입 — 옵션 요청 */
    getSignupPasskeyOptions: async (username: string) => {
      const res = await api.post("/api/v1/auth/passkey/signup/options", {
        username,
      });
      return res.data;
    },

    /** 패스키 로그인 — 옵션 요청 */
    getLoginPasskeyOptions: async (username: string) => {
      const res = await api.post("/api/v1/auth/passkey/login/options", {
        username,
      });
      return res.data;
    },

    /**
     * 패스키 로그인 검증 (biometric step은 호출자가 수행)
     */
    loginPasskeyVerify: async (username: string, response: unknown) => {
      const res = await api.post<LoginResponse>(
        "/api/v1/auth/passkey/login/verify",
        { username, response }
      );
      const { access_token, refresh_token } = res.data;
      if (access_token) await storage.setItem(TOKEN_KEYS.ACCESS, access_token);
      if (refresh_token) await storage.setItem(TOKEN_KEYS.REFRESH, refresh_token);
      return res.data;
    },

    /** 로그아웃 (토큰 삭제) */
    logout: async () => {
      await storage.removeItem(TOKEN_KEYS.ACCESS);
      await storage.removeItem(TOKEN_KEYS.REFRESH);
    },

    /** 내 패스키 목록 조회 */
    getMyPasskeys: async (): Promise<PasskeyItem[]> => {
      const res = await api.get<PasskeyItem[]>("/api/v1/auth/passkey/list");
      return res.data;
    },

    /** 패스키 삭제 */
    deletePasskey: async (passkeyId: number) => {
      const res = await api.delete(`/api/v1/auth/passkey/${passkeyId}`);
      return res.data;
    },

    /** 기기 추가 등록 (마이페이지) — 옵션 요청 */
    getRegisterPasskeyOptions: async (userId: number) => {
      const res = await api.post("/api/v1/auth/passkey/register/options", {
        user_id: userId,
      });
      return res.data;
    },

    /** 기기 추가 등록 — 검증 */
    registerPasskeyVerify: async (username: string, response: unknown) => {
      const res = await api.post("/api/v1/auth/passkey/register/verify", {
        username,
        response,
      });
      return res.data;
    },

    /** 학교 인증 메일 발송 */
    sendSchoolEmail: async (email: string) => {
      const res = await api.post("/api/v1/auth/school/send", { email });
      return res.data;
    },

    /** 학교 인증 코드 검증 */
    verifySchoolCode: async (email: string, code: string) => {
      const res = await api.post("/api/v1/auth/school/verify", { email, code });
      return res.data;
    },

    /** 최신 유저 정보 */
    getMe: async () => {
      const res = await api.get("/api/v1/auth/me");
      return res.data;
    },
  };
}
