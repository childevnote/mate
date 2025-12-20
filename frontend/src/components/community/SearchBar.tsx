'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/?search=${encodeURIComponent(keyword)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm mb-6 sm:mb-0">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="관심있는 내용을 검색해보세요..."
        className="w-full py-2.5 pl-4 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
      />
      <button 
        type="submit" 
        className="absolute right-0 top-0 mt-2.5 mr-3 text-gray-400 hover:text-indigo-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}