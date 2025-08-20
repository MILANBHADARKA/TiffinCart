'use client';
import React from 'react';

function TifinLogo({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8 sm:h-10 sm:w-10',
    large: 'h-12 w-12 sm:h-16 sm:w-16',
    xlarge: 'h-16 w-16 sm:h-20 sm:w-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Tiffin Container Stack */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="tifinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="containerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="lidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#tifinGradient)"
          className="drop-shadow-lg"
        />

        {/* Bottom Tiffin Container */}
        <ellipse
          cx="50"
          cy="70"
          rx="22"
          ry="6"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />
        <rect
          x="28"
          y="60"
          width="44"
          height="12"
          rx="2"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />

        {/* Middle Tiffin Container */}
        <ellipse
          cx="50"
          cy="55"
          rx="20"
          ry="5"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />
        <rect
          x="30"
          y="47"
          width="40"
          height="10"
          rx="2"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />

        {/* Top Tiffin Container */}
        <ellipse
          cx="50"
          cy="42"
          rx="18"
          ry="4"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />
        <rect
          x="32"
          y="36"
          width="36"
          height="8"
          rx="2"
          fill="url(#containerGradient)"
          stroke="#d97706"
          strokeWidth="1"
        />

        {/* Tiffin Lid */}
        <ellipse
          cx="50"
          cy="32"
          rx="20"
          ry="5"
          fill="url(#lidGradient)"
          stroke="#c2410c"
          strokeWidth="1"
        />
        <rect
          x="30"
          y="28"
          width="40"
          height="6"
          rx="3"
          fill="url(#lidGradient)"
          stroke="#c2410c"
          strokeWidth="1"
        />

        {/* Handle */}
        <ellipse
          cx="50"
          cy="25"
          rx="6"
          ry="2"
          fill="none"
          stroke="#92400e"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Steam Effect */}
        <g opacity="0.7">
          <path
            d="M42 22 Q42 18 40 16"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M50 20 Q50 16 48 14"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M58 22 Q58 18 60 16"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Food Elements */}
        <g opacity="0.8">
          {/* Rice grains */}
          <circle cx="45" cy="50" r="1" fill="white" />
          <circle cx="48" cy="52" r="0.8" fill="white" />
          <circle cx="52" cy="49" r="1" fill="white" />
          <circle cx="55" cy="51" r="0.8" fill="white" />
          
          {/* Curry spots */}
          <circle cx="44" cy="65" r="1.5" fill="#dc2626" opacity="0.6" />
          <circle cx="56" cy="63" r="1.2" fill="#dc2626" opacity="0.6" />
          <circle cx="50" cy="67" r="1" fill="#dc2626" opacity="0.6" />
        </g>

        {/* Highlight on lid */}
        <ellipse
          cx="50"
          cy="30"
          rx="15"
          ry="2"
          fill="white"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

export default TifinLogo;
