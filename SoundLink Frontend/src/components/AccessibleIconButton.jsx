import React from 'react';

/**
 * AccessibleIconButton - A button component that ensures proper accessibility for icon buttons
 * 
 * Features:
 * - Enforces aria-label for screen readers
 * - Adds proper focus styles
 * - Ensures keyboard navigation support
 * - Handles click events properly
 */
const AccessibleIconButton = ({
  onClick,
  ariaLabel,
  className = '',
  disabled = false,
  children,
  tooltipText,
  ...props
}) => {
  // Ensure we have an aria-label
  if (!ariaLabel) {
    console.warn('AccessibleIconButton: ariaLabel prop is required for accessibility');
  }
  
  // Create merged className with focus styles if not already provided
  const buttonClassName = `
    ${className}
    ${className.includes('focus:') ? '' : 'focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-50'}
    ${className.includes('transition') ? '' : 'transition-all'}
    rounded-full
  `.trim();
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={buttonClassName}
        tabIndex={0}
        {...props}
      >
        {children}
      </button>
      
      {/* Optional tooltip */}
      {tooltipText && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltipText}
        </span>
      )}
    </div>
  );
};

export default AccessibleIconButton; 