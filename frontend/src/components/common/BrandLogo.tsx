import { useId } from 'react';

interface BrandLogoProps {
  size?: number;
}

const BrandLogo = ({ size = 28 }: BrandLogoProps) => {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="KnowFlow"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M11 9h3v5.2l4.8-5.2h3.7l-5.4 5.8L23 23h-3.8l-4.2-5.9-1 .9V23h-3V9z"
        fill="#ffffff"
      />
    </svg>
  );
};

export default BrandLogo;
