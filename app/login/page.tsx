"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleRegisterSuccess = (message: string) => {
    setSuccessMessage(message);
    setTab("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-sub3 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            환영합니다.
          </h2>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary-sub1 via-primary-sub2 to-primary-sub3 text-transparent bg-clip-text drop-shadow-md">
            Mate
          </h1>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Tabs value={tab} onValueChange={(val) => setTab(val as "login" | "register")} className="w-full">
            

            <TabsContent value="login">
              <LoginForm initialSuccessMessage={successMessage} />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="font-medium text-primary-sub1 hover:text-primary transition-colors"
                  >
                    회원가입
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onSuccess={handleRegisterSuccess} />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="font-medium text-primary-sub1 hover:text-primary transition-colors"
                  >
                    로그인
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 메이트. 모든 권리 보유.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/help" className="text-xs text-gray-500 hover:text-primary transition-colors">
              고객센터
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
