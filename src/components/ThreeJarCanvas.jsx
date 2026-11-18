'use client';

import React from 'react';
import { AGRUMEA_PRODUCTS } from '@/data/products';

/**
 * Static Jar Presentation Component
 * Renders an artisanal Italian preserve jar using clean SVG & CSS.
 * Provides high visual fidelity with zero WebGL overhead or 3D dependencies.
 */
export default function ThreeJarCanvas({
  productId = 'gelsi-neri',
  tiltDeg = 0,
  scale = 1,
  className = '',
  style = {}
}) {
  const product =
    AGRUMEA_PRODUCTS.find((p) => p.id === productId) || AGRUMEA_PRODUCTS[0];

  const {
    labelBg = '#1E1118',
    labelTextColor = '#FAF4EA',
    jarContentsColor = '#24101A',
    jarContentsHighlight = '#4A1D34',
    jarCategoryLine = 'CONFETTURA EXTRA',
    jarMainTitle = 'GELSI NERI',
    jarSubTitle = 'di Sicilia',
    jarBadge = 'Bio'
  } = product;

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        transform: `rotate(${tiltDeg}deg) scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style
      }}
    >
      <svg
        viewBox="0 0 280 420"
        className="w-full h-full max-h-[460px] drop-shadow-[0_22px_35px_rgba(0,0,0,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glass Jar Body Gradient */}
          <linearGradient id={`jar-fill-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={jarContentsColor} stopOpacity="0.95" />
            <stop offset="25%" stopColor={jarContentsHighlight} stopOpacity="1" />
            <stop offset="50%" stopColor={jarContentsColor} stopOpacity="0.92" />
            <stop offset="75%" stopColor={jarContentsHighlight} stopOpacity="0.98" />
            <stop offset="100%" stopColor={jarContentsColor} stopOpacity="0.95" />
          </linearGradient>

          {/* Glass Surface Specular Reflection */}
          <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          {/* Brushed Metal Lid Gradient */}
          <linearGradient id="lid-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8E9297" />
            <stop offset="15%" stopColor="#CFD3D8" />
            <stop offset="35%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#C2C6CB" />
            <stop offset="70%" stopColor="#E4E8EC" />
            <stop offset="85%" stopColor="#AEB2B7" />
            <stop offset="100%" stopColor="#8E9297" />
          </linearGradient>

          {/* Label Gradient */}
          <linearGradient id={`label-grad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={labelBg} stopOpacity="0.98" />
            <stop offset="50%" stopColor={labelBg} stopOpacity="1" />
            <stop offset="100%" stopColor={labelBg} stopOpacity="0.98" />
          </linearGradient>
        </defs>

        {/* --- 1. JAR SHADOW (Base) --- */}
        <ellipse cx="140" cy="402" rx="90" ry="14" fill="#000000" fillOpacity="0.28" filter="blur(4px)" />

        {/* --- 2. GLASS JAR BODY (Fill) --- */}
        {/* Main Jar Outline: Neck from y=60 to y=80, Shoulder flares to x=25..255, Base rounds at y=390 */}
        <path
          d="M 68 64
             C 68 55, 212 55, 212 64
             L 212 78
             C 212 88, 248 108, 252 140
             L 252 360
             C 252 388, 228 395, 140 395
             C 52 395, 28 388, 28 360
             L 28 140
             C 32 108, 68 88, 68 78
             Z"
          fill={`url(#jar-fill-${product.id})`}
        />

        {/* --- 3. PRODUCT LABEL (Wrap) --- */}
        <rect
          x="34"
          y="150"
          width="212"
          height="180"
          rx="6"
          fill={`url(#label-grad-${product.id})`}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        {/* Label Top Gold Accent Line */}
        <line x1="48" y1="165" x2="232" y2="165" stroke="#C4A052" strokeWidth="1" strokeOpacity="0.75" />

        {/* Label Content */}
        <text
          x="140"
          y="185"
          textAnchor="middle"
          fill={labelTextColor}
          fillOpacity="0.8"
          fontSize="9"
          fontWeight="600"
          letterSpacing="2"
          fontFamily="system-ui, sans-serif"
        >
          {jarCategoryLine}
        </text>

        <text
          x="140"
          y="222"
          textAnchor="middle"
          fill={labelTextColor}
          fontSize="22"
          fontWeight="800"
          letterSpacing="1.5"
          fontFamily="Georgia, serif"
        >
          {jarMainTitle}
        </text>

        <text
          x="140"
          y="245"
          textAnchor="middle"
          fill={labelTextColor}
          fillOpacity="0.85"
          fontSize="12"
          fontStyle="italic"
          letterSpacing="1"
          fontFamily="Georgia, serif"
        >
          {jarSubTitle}
        </text>

        {/* Badge (Bio / Artisanal) */}
        {jarBadge && (
          <g transform="translate(140, 276)">
            <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#C4A052" fillOpacity="0.2" stroke="#C4A052" strokeWidth="0.8" />
            <text x="0" y="4" textAnchor="middle" fill="#E8C87A" fontSize="9" fontWeight="700" letterSpacing="1" fontFamily="system-ui, sans-serif">
              {jarBadge.toUpperCase()}
            </text>
          </g>
        )}

        {/* Weight & Origin footer on label */}
        <text
          x="140"
          y="312"
          textAnchor="middle"
          fill={labelTextColor}
          fillOpacity="0.7"
          fontSize="9"
          letterSpacing="1.5"
          fontFamily="system-ui, sans-serif"
        >
          240g &middot; PRODOTTO IN SICILIA
        </text>

        {/* Label Bottom Gold Accent Line */}
        <line x1="48" y1="322" x2="232" y2="322" stroke="#C4A052" strokeWidth="1" strokeOpacity="0.75" />

        {/* --- 4. GLASS SPECULAR OVERLAY --- */}
        <path
          d="M 68 64
             C 68 55, 212 55, 212 64
             L 212 78
             C 212 88, 248 108, 252 140
             L 252 360
             C 252 388, 228 395, 140 395
             C 52 395, 28 388, 28 360
             L 28 140
             C 32 108, 68 88, 68 78
             Z"
          fill="url(#glass-specular)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Left Vertical Soft Glare Strip */}
        <path
          d="M 38 120 L 38 370"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="blur(1px)"
        />

        {/* --- 5. BRUSHED METAL LID (`Capsula`) --- */}
        {/* Lid Skirt */}
        <rect x="62" y="24" width="156" height="38" rx="4" fill="url(#lid-metal)" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        
        {/* Lid Top Chamfer */}
        <rect x="65" y="20" width="150" height="8" rx="3" fill="#DCE1E6" />
        
        {/* Embossed Ring Grip Lines */}
        <line x1="64" y1="32" x2="216" y2="32" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <line x1="64" y1="42" x2="216" y2="42" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        <line x1="64" y1="52" x2="216" y2="52" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </svg>
    </div>
  );
}
