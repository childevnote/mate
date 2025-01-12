import React from 'react';
import { BookOpen, Coffee, Globe, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button"

export function Categories() {
  const categories = [
    { name: '입시', icon: <BookOpen size={16} /> },
    { name: '스터디', icon: <Coffee size={16} /> },
    { name: '정보', icon: <Globe size={16} /> },
    { name: '취업', icon: <Briefcase size={16} /> },
    { name: '시사', icon: <Globe size={16} /> },
    { name: '자유', icon: <Coffee size={16} /> },
  ];

  return (
    <div className="mb-8 flex space-x-4 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category.name}
          variant="outline"
          className="flex items-center space-x-1"
        >
          {category.icon}
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
}

