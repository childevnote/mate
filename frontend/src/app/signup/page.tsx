"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { authService } from "@/services/authService";
import { PasskeySignupRequest } from "@/types/auth";
import AlertModal from "@/components/ui/AlertModal";
import Spinner from "@/components/ui/Spinner";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<PasskeySignupRequest>({
    username: "",
    nickname: "",
    email: "",
    university_id: undefined,
  });

  const [verifyCode, setVerifyCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  
  const [loadingMap, setLoadingMap] = useState({
    username: false,
    emailSend: false,
    emailVerify: false,
    submit: false,
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: "info" as "success" | "error" | "info",
    message: "",
  });

  // ... (헬퍼 함수들 기존과 동일) ...
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      if (error.response?.data?.detail) {
        return error.response.data.detail as string;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "알 수 없는 오류가 발생했습니다.";
  };

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setModal({ isOpen: true, type, message });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (modal.message.includes("완료되었습니다")) {
      router.push("/");
    }
  };

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

  const handleCheckId = async () => {
    if (!formData.username) return showAlert("error", "아이디를 입력해주세요.");

    setLoadingMap(prev => ({ ...prev, username: true }));
    try {
      const result = await authService.checkUsername(formData.username);
      if (result.isAvailable) {
        setIsIdChecked(true);
        showAlert("success", "사용 가능한 아이디입니다.");
      } else {
        setIsIdChecked(false);
        showAlert("error", "이미 사용 중인 아이디입니다.");
      }
    } catch (error: unknown) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setLoadingMap(prev => ({ ...prev, username: false }));
    }
  };

  const handleSendCode = async () => {
    if (!formData.email) return showAlert("error", "이메일을 입력해주세요.");

    setLoadingMap(prev => ({ ...prev, emailSend: true }));
    try {
      await authService.sendVerificationEmail(formData.email);
      setIsCodeSent(true);
      showAlert("success", `📧 [${formData.email}]로 인증번호가 발송되었습니다.\n스팸 메일함도 확인해주세요!`);
    } catch (error: unknown) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setLoadingMap(prev => ({ ...prev, emailSend: false }));
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode) return showAlert("error", "인증번호를 입력해주세요.");

    setLoadingMap(prev => ({ ...prev, emailVerify: true }));
    try {
      await authService.verifyEmailCode(formData.email, verifyCode);
      setIsEmailVerified(true);
      showAlert("success", "✅ 이메일 인증이 완료되었습니다.");
    } catch (error: unknown) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setLoadingMap(prev => ({ ...prev, emailVerify: false }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIdChecked) return showAlert("error", "아이디 중복 확인을 해주세요.");
    if (!formData.nickname) return showAlert("error", "닉네임을 입력해주세요.");
    if (!isEmailVerified) return showAlert("error", "이메일 인증을 완료해주세요.");

    setLoadingMap(prev => ({ ...prev, submit: true }));
    try {
      await authService.signupWithPasskey(formData);
      showAlert("success", "🎉 회원가입 및 기기 등록이 완료되었습니다!\n자동으로 로그인됩니다.");
    } catch (error: unknown) {
      console.error(error);
      showAlert("error", getErrorMessage(error));
    } finally {
      setLoadingMap(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 transition-colors duration-300">
      <AlertModal 
        isOpen={modal.isOpen} 
        type={modal.type} 
        message={modal.message} 
        onClose={closeModal} 
      />

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
                disabled={isIdChecked || loadingMap.username}
                className={`w-24 px-4 py-2 text-sm rounded-lg font-bold transition-colors whitespace-nowrap flex items-center justify-center ${
                  isIdChecked
                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                    : "bg-muted text-muted-foreground border border-border hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                }`}
              >
                {loadingMap.username ? <Spinner className="text-gray-500" /> : (isIdChecked ? "✔ 확인됨" : "중복확인")}
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

          {/* 3. 이메일 인증 */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-border">
            <label className="block text-sm font-bold text-foreground mb-2">
              연락용 이메일 (계정 복구용)
            </label>
            
            <div className="flex gap-2 mb-2">
              <input 
                type="email" 
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                disabled={isEmailVerified}
              />
              <button 
                type="button"
                onClick={handleSendCode}
                disabled={isEmailVerified || isCodeSent || !formData.email || loadingMap.emailSend}
                className="w-24 px-3 py-2 bg-gray-800 dark:bg-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center"
              >
                {loadingMap.emailSend ? <Spinner /> : (isCodeSent ? "재전송" : "인증번호")}
              </button>
            </div>

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
                  disabled={loadingMap.emailVerify}
                  className="w-16 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center disabled:opacity-70"
                >
                   {loadingMap.emailVerify ? <Spinner /> : "확인"}
                </button>
              </div>
            )}
            
            {isEmailVerified && (
              <p className="text-green-600 dark:text-green-400 text-sm font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                ✅ 인증이 완료되었습니다.
              </p>
            )}
          </div>

          <hr className="border-border my-6" />

          {/* 최종 가입 버튼 */}
          <button
            type="submit"
            disabled={!isEmailVerified || loadingMap.submit}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2
              ${isEmailVerified 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]" 
                : "bg-gray-300 dark:bg-zinc-700 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loadingMap.submit ? (
              <>
                <Spinner />
                <span>가입 처리 중...</span>
              </>
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