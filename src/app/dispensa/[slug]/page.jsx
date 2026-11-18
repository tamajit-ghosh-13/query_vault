'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { AGRUMEA_PRODUCTS } from '@/data/products';
import Header from '@/components/Header';
import ProductDetail from '@/components/ProductDetail';

export default function DispensaProductRoute() {
  const params = useParams();
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [pillState, setPillState] = useState({ visible: false, text: 'DISCOVER THE PRODUCT' });
  const [previewSlug, setPreviewSlug] = useState(null);
  const cursorPillRef = useRef(null);

  const slug = params?.slug || 'gelsi-neri';
  const product = AGRUMEA_PRODUCTS.find((p) => p.slug === slug) || AGRUMEA_PRODUCTS[5];

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

  const previewUrlString = previewSlug
    ? `${'https://' + 'www.agrumeafarm.it/'}${lang}/dispensa/${previewSlug}`
    : '';

  return (
    <>
      <div
        ref={cursorPillRef}
        className={`cursor-pill ${pillState.visible ? 'visible' : ''}`}
        aria-hidden="true"
      >
        <span className="cursor-pill-dot" />
        <span className="cursor-pill-text">{pillState.text}</span>
      </div>

      <div className={`url-preview ${previewSlug ? 'visible' : ''}`} aria-hidden="true">
        {previewUrlString}
      </div>

      <Header
        lang={lang}
        onSelectLang={setLang}
        onNavigateHome={() => router.push('/')}
        onSelectProduct={(prodId) => router.push(`/dispensa/${prodId}`)}
        onReplayPreloader={() => router.push('/')}
      />
      <ProductDetail
        product={product}
        lang={lang}
        onSelectProduct={(prodId) => router.push(`/dispensa/${prodId}`)}
        onNavigateHome={() => router.push('/')}
        onHoverPill={(text) => setPillState({ visible: true, text })}
        onLeavePill={() => setPillState((prev) => ({ ...prev, visible: false }))}
        onPreviewUrl={setPreviewSlug}
      />
    </>
  );
}
