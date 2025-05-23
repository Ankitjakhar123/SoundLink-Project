import React from 'react';

const Skeleton = ({ type, className = '' }) => {
  const baseClasses = 'animate-pulse bg-neutral-800 rounded';
  
  switch (type) {
    case 'text':
      return <div className={`${baseClasses} h-4 w-3/4 ${className}`} />;
    case 'title':
      return <div className={`${baseClasses} h-8 w-1/2 ${className}`} />;
    case 'avatar':
      return <div className={`${baseClasses} aspect-square rounded-full ${className}`} />;
    case 'image':
      return <div className={`${baseClasses} aspect-square ${className}`} />;
    case 'card':
      return (
        <div className={`${baseClasses} p-4 ${className}`}>
          <div className="aspect-square bg-neutral-700 rounded mb-3" />
          <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-700 rounded w-1/2" />
        </div>
      );
    case 'artist-card':
      return (
        <div className={`${baseClasses} p-4 ${className}`}>
          <div className="aspect-square bg-neutral-700 rounded-full mb-3" />
          <div className="h-4 bg-neutral-700 rounded w-3/4 mx-auto" />
        </div>
      );
    case 'movie-card':
      return (
        <div className={`${baseClasses} p-4 ${className}`}>
          <div className="aspect-[16/9] bg-neutral-700 rounded mb-3" />
          <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-700 rounded w-1/2" />
        </div>
      );
    default:
      return <div className={`${baseClasses} ${className}`} />;
  }
};

export default Skeleton; 