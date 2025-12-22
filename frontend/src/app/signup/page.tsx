"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    university: "",
  });

  const [isIdChecked, setIsIdChecked] = useState(false); // 아이디 중복 확인 완료 여부
  const [isUniAuthMode, setIsUniAuthMode] = useState(true); // 학교 인증 할지 말지 (기본: 함)
  const [errorMsg, setErrorMsg] = useState(""); // 에러 메시지 표시용

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username") setIsIdChecked(false);
  };

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
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string })?.message ||
          "중복 확인 중 오류가 발생했습니다.";
        alert(message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isIdChecked) {
      setErrorMsg("아이디 중복 확인을 해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (formData.password.length < 4) {
      setErrorMsg("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      await authService.register({
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        university: isUniAuthMode ? formData.university : null,
        email: null,
      });

      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      router.push("/login");
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string })?.message ||
          "회원가입에 실패했습니다.";
        setErrorMsg(message);
      } else if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("알 수 없는 오류가 발생했습니다.");
      }
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
            나만의 캠퍼스 메이트를 만나보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="4자 이상 입력"
              className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:outline-none bg-background text-foreground transition-all ${
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border focus:ring-primary"
              }`}
              required
            />
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 font-medium animate-pulse">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="자유롭게 설정 (중복 가능)"
              className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground transition-all"
              required
            />
          </div>

          <hr className="border-border my-6" />

          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-foreground">
                학교 인증 (선택)
              </label>

              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isUniAuthMode
                        ? "border-primary bg-primary"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {isUniAuthMode && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="authMode"
                    checked={isUniAuthMode}
                    onChange={() => setIsUniAuthMode(true)}
                    className="hidden"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    인증하기
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !isUniAuthMode
                        ? "border-primary bg-primary"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {!isUniAuthMode && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="authMode"
                    checked={!isUniAuthMode}
                    onChange={() => setIsUniAuthMode(false)}
                    className="hidden"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    나중에
                  </span>
                </label>
              </div>
            </div>

            {isUniAuthMode ? (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="학교명 입력 (예: 한국대학교)"
                  className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  💡 추후 학교 웹메일을 통해 인증 절차가 진행됩니다.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200 flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-300">
                <span className="text-lg">📢</span>
                <p className="leading-snug">
                  인증을 건너뛰면{" "}
                  <strong className="font-bold underline decoration-yellow-500/50">
                    게시글 작성 및 댓글 달기
                  </strong>
                  가 제한됩니다.
                  <br />
                  (다른 분들의 글을 읽고 좋아요는 가능해요!)
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm text-center font-medium animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            mate 시작하기
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
