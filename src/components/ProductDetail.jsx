'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';
import { renderCardFruitPattern, renderGallerySceneBackdrop } from '@/utils/jarTextureGenerator';
import { useStore } from '@/context/StoreContext';
import ThreeJarCanvas from './ThreeJarCanvas';
import Footer from './Footer';

export default function ProductDetail({
  product,
  lang,
  onSelectProduct,
  onNavigateHome,
  onHoverPill,
  onLeavePill,
  onPreviewUrl
}) {
  const { addToCart } = useStore();
  const heroTitleWrapRef = useRef(null);
  const metaLeftRef = useRef(null);
  const metaRightRef = useRef(null);
  const jarStageRef = useRef(null);
  const galleryTrackRef = useRef(null);

  const [selectedWeight, setSelectedWeight] = useState('240g');
  const [quantity, setQuantity] = useState(1);

  const [scrollState, setScrollState] = useState({
    yaw: -0.35,
    tilt: 0,
    yOffset: 105,
    scale: 1.24
  });

  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    currentX: 0,
    targetX: 0
  });

  const ui = AGRUMEA_I18N[lang];
  const copy = product[lang];

  useEffect(() => {
    setSelectedWeight(product.weights?.[0] || '240g');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
    dragStateRef.current.targetX = 0;
    if (galleryTrackRef.current) {
      gsap.set(galleryTrackRef.current, { x: 0 });
    }

    if (heroTitleWrapRef.current) {
      const chars = heroTitleWrapRef.current.querySelectorAll('.char-inner');
      gsap.fromTo(
        chars,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 0.76,
          stagger: 0.022,
          ease: 'power4.out'
        }
      );
    }

    if (metaLeftRef.current && metaRightRef.current) {
      gsap.fromTo(
        [metaLeftRef.current, metaRightRef.current],
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          delay: 0.18,
          stagger: 0.08,
          ease: 'power3.out'
        }
      );
    }
  }, [product.id, lang]);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY || window.pageYOffset;
      const p = Math.min(1, Math.max(0, sy / 400));

      const yOffset = 105 - p * 220;
      const scale = 1.24 - p * 0.36;
      const tilt = -p * 16.5;
      const yaw = -0.35 - p * (Math.PI * 2 - 0.35);

      setScrollState({ yaw, tilt, yOffset, scale });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [product.id]);

  const preferredIds = ['arance-fette', 'gelsi-neri', 'pere-cannella', 'smeralda', 'fragole-bacche'];
  const otherProducts = [];
  preferredIds.forEach((id) => {
    if (id !== product.id && otherProducts.length < 4) {
      const found = AGRUMEA_PRODUCTS.find((p) => p.id === id);
      if (found) otherProducts.push(found);
    }
  });

  const onGalleryPointerDown = (e) => {
    dragStateRef.current.isDown = true;
    dragStateRef.current.startX = e.clientX - dragStateRef.current.targetX;
  };

  const onGalleryPointerMove = (e) => {
    if (!dragStateRef.current.isDown || !galleryTrackRef.current) return;
    const maxScroll = Math.max(0, galleryTrackRef.current.scrollWidth - window.innerWidth + 140);
    const rawX = e.clientX - dragStateRef.current.startX;
    const clampedX = Math.max(-maxScroll, Math.min(60, rawX));
    dragStateRef.current.targetX = clampedX;

    gsap.to(galleryTrackRef.current, {
      x: clampedX,
      duration: 0.42,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const onGalleryPointerUp = () => {
    dragStateRef.current.isDown = false;
    if (!galleryTrackRef.current) return;
    const maxScroll = Math.max(0, galleryTrackRef.current.scrollWidth - window.innerWidth + 100);
    if (dragStateRef.current.targetX > 0) dragStateRef.current.targetX = 0;
    if (dragStateRef.current.targetX < -maxScroll) dragStateRef.current.targetX = -maxScroll;

    gsap.to(galleryTrackRef.current, {
      x: dragStateRef.current.targetX,
      duration: 0.55,
      ease: 'power3.out'
    });
  };

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

  const unitPrice = product.prices?.[selectedWeight] ?? 9.0;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  return (
    <section className="product-view active-view revealed">
      {/* Hero Section */}
      <div className="product-hero">
        <div ref={heroTitleWrapRef} className="product-hero-title-wrap">
          <h1 className="product-hero-title">
            <span className="title-line-mask">{renderSplitChars(copy.titleLine1)}</span>
            <span className="title-line-mask">{renderSplitChars(copy.titleLine2)}</span>
          </h1>
        </div>

        <div className="product-hero-meta-row">
          <div ref={metaLeftRef} className="hero-meta-left">
            {copy.category[0]}
            <br />
            {copy.category[1]}
          </div>
          <div ref={metaRightRef} className="hero-meta-right">
            {copy.origin[0]}
            <br />
            {copy.origin[1]}
          </div>
        </div>

        {/* Scroll-linked Floating & Tilting 3D Three.js Jar */}
        <div ref={jarStageRef} className="detail-floating-jar-stage">
          <div
            className="detail-jar-transform"
            style={{
              transform: `translate3d(0, ${scrollState.yOffset.toFixed(1)}px, 0) scale(${scrollState.scale.toFixed(3)})`,
              pointerEvents: 'auto'
            }}
          >
            <ThreeJarCanvas
              product={product}
              yawAngle={scrollState.yaw}
              tiltDeg={scrollState.tilt}
              width={400}
              height={520}
              interactive={true}
            />
          </div>
        </div>
      </div>

      {/* Description & Ingredients Block */}
      <div className="product-description-section">
        <div className="diamond-sep">&#x25C6;</div>
        <p className="product-lead-copy">
          {copy.description} {copy.ingredients}
        </p>

        {/* Interactive Purchase Bar */}
        <div className="product-purchase-bar">
          <div className="purchase-weights-group">
            {product.weights.map((w) => (
              <button
                key={w}
                type="button"
                className={`purchase-weight-pill ${selectedWeight === w ? 'active' : ''}`}
                onClick={() => setSelectedWeight(w)}
              >
                {w} — &euro;{(product.prices?.[w] ?? 9.0).toFixed(2)}
              </button>
            ))}
          </div>

          <div className="purchase-actions-row">
            <div className="qty-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                &minus;
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="primary-add-cart-btn"
              onClick={() => addToCart(product.id, selectedWeight, quantity)}
            >
              <span>{ui.addToCart}</span>
              <span className="btn-price-sep">&bull;</span>
              <span>&euro;{totalPrice}</span>
            </button>
          </div>
        </div>

        <div className="diamond-sep">&#x25C6;</div>
      </div>

      {/* 3-Column Specifications Table */}
      <div className="product-specs-container">
        <div className="product-specs-grid">
          <div className="spec-col spec-col-tips">
            <h3 className="spec-heading">{ui.usefulTips}</h3>
            <p className="spec-body">{copy.tips}</p>
          </div>
          <div className="spec-col spec-col-weights">
            <h3 className="spec-heading">{ui.availableWeights}</h3>
            <div className="weights-badges">
              {product.weights.map((w) => (
                <span key={w} className="weight-circle">
                  {w}
                </span>
              ))}
            </div>
          </div>
          <div className="spec-col spec-col-shelf">
            <h3 className="spec-heading">{ui.shelfLife}</h3>
            <p className="spec-body spec-shelf-value">{product.shelfLife[lang]}</p>
          </div>
        </div>
      </div>

      {/* Horizontal Draggable Studio Gallery */}
      <div className="gallery-section">
        <div
          className="gallery-track-Viewport"
          onMouseEnter={() => onHoverPill(ui.drag)}
          onMouseLeave={() => {
            onGalleryPointerUp();
            onLeavePill();
          }}
          onPointerDown={onGalleryPointerDown}
          onPointerMove={onGalleryPointerMove}
          onPointerUp={onGalleryPointerUp}
        >
          <div ref={galleryTrackRef} className="gallery-track">
            {[0, 1, 2].map((sceneIdx) => (
              <div key={sceneIdx} className="gallery-slide">
                <GallerySceneSlide product={product} sceneIndex={sceneIdx} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THE OTHER PRODUCTS 4-Card Interactive Grid */}
      <div className="other-products-section">
        <h2 className="other-products-title">
          {ui.theOtherProductsLine1}
          <br />
          {ui.theOtherProductsLine2}
        </h2>
        <div className="other-products-grid">
          {otherProducts.map((otherProd) => (
            <OtherProductCard
              key={otherProd.id}
              product={otherProd}
              discoverLabel={ui.discoverProduct}
              addLabel={ui.addToCart}
              onHoverPill={onHoverPill}
              onLeavePill={onLeavePill}
              onPreviewUrl={onPreviewUrl}
              onAdd={() => addToCart(otherProd.id, '240g', 1)}
              onSelect={() => onSelectProduct(otherProd.id)}
            />
          ))}
        </div>
      </div>

      <Footer onNavigateHome={onNavigateHome} />
    </section>
  );
}

function GallerySceneSlide({ product, sceneIndex }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderGallerySceneBackdrop(canvasRef.current, product, sceneIndex);
    }
  }, [product, sceneIndex]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: sceneIndex === 0 ? '#1C1624' : sceneIndex === 1 ? '#291D15' : '#6A0E15'
      }}
    >
      <canvas
        ref={canvasRef}
        width={920}
        height={580}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <ThreeJarCanvas
          product={product}
          yawAngle={sceneIndex === 0 ? 0.12 : sceneIndex === 1 ? -0.1 : 0}
          tiltDeg={sceneIndex === 2 ? -4 : 0}
          width={260}
          height={340}
          interactive={false}
        />
      </div>
    </div>
  );
}

