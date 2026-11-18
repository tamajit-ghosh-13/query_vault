'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';
import { renderCardFruitPattern } from '@/utils/jarTextureGenerator';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThreeJarCanvas from '@/components/ThreeJarCanvas';

export default function ShopCatalogPage() {
  const router = useRouter();
  const { lang, addToCart, runGlobalCurtain } = useStore();
  const [filter, setFilter] = useState('all');
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  const ui = AGRUMEA_I18N[lang];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char-inner');
      gsap.fromTo(
        chars,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.72, stagger: 0.02, ease: 'power4.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.48, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, [filter]);

  const filteredProducts =
    filter === 'all'
      ? AGRUMEA_PRODUCTS
      : AGRUMEA_PRODUCTS.filter((p) => p.filterCategory === filter);

  const categories = [
    { key: 'all', label: lang === 'it' ? 'TUTTI (8)' : 'ALL PRESERVES (8)' },
    { key: 'jams', label: lang === 'it' ? 'MARMELLATE' : 'MARMALADES & JAMS' },
    { key: 'savory', label: lang === 'it' ? 'CONSERVE SALATE' : 'SAVORY PRESERVES' },
    { key: 'spreads', label: lang === 'it' ? 'CREME SPALMABILI' : 'SWEET SPREADS' }
  ];

  const renderSplitChars = (text) =>
    text.split('').map((ch, idx) => (
      <span
        key={idx}
        className="char-inner"
        style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal' }}
      >
        {ch}
      </span>
    ));

  return (
    <div className="ec-page-shell">
      <Header />

      <main className="ec-main-container">
        <div className="ec-hero-head">
          <span className="ec-eyebrow">DISPENSA SICILIANA</span>
          <h1 ref={titleRef} className="ec-display-title">
            <span className="title-line-mask">
              {renderSplitChars(lang === 'it' ? 'LA NOSTRA' : 'SICILIAN')}
            </span>
            <span className="title-line-mask">
              {renderSplitChars(lang === 'it' ? 'DISPENSA' : 'PANTRY SHOP')}
            </span>
          </h1>
          <p className="ec-hero-sub">
            {lang === 'it'
              ? 'Seleziona il formato e aggiungi i vasetti artigianali al tuo carrello.'
              : 'Select your preferred jar weight and add small-batch Sicilian preserves directly to your basket.'}
          </p>

          <div className="shop-filter-row">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`shop-filter-pill ${filter === cat.key ? 'active' : ''}`}
                onClick={() => setFilter(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={gridRef} className="shop-catalog-grid">
          {filteredProducts.map((prod) => (
            <ShopProductCard
              key={prod.id}
              product={prod}
              lang={lang}
              addLabel={ui.addToCart}
              onAdd={(weight) => addToCart(prod.id, weight, 1)}
              onDiscover={() => runGlobalCurtain(() => router.push(`/dispensa/${prod.slug}`))}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ShopProductCard({ product, lang, addLabel, onAdd, onDiscover }) {
  const bgCanvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [weight, setWeight] = useState(product.weights?.[0] || '240g');
  const copy = product[lang];
  const price = (product.prices?.[weight] ?? 9.0).toFixed(2);

  useEffect(() => {
    if (bgCanvasRef.current) {
      renderCardFruitPattern(bgCanvasRef.current, product);
    }
  }, [product]);

  return (
    <article
      className="shop-product-card"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="shop-card-visual" onClick={onDiscover}>
        <canvas ref={bgCanvasRef} className="other-card-bg-canvas" />
        <div className={`shop-card-jar-wrap ${hovered ? 'is-hovered' : ''}`}>
          <ThreeJarCanvas
            product={product}
            yawAngle={hovered ? -0.25 : 0}
            tiltDeg={hovered ? 6 : 0}
            width={220}
            height={280}
            interactive={true}
          />
        </div>
        <span className="shop-card-discover-tag">DISCOVER &rarr;</span>
      </div>

      <div className="shop-card-body">
        <div className="shop-card-top">
          <div>
            <span className="shop-card-cat">{copy.category.join(' ')}</span>
            <h2 className="shop-card-title" onClick={onDiscover}>
              {copy.titleLine1} {copy.titleLine2}
            </h2>
          </div>
          <span className="shop-card-price">&euro;{price}</span>
        </div>

        <div className="shop-card-controls">
          <div className="shop-card-weights">
            {product.weights.map((w) => (
              <button
                key={w}
                type="button"
                className={`quick-weight-btn dark ${weight === w ? 'active' : ''}`}
                onClick={() => setWeight(w)}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="shop-card-add-btn"
            onClick={() => onAdd(weight)}
          >
            + {addLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
