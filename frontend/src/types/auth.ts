// 유저 정보 인터페이스 (백엔드 UserResponse와 일치)
export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string; // 연락용 이메일 (필수)
  
  // 학교 정보 및 인증 상태
  university?: string | null;      // 학교명 (표시용)
  school_email?: string | null;    // 인증된 학교 이메일
  is_student_verified: boolean;    // 학생 회원 인증 여부 (권한 체크 핵심)
  
  is_active: boolean;
  date_joined?: string;
}

// 로그인 응답
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// 아이디 중복 체크 응답
export interface CheckUsernameResponse {
  isAvailable: boolean;
  message?: string;
}

// 패스키 회원가입 요청 (비밀번호 없음)
export interface PasskeySignupRequest {
  username: string;
  nickname: string;
  email: string;
  university_id?: number;
}

// 이메일 인증 관련
export interface EmailSendRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  code: string;
}