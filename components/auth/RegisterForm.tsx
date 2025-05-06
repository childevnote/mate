import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { registerUser, checkUsernameExists, loginWithGoogle } from "@/utils/auth";

interface RegisterFormProps {
  onSuccess: (message: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
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

  // 아이디 중복 확인
  useEffect(() => {
    const checkUsername = async () => {
      if (username && username.length >= 3) {
        setCheckingUsername(true);
        const { exists, error } = await checkUsernameExists(username);
        setUsernameAvailable(!exists);
        setCheckingUsername(false);
      } else {
        setUsernameAvailable(null);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // 유효성 검사
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
  
    if (!passwordValid) {
      setError("비밀번호는 최소 8자 이상이며, 소문자, 대문자, 숫자, 특수문자를 모두 포함해야 합니다.");
      return;
    }

    if (!usernameAvailable) {
      setError("이미 존재하는 아이디입니다.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    // 회원가입 및 사용자 프로필 저장
    const { data, error } = await registerUser(username, password, name);
  
    if (error) {
      setError(error.message || "회원가입 중 오류가 발생했습니다.");
    } else {
      // 폼 초기화
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setUsernameAvailable(null);
      
      // 성공 메시지 전달
      onSuccess("회원가입이 완료되었습니다. 로그인해주세요.");
    }
  
    setLoading(false);
  };
  
  // 구글 회원가입
  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");
    
    const { error } = await loginWithGoogle();
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-sm text-red-600">
            {error}
          </AlertDescription>
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
            className="h-12 rounded-xl border-gray-300 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            아이디
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="아이디 입력 (3자 이상)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className={`h-12 rounded-xl ${
                usernameAvailable === false 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : usernameAvailable === true
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-primary focus:border-primary"
              }`}
            />
            {checkingUsername && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
            {usernameAvailable === true && !checkingUsername && username.length >= 3 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          {usernameAvailable === false && (
            <p className="text-red-500 text-xs mt-2">
              이미 사용 중인 아이디입니다.
            </p>
          )}
          {usernameAvailable === true && username.length >= 3 && (
            <p className="text-green-500 text-xs mt-2">
              사용 가능한 아이디입니다.
            </p>
          )}
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
            className={`h-12 rounded-xl ${!passwordValid && password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"}`}
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
            className={`h-12 rounded-xl ${!passwordMatch && confirmPassword ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-primary focus:border-primary"}`}
          />
          {!passwordMatch && confirmPassword && (
            <p className="text-red-500 text-xs mt-2">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary-sub1 transition-colors" 
          disabled={loading || (!!confirmPassword && !passwordMatch) || (!!password && !passwordValid) || usernameAvailable === false}
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
        onClick={handleGoogleRegister}
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Google로 회원가입
      </Button>
    </div>
  );
}