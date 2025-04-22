import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="mb-8 relative">
      <Input
        type="text"
        placeholder="mate에서 정보를 찾아보세요"
        className="w-full pl-12"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    </div>
  );
}

