import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 mt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © 2025 mate. 모든 권리 보유. | <a href="#" className="text-green-600 dark:text-green-400 hover:underline">이용약관</a> | <a href="#" className="text-green-600 dark:text-green-400 hover:underline">개인정보처리방침</a>
      </div>
    </footer>
  );
}

