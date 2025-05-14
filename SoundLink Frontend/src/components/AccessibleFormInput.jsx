import React from 'react';

/**
 * AccessibleFormInput - A form input component that ensures proper accessibility
 * 
 * Features:
 * - Enforces labels for screen readers
 * - Adds proper focus styles
 * - Shows error messages in an accessible way
 * - Supports various input types
 */
const AccessibleFormInput = ({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helpText = '',
  ...props
}) => {
  // Generate a unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Error ID for linking error message with input
  const errorId = error ? `${inputId}-error` : undefined;
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label */}
      <label 
        htmlFor={inputId}
        className={`text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-white/90'} ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      
      {/* Input element */}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`
          bg-neutral-900 text-white border rounded px-4 py-2
          focus:outline-none focus:ring-2 
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700 focus:ring-fuchsia-500'}
          disabled:opacity-60 disabled:cursor-not-allowed
          ${inputClassName}
        `}
        {...props}
      />
      
      {/* Error message */}
      {error && (
        <p 
          id={errorId} 
          className={`mt-1 text-sm text-red-500 ${errorClassName}`}
          role="alert"
        >
          {error}
        </p>
      )}
      
      {/* Optional help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-neutral-400">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default AccessibleFormInput; 