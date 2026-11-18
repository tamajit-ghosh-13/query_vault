'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThreeJarCanvas from '@/components/ThreeJarCanvas';

export default function CartPage() {
  const router = useRouter();
  const {
    lang,
    cart,
    cartCount,
    cartSubtotal,
    promoCode,
    setPromoCode,
    discountAmount,
    shippingFee,
    cartTotal,
    updateQuantity,
    removeFromCart,
    addToCart,
    runGlobalCurtain,
    showToast
  } = useStore();

  const [promoInput, setPromoInput] = useState(promoCode);
  const titleRef = useRef(null);
  const listRef = useRef(null);
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
    if (listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.12 }
      );
    }
  }, []);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoCode(promoInput);
    if (promoInput.trim().toUpperCase() === 'SICILIA10') {
      showToast('PROMO APPLIED', '10% Sicilian Harvest Discount');
    } else if (promoInput.trim()) {
      showToast('TRY CODE: SICILIA10', 'For 10% off your pantry order');
    }
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

  const freeShippingThreshold = 45;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPct = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  // Suggested pairing products not currently in cart
  const suggestions = AGRUMEA_PRODUCTS.filter(
    (p) => !cart.some((c) => c.productId === p.id)
  ).slice(0, 3);

  return (
    <div className="ec-page-shell">
      <Header />

      <main className="ec-main-container">
        <div className="ec-hero-head compact">
          <span className="ec-eyebrow">
            {lang === 'it' ? 'LA TUA DISPENSA' : 'YOUR PANTRY SELECTION'}
          </span>
          <h1 ref={titleRef} className="ec-display-title">
            <span className="title-line-mask">
              {renderSplitChars(lang === 'it' ? 'IL TUO CARRELLO' : 'PANTRY CART')}
            </span>
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-jar">
              <ThreeJarCanvas
                product={AGRUMEA_PRODUCTS[5]}
                yawAngle={0.2}
                tiltDeg={-6}
                width={240}
                height={300}
                interactive={true}
              />
            </div>
            <h2>{ui.emptyCartTitle}</h2>
            <p>{ui.emptyCartSub}</p>
            <div className="cart-empty-actions">
              <button
                type="button"
                className="ec-primary-btn"
                onClick={() => runGlobalCurtain(() => router.push('/shop'))}
              >
                {lang === 'it' ? 'ESPLORA IL NEGOZIO' : 'BROWSE PANTRY SHOP'}
              </button>
              <button
                type="button"
                className="ec-secondary-btn"
                onClick={() => runGlobalCurtain(() => router.push('/'))}
              >
                {lang === 'it' ? 'TORNA AL CAROSELLO 3D' : 'BACK TO 3D WHEEL'}
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Left: Cart Items */}
            <div className="cart-items-col">
              {/* Free Shipping Progress */}
              <div className="shipping-progress-card">
                <div className="shipping-progress-copy">
                  {remainingForFree === 0 ? (
                    <span>
                      &#x25C6;{' '}
                      {lang === 'it'
                        ? 'Hai sbloccato la spedizione espressa gratuita dalla Sicilia!'
                        : 'You unlocked complimentary Sicily-to-door express shipping!'}
                    </span>
                  ) : (
                    <span>
                      &#x25C6;{' '}
                      {lang === 'it'
                        ? `Aggiungi €${remainingForFree.toFixed(2)} per la spedizione gratuita`
                        : `Add €${remainingForFree.toFixed(2)} more for complimentary shipping`}
                    </span>
                  )}
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="shipping-bar-track">
                  <div className="shipping-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              <div ref={listRef} className="cart-items-list">
                {cart.map((item) => {
                  const copy = item.product[lang];
                  return (
                    <div key={`${item.productId}-${item.weight}`} className="cart-item-row">
                      <div
                        className="cart-item-thumb"
                        onClick={() =>
                          runGlobalCurtain(() => router.push(`/dispensa/${item.product.slug}`))
                        }
                      >
                        <ThreeJarCanvas
                          product={item.product}
                          yawAngle={0.12}
                          tiltDeg={-4}
                          width={120}
                          height={150}
                          interactive={true}
                        />
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-cat">{copy.category.join(' ')}</span>
                        <h3
                          className="cart-item-title"
                          onClick={() =>
                            runGlobalCurtain(() => router.push(`/dispensa/${item.product.slug}`))
                          }
                        >
                          {copy.titleLine1} {copy.titleLine2}
                        </h3>
                        <div className="cart-item-meta">
                          <span className="cart-weight-badge">{item.weight}</span>
                          <span className="cart-unit-price">
                            &euro;{item.unitPrice.toFixed(2)} / jar
                          </span>
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="qty-stepper small">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.weight, -1)}
                          >
                            &minus;
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.productId, item.weight, 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-line-total">&euro;{item.lineTotal.toFixed(2)}</div>

                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.productId, item.weight)}
                        >
                          {lang === 'it' ? 'Rimuovi' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upsell / Pairings Strip */}
              {suggestions.length > 0 && (
                <div className="cart-pairings-box">
                  <span className="ec-eyebrow">
                    {lang === 'it' ? 'ABBINAMENTI CONSIGLIATI' : 'PAIR WITH YOUR PANTRY'}
                  </span>
                  <div className="cart-pairings-grid">
                    {suggestions.map((sug) => (
                      <div key={sug.id} className="cart-pairing-chip">
                        <ThreeJarCanvas
                          product={sug}
                          width={70}
                          height={90}
                          interactive={false}
                        />
                        <div className="cart-pairing-info">
                          <strong>{sug.jarMainTitle}</strong>
                          <span>&euro;{(sug.prices?.['240g'] ?? 9.0).toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          className="other-card-quick-add"
                          onClick={() => addToCart(sug.id, '240g', 1)}
                        >
                          + ADD
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <aside className="cart-summary-card">
              <span className="ec-eyebrow light">
                {lang === 'it' ? 'RIEPILOGO ORDINE' : 'ORDER SUMMARY'} ({cartCount})
              </span>

              <form className="promo-form" onSubmit={handleApplyPromo}>
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (try SICILIA10)"
                  className="promo-input"
                />
                <button type="submit" className="promo-apply-btn">
                  {lang === 'it' ? 'APPLICA' : 'APPLY'}
                </button>
              </form>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>{lang === 'it' ? 'Subtotale' : 'Subtotal'}</span>
                  <span>&euro;{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row discount">
                    <span>Promo (SICILIA10)</span>
                    <span>&minus;&euro;{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>{lang === 'it' ? 'Spedizione' : 'Shipping'}</span>
                  <span>{shippingFee === 0 ? 'FREE' : `€${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>{lang === 'it' ? 'Totale' : 'Total'}</span>
                  <span>&euro;{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="ec-primary-btn full-width"
                onClick={() => runGlobalCurtain(() => router.push('/checkout'))}
              >
                {ui.checkout} &rarr;
              </button>

              <button
                type="button"
                className="ec-ghost-link"
                onClick={() => runGlobalCurtain(() => router.push('/shop'))}
              >
                &larr; {lang === 'it' ? 'Continua gli acquisti' : 'Continue shopping'}
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
