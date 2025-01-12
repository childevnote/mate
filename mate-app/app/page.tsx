"use client"

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Banner } from '../components/Banner';
import { SearchBar } from '../components/SearchBar';
import { Categories } from '../components/Categories';
import { PostItem } from '../components/PostItem';
import { Footer } from '../components/Footer';
import { dummyPosts } from '../data/dummyData';
import { useDarkMode } from '@/hooks/useDarkmode';

const MateCommunity: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  if (darkMode === null) {
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Banner />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <SearchBar />
          <Categories />
          <div className="space-y-4">
            {dummyPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MateCommunity;