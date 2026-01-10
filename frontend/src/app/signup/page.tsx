"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/error";
import Link from "next/link";
import { PasskeySignupRequest } from "@/types/auth";

export default function SignupPage() {
  const router = useRouter();

  // 1. 회원가입 폼 상태 (비밀번호 없음, 이메일 필수)
  const [formData, setFormData] = useState<PasskeySignupRequest>({
    username: "",
    nickname: "",
    email: "",
    university_id: undefined, // 선택사항
  });

  // 2. 이메일 인증 관련 상태
  const [verifyCode, setVerifyCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 3. UI 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 가입 진행 중 로딩

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username") setIsIdChecked(false);
    if (name === "email") {
      setIsCodeSent(false);
      setIsEmailVerified(false);
      setVerifyCode("");
    }
  };

  // 아이디 중복 확인
  const handleCheckId = async () => {
    if (!formData.username) return alert("아이디를 입력해주세요.");
    try {
      const result = await authService.checkUsername(formData.username);
      if (result.isAvailable) {
        setIsIdChecked(true);
        alert("사용 가능한 아이디입니다.");
      } else {
        alert("이미 사용 중인 아이디입니다.");
        setIsIdChecked(false);
      }
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!formData.email) return alert("이메일을 입력해주세요.");
    try {
      await authService.sendVerificationEmail(formData.email);
      setIsCodeSent(true);
      alert(`📧 [${formData.email}]로 인증번호가 발송되었습니다.\n스팸 메일함도 확인해주세요!`);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verifyCode) return alert("인증번호를 입력해주세요.");
    try {
      await authService.verifyEmailCode(formData.email, verifyCode);
      setIsEmailVerified(true);
      alert("✅ 이메일 인증이 완료되었습니다.");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  // 🔐 최종 가입 (패스키 등록)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 유효성 검사
    if (!isIdChecked) return setErrorMsg("아이디 중복 확인을 해주세요.");
    if (!formData.nickname) return setErrorMsg("닉네임을 입력해주세요.");
    if (!isEmailVerified) return setErrorMsg("이메일 인증을 완료해주세요.");

    setIsLoading(true);
    try {
      // 패스키 회원가입 호출 (지문 인식 -> 서버 전송 -> 토큰 발급)
      await authService.signupWithPasskey(formData);

      alert("🎉 회원가입 및 기기 등록이 완료되었습니다!\n자동으로 로그인됩니다.");
      router.push("/"); // 메인으로 이동
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
            mate 회원가입
          </h1>
          <p className="text-sm text-muted-foreground">
            3초 만에 패스키로 가입하고 시작하세요.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* 1. 아이디 입력 */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              아이디
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="영문, 숫자 조합"
                className="flex-1 p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
                required
              />
              <button
                type="button"
                onClick={handleCheckId}
                disabled={isIdChecked}
                className={`px-4 py-2 text-sm rounded-lg font-bold transition-colors whitespace-nowrap ${
                  isIdChecked
                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                    : "bg-muted text-muted-foreground border border-border hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                {isIdChecked ? "✔ 확인됨" : "중복확인"}
              </button>
            </div>
          </div>

          {/* 2. 닉네임 입력 */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="활동명 (나중에 변경 가능)"
              className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
              required
            />
          </div>

          {/* 3. 이메일 인증 (핵심) */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-border">
            <label className="block text-sm font-bold text-foreground mb-2">
              연락용 이메일 (계정 복구용)
            </label>
            
            <div className="flex gap-2 mb-2">
              <input 
                type="email" 
                name="email"
                placeholder="example@naver.com"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                disabled={isEmailVerified}
              />
              <button 
                type="button"
                onClick={handleSendCode}
                disabled={isEmailVerified || isCodeSent || !formData.email}
                className="px-3 py-2 bg-gray-800 dark:bg-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isCodeSent ? "재전송" : "인증번호"}
              </button>
            </div>

            {/* 인증번호 입력 칸 */}
            {isCodeSent && !isEmailVerified && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                <input 
                  type="text" 
                  placeholder="인증번호 6자리"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="flex-1 p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                />
                <button 
                  type="button"
                  onClick={handleVerifyCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            )}
            
            {isEmailVerified && (
              <p className="text-green-600 dark:text-green-400 text-sm font-bold mt-1 flex items-center gap-1">
                ✅ 인증이 완료되었습니다.
              </p>
            )}
          </div>

          <hr className="border-border my-6" />

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm text-center font-medium animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!isEmailVerified || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2
              ${isEmailVerified 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]" 
                : "bg-gray-300 dark:bg-zinc-700 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
               "⏳ 가입 처리 중..."
            ) : (
               "🔐 지문 등록하고 가입 완료"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-bold text-primary underline underline-offset-4 hover:text-foreground transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}