'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Editorial Page Preloader
 * High-performance Next.js page reveal with animated typography counter (0% -> 100%)
 * and smooth curtain wipe. Zero heavy physics engine overhead.
 */
export default function PhysicsPreloader({ runTrigger = 0, onComplete }) {
  const curtainRef = useRef(null);
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    setPercent(0);

    const curtain = curtainRef.current;
    if (!curtain) return;

    // Reset curtain position
    gsap.set(curtain, { yPercent: 0, autoAlpha: 1 });

    const obj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        if (onComplete) onComplete();
      }
    });

    // 1. Counter tween (0 -> 100)
    tl.to(obj, {
      val: 100,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => setPercent(Math.floor(obj.val))
    });

    // 2. Short pause at 100%
    tl.to({}, { duration: 0.15 });

    // 3. Smooth upward curtain reveal
    tl.to(curtain, {
      yPercent: -100,
      duration: 0.75,
      ease: 'expo.inOut'
    });

    return () => {
      tl.kill();
    };
  }, [runTrigger, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#C85028] text-[#FAF4EA] px-8 py-12 pointer-events-auto select-none"
    >
      {/* Top Brand Header */}
      <div className="w-full max-w-6xl flex items-center justify-between text-xs tracking-[0.25em] uppercase font-semibold text-[#FAF4EA]/80">
        <span>Agrumea Farm</span>
        <span>Dispensa Siciliana</span>
      </div>

      {/* Center Counter */}
      <div className="flex flex-col items-center justify-center text-center">
        <span className="font-serif italic text-lg text-[#FAF4EA]/75 tracking-wider mb-2">
          Caricamento
        </span>
        <div className="font-mono text-8xl md:text-9xl font-bold tracking-tight">
          {percent}%
        </div>
        <div className="w-48 h-[2px] bg-white/20 mt-6 overflow-hidden rounded-full">
          <div
            className="h-full bg-white transition-all duration-75 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="w-full max-w-6xl flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-[#FAF4EA]/60">
        <span>Artisanal Conserves</span>
        <span>Made in Sicily &middot; Italy</span>
      </div>
    </div>
  );
}