function OtherProductCard({
  product,
  discoverLabel,
  onHoverPill,
  onLeavePill,
  onPreviewUrl,
  onAdd,
  onSelect
}) {
  const bgCanvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (bgCanvasRef.current) {
      renderCardFruitPattern(bgCanvasRef.current, product);
    }
  }, [product]);

  return (
    <div
      className="other-product-card"
      onPointerEnter={() => {
        setHovered(true);
        onHoverPill(discoverLabel);
        onPreviewUrl(product.slug);
      }}
      onPointerLeave={() => {
        setHovered(false);
        onLeavePill();
        onPreviewUrl(null);
      }}
      onClick={onSelect}
    >
      <canvas ref={bgCanvasRef} className="other-card-bg-canvas" />
      <div className={`other-card-jar-wrap ${hovered ? 'is-hovered' : ''}`}>
        <ThreeJarCanvas
          product={product}
          yawAngle={hovered ? -0.22 : 0}
          tiltDeg={hovered ? 7 : 0}
          width={225}
          height={295}
          interactive={true}
        />
      </div>

      <div className="other-card-bottom-bar" onClick={(e) => e.stopPropagation()}>
        <span className="other-card-price">&euro;{(product.prices?.['240g'] ?? 9.0).toFixed(2)}</span>
        <button
          type="button"
          className="other-card-quick-add"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          + ADD
        </button>
      </div>
    </div>
  );
}
