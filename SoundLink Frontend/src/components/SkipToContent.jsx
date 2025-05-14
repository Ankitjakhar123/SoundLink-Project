import React from 'react';

/**
 * SkipToContent - A component that provides a skip link for keyboard users
 * to bypass navigation and go directly to main content
 */
const SkipToContent = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.tabIndex = -1;
          mainContent.focus();
        }
      }}
    >
      Skip to content
    </a>
  );
};

export default SkipToContent; 