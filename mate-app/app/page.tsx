"use client"

import React from 'react';
import { Header } from '../components/header';
import { Banner } from '../components/banner';
import { SearchBar } from '../components/searchBar';
import { Categories } from '../components/categories';
import { PostItem } from '../components/postItem';
import { Footer } from '../components/footer';
import { dummyPosts } from '../data/dummyData';
import { useDarkMode } from '@/hooks/useDarkmode';
import { useCategoryFilter } from '@/store/useCategoryFilter';


const MateCommunity: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { selectedCategory } = useCategoryFilter();

  if (darkMode === null) {
    return null;
  }
  const filteredPosts = selectedCategory
  ? dummyPosts.filter((post) => post.category === selectedCategory)
  : dummyPosts; 

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="pt-16">
          <Banner />
        <main className="max-w-6xl mx-auto px-10 py-8">
          <SearchBar />
          <Categories />
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </main>
        <Footer />
        </div>
      </div>
    </div>
  );
};

export default MateCommunity;