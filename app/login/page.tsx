"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "../../components/logo";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/utils/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info, CheckCircle2, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const router = useRouter();

  // 비밀번호 유효성 정규식 (최소 8자, 소문자, 대문자, 숫자, 특수문자 포함)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  // 비밀번호 일치 확인
  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    if (password) {
      setPasswordValid(passwordRegex.test(password));
    }
  }, [password]);

  // 이메일 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("이메일 인증을 완료해주세요!");
      } else {
        setError(error.message);
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  // 이메일 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // 비밀번호 유효성 검사
    if (!passwordValid) {
      setError("비밀번호는 최소 8자 이상이며, 소문자, 대문자, 숫자, 특수문자를 모두 포함해야 합니다.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, university },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // 실제로 이메일 확인이 필요한지 확인
      if (data?.user?.identities && data.user.identities.length > 0 && 
          data.user.identities[0].identity_data && 
          !data.user.identities[0].identity_data.email_verified) {
        setVerificationSent(true);
      } else {
        // 이미 인증된 경우나 Supabase 설정에서 이메일 확인을 요구하지 않는 경우
        setError("회원가입이 완료되었습니다. 로그인해주세요.");
        // 로그인 탭으로 전환
        document.querySelector('[value="login"]')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      }
      setLoading(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  // 인증 이메일 재전송
  const resendVerificationEmail = async (): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
    } else {
      setError("인증 이메일이 재전송되었습니다.");
    }
    setLoading(false);
  };

  // 이메일 인증 안내 화면
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
        <Logo className="mb-12" />
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">이메일 인증</h1>
            <p className="text-gray-600">계정을 활성화하기 위해 이메일 인증이 필요합니다.</p>
          </div>
          
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <AlertDescription className="text-sm text-gray-700">
                <span className="font-medium block mb-1">{email}</span>
                <span>으로 인증 메일을 보냈습니다. 이메일에 있는 링크를 클릭하여 계정 인증을 완료해주세요.</span>
              </AlertDescription>
            </div>
          </Alert>
          
          <div className="space-y-4">
            <Button 
              className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600" 
              onClick={resendVerificationEmail}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              인증 이메일 재전송
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-gray-300 hover:bg-gray-50"
              onClick={() => setVerificationSent(false)}
            >
              로그인 화면으로 돌아가기
            </Button>
          </div>
          
          {error && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertDescription className="text-sm text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <Logo className="mb-12" />
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="login" 
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              로그인
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              회원가입
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-6">
            {error && error.includes("이메일 인증") && (
              <Alert className="bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <AlertDescription className="text-sm text-blue-700">
                    {error}
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            {error && !error.includes("이메일 인증") && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-sm text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  이메일
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  비밀번호
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                로그인
              </Button>
            </form>
            
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-gray-400 text-sm">또는</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Google로 로그인
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-6">
            {error && (
              <Alert className={error.includes("회원가입이 완료") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <div className="flex items-center">
                  {error.includes("회원가입이 완료") ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> : 
                    null
                  }
                  <AlertDescription className={error.includes("회원가입이 완료") ? "text-sm text-green-700" : "text-sm text-red-600"}>
                    {error}
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  이름
                </label>
                <Input
                  type="text"
                  placeholder="이름 입력"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  이메일
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  비밀번호
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`h-12 rounded-xl ${!passwordValid && password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {!passwordValid && password && (
                  <p className="text-red-500 text-xs mt-2">
                    비밀번호는 최소 8자 이상이며, 소문자, 대문자, 숫자, 특수문자를 모두 포함해야 합니다.
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  비밀번호 확인
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`h-12 rounded-xl ${!passwordMatch && confirmPassword ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {!passwordMatch && confirmPassword && (
                  <p className="text-red-500 text-xs mt-2">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors" 
                disabled={loading || (!!confirmPassword && !passwordMatch) || (!!password && !passwordValid)}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                회원가입
              </Button>
            </form>
            
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-gray-400 text-sm">또는</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Google로 회원가입
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}