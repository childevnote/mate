import React from 'react';
import { GraduationCap, Coffee, Info, Briefcase, Newspaper, Users } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { useCategoryFilter } from '@/store/useCategoryFilter';

export function Categories() {
  const { selectedCategory, setSelectedCategory } = useCategoryFilter();

  const categories = [
    { name: '전체', icon: null },
    { name: '입시', icon: <GraduationCap size={16} /> },
    { name: '스터디', icon: <Coffee size={16} /> },      
    { name: '정보', icon: <Info size={16} /> },          
    { name: '취업', icon: <Briefcase size={16} /> },     
    { name: '시사', icon: <Newspaper size={16} /> },     
    { name: '자유', icon: <Users size={16} /> },         
  ];

  return (
    <div className="mb-8 flex space-x-4 overflow-x-auto pb-2">
      {categories.map((category) => (
         <Button
         key={category.name}
         variant={selectedCategory === category.name || (category.name === '전체' && !selectedCategory) ? 'default' : 'outline'}
         className="flex items-center space-x-1"
         onClick={() => setSelectedCategory(category.name === '전체' ? null : category.name)}
       >
         {category.icon && category.icon}
         <span>{category.name}</span>
       </Button>
      ))}
    </div>
  );
}

