import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { applySafeAreaInsets } from '../utils/deviceUtils';

/**
 * SafeAreaView component that automatically applies safe area insets
 * This is useful for components that need to respect device notches or cutouts
 */
const SafeAreaView = ({
  children,
  top = true,
  right = true,
  bottom = true,
  left = true,
  className = '',
  style = {},
  ...props
}) => {
  const containerRef = useRef(null);

  // Apply safe area insets when component mounts
  useEffect(() => {
    if (containerRef.current) {
      applySafeAreaInsets(containerRef.current, { top, right, bottom, left });
    }
  }, [top, right, bottom, left]);

  // Combine class names
  const safeAreaClasses = [
    className || '',
    top ? 'pt-safe' : '',
    right ? 'pr-safe' : '',
    bottom ? 'pb-safe' : '',
    left ? 'pl-safe' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={safeAreaClasses}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

SafeAreaView.propTypes = {
  children: PropTypes.node,
  top: PropTypes.bool,
  right: PropTypes.bool,
  bottom: PropTypes.bool,
  left: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default SafeAreaView; 