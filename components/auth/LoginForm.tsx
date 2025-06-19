import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { loginUser, loginWithGoogle } from "@/utils/auth";

interface LoginFormProps {
  onSuccess?: (message: string) => void;
  initialSuccessMessage?: string;
}

export default function LoginForm({ onSuccess, initialSuccessMessage }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(initialSuccessMessage || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    const { data, error } = await loginUser(username, password);
  
    if (error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/");
    }
  
    setLoading(false);
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google 로그인 에러:", err);
    }
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
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <AlertDescription className="text-sm text-green-700">
              {success}
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            아이디
          </label>
          <Input
            type="text"
            placeholder="아이디 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-12 rounded-xl border-gray-300 focus:ring-primary focus:border-primary"
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
            className="h-12 rounded-xl border-gray-300 focus:ring-primary focus:border-primary"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary-sub1 transition-colors" 
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
    </div>
  );
}