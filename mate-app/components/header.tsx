import React from "react";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { Bell, User, Moon, Sun } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const isVisible = useScrollHeader();
  const user = useSupabaseUser();

  return (
    <header
      className={`bg-white dark:bg-gray-900 
    fixed top-0 left-0 right-0 z-50
    transform transition-transform duration-300 ease-in-out
    ${isVisible ? "translate-y-0" : "-translate-y-full"}
  `}
    >
      <div className="max-w-6xl mx-auto px-10 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-4">
          {/* 로그인/회원가입 버튼: 로그인 안 했을 때만 표시 */}
          {!user && (
            <Link href="/login">
              <Button
                variant="outline"
                className="text-gray-800 dark:text-gray-200"
              >
                로그인 / 회원가입
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-gray-800 dark:text-gray-200"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-800 dark:text-gray-200"
          >
            <Bell size={20} />
          </Button>
          {/* 마이페이지(User) 아이콘: 로그인 했을 때만 표시 */}
          {user && (
            <Link href="/mypage">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-800 dark:text-gray-200"
              >
                <User size={20} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
