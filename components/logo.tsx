import React from 'react';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-extrabold text-4xl ${className}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <span className="text-primary">m</span>ate
    </h1>
  );
}

