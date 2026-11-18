'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AGRUMEA_PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import PhysicsPreloader from '@/components/PhysicsPreloader';
import Header from '@/components/Header';
import OrbitalCarousel from '@/components/OrbitalCarousel';
import ProductDetail from '@/components/ProductDetail';

export default function AgrumeaAppPage() {
  const { lang, setLang } = useStore();
  const [view, setView] = useState('home'); // 'home' | 'product'
  const [activeProductId, setActiveProductId] = useState('caponata');
  const [preloaderRunId, setPreloaderRunId] = useState(1);

  const [pillState, setPillState] = useState({ visible: false, text: 'DISCOVER THE PRODUCT' });
  const [previewSlug, setPreviewSlug] = useState(null);

  const cursorPillRef = useRef(null);
  const transitionCurtainRef = useRef(null);
  const transitionTlRef = useRef(null);

  useEffect(() => {
    if (transitionCurtainRef.current) {
      gsap.set(transitionCurtainRef.current, {
        y: 0,
        yPercent: 101,
        autoAlpha: 0,
        pointerEvents: 'none'
      });
    }
    return () => {
      if (transitionTlRef.current) {
        transitionTlRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    const pillEl = cursorPillRef.current;
    if (!pillEl) return;

    const xTo = gsap.quickTo(pillEl, 'left', { duration: 0.14, ease: 'power3.out' });
    const yTo = gsap.quickTo(pillEl, 'top', { duration: 0.14, ease: 'power3.out' });

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const runCurtainTransition = (onMidpoint) => {
    const curtain = transitionCurtainRef.current;
    if (!curtain) {
      onMidpoint();
      return;
    }

    if (transitionTlRef.current) {
      transitionTlRef.current.kill();
    }

    setPillState((prev) => ({ ...prev, visible: false }));
    setPreviewSlug(null);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curtain, {
          y: 0,
          yPercent: 101,
          autoAlpha: 0,
          pointerEvents: 'none'
        });
      }
    });
    transitionTlRef.current = tl;

    gsap.set(curtain, {
      y: 0,
      yPercent: 101,
      autoAlpha: 1,
      pointerEvents: 'all'
    });

    tl.to(curtain, {
      y: 0,
      yPercent: 0,
      duration: 0.48,
      ease: 'power4.inOut',
      onComplete: () => {
        try {
          onMidpoint();
        } catch (err) {
          console.error('Transition midpoint error:', err);
        }
      }
    }).to(curtain, {
      y: 0,
      yPercent: -101,
      duration: 0.48,
      ease: 'power4.inOut',
      delay: 0.08
    });
  };

  const handleDiscoverFromHome = (prodId) => {
    setPillState((prev) => ({ ...prev, visible: false }));
    setPreviewSlug(null);
    setActiveProductId(prodId);
    setView('product');
  };

  const handleSelectProductWithCurtain = (prodId) => {
    runCurtainTransition(() => {
      setActiveProductId(prodId);
      setView('product');
    });
  };

  const handleNavigateHome = () => {
    if (view === 'home') return;
    runCurtainTransition(() => {
      setView('home');
    });
  };

  const activeProduct =
    AGRUMEA_PRODUCTS.find((p) => p.id === activeProductId) || AGRUMEA_PRODUCTS[1];

  const previewUrlString = previewSlug
    ? `${'https://' + 'www.agrumeafarm.it/'}${lang}/dispensa/${previewSlug}`
    : '';

  return (
    <>
      <PhysicsPreloader runTrigger={preloaderRunId} />
      <div ref={transitionCurtainRef} className="transition-curtain" />

      <div
        ref={cursorPillRef}
        className={`cursor-pill ${pillState.visible ? 'visible' : ''}`}
        aria-hidden="true"
      >
        <span className="cursor-pill-diamond">&#x25C6;</span>
        <span className="cursor-pill-text">{pillState.text}</span>
      </div>

      <div className={`url-preview ${previewSlug ? 'visible' : ''}`} aria-hidden="true">
        {previewUrlString}
      </div>

      <Header
        lang={lang}
        onSelectLang={setLang}
        onNavigateHome={handleNavigateHome}
        onSelectProduct={handleSelectProductWithCurtain}
        onReplayPreloader={() => setPreloaderRunId((n) => n + 1)}
      />

      {view === 'home' ? (
        <OrbitalCarousel
          lang={lang}
          initialProductId={activeProductId}
          onDiscoverProduct={handleDiscoverFromHome}
          onHoverPill={(text) => setPillState({ visible: true, text })}
          onLeavePill={() => setPillState((prev) => ({ ...prev, visible: false }))}
          onPreviewUrl={setPreviewSlug}
        />
      ) : (
        <ProductDetail
          product={activeProduct}
          lang={lang}
          onSelectProduct={handleSelectProductWithCurtain}
          onNavigateHome={handleNavigateHome}
          onHoverPill={(text) => setPillState({ visible: true, text })}
          onLeavePill={() => setPillState((prev) => ({ ...prev, visible: false }))}
          onPreviewUrl={setPreviewSlug}
        />
      )}
    </>
  );
}
