import React from 'react';
import { Bell, User, Moon, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from "@/components/ui/button"

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-800 dark:text-gray-200">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-800 dark:text-gray-200">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-800 dark:text-gray-200">
            <User size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}

