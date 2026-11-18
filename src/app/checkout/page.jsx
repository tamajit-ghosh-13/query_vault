'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThreeJarCanvas from '@/components/ThreeJarCanvas';
import { AGRUMEA_PRODUCTS } from '@/data/products';

export default function CheckoutPayoutPage() {
  const router = useRouter();
  const {
    lang,
    cart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    user,
    clearCart,
    runGlobalCurtain
  } = useStore();

  const titleRef = useRef(null);
  const card3DRef = useRef(null);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '+39 0931 000 000',
    address: 'Via Etnea, 124',
    city: 'Catania',
    postalCode: '95124',
    country: 'Italy',
    cardNumber: '4532  8910  4421  9018',
    cardHolder: 'MARIO ROSSI',
    expiry: '08/29',
    cvv: '418'
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        cardHolder: (user.name || 'AGRUMEA GUEST').toUpperCase()
      }));
    }
  }, [user]);

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

  const expressFee = shippingMethod === 'express' ? 9.5 : 0;
  const finalTotal = cartTotal + expressFee;

  const handleCardPointerMove = (e) => {
    if (!card3DRef.current) return;
    const rect = card3DRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    gsap.to(card3DRef.current, {
      rotateY: (isCardFlipped ? 180 : 0) + nx * 12,
      rotateX: -ny * 10,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleCardPointerLeave = () => {
    if (!card3DRef.current) return;
    gsap.to(card3DRef.current, {
      rotateY: isCardFlipped ? 180 : 0,
      rotateX: 0,
      duration: 0.45,
      ease: 'power3.out'
    });
  };

  useEffect(() => {
    if (!card3DRef.current) return;
    gsap.to(card3DRef.current, {
      rotateY: isCardFlipped ? 180 : 0,
      duration: 0.55,
      ease: 'power3.inOut'
    });
  }, [isCardFlipped]);

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    const orderNumber = `AGR-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderDone({
      orderNumber,
      total: finalTotal.toFixed(2),
      email: form.email || 'guest@agrumeafarm.it',
      city: form.city,
      itemCount: cart.reduce((s, i) => s + i.quantity, 0)
    });
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="ec-page-shell">
      <Header />

      <main className="ec-main-container">
        <div className="ec-hero-head compact">
          <span className="ec-eyebrow">
            {lang === 'it' ? 'ORDINE SICURO' : 'SICILIAN DISPATCH & PAYOUT'}
          </span>
          <h1 ref={titleRef} className="ec-display-title">
            <span className="title-line-mask">
              {renderSplitChars(
                orderDone
                  ? lang === 'it'
                    ? 'ORDINE CONFERMATO'
                    : 'ORDER CONFIRMED'
                  : lang === 'it'
                  ? 'PAGAMENTO'
                  : 'PAYOUT & DELIVERY'
              )}
            </span>
          </h1>
        </div>

        {orderDone ? (
          <div className="checkout-success-card">
            <div className="checkout-success-jar">
              <ThreeJarCanvas
                product={AGRUMEA_PRODUCTS[4]}
                yawAngle={-0.2}
                tiltDeg={-6}
                width={230}
                height={290}
                interactive={true}
              />
            </div>
            <span className="ec-eyebrow">HARVEST DISPATCH #{orderDone.orderNumber}</span>
            <h2>
              {lang === 'it'
                ? 'Grazie! I tuoi vasetti sono in preparazione a Floridia.'
                : 'Grazie! Your Sicilian pantry order is being prepared in Floridia.'}
            </h2>
            <p>
              Confirmation sent to <strong>{orderDone.email}</strong> &bull; Destination:{' '}
              <strong>{orderDone.city}</strong> &bull; Paid:{' '}
              <strong>&euro;{orderDone.total}</strong>
            </p>
            <div className="cart-empty-actions">
              <button
                type="button"
                className="ec-primary-btn"
                onClick={() => runGlobalCurtain(() => router.push('/'))}
              >
                {lang === 'it' ? 'TORNA ALLA DISPENSA 3D' : 'RETURN TO 3D DISPENSA'}
              </button>
              <button
                type="button"
                className="ec-secondary-btn"
                onClick={() => runGlobalCurtain(() => router.push('/shop'))}
              >
                {lang === 'it' ? 'CONTINUA LO SHOP' : 'EXPLORE MORE JARS'}
              </button>
            </div>
          </div>
        ) : (
          <form className="checkout-layout-grid" onSubmit={handleSubmitOrder}>
            {/* Left Column: Shipping & Payment */}
            <div className="checkout-form-col">
              <section className="checkout-section-block">
                <h2 className="checkout-step-heading">
                  <span>01</span>
                  {lang === 'it' ? 'INDIRIZZO DI CONSEGNA' : 'SHIPPING & CONTACT'}
                </h2>
                <div className="ec-form-grid">
                  <label className="ec-field">
                    <span>Full Name</span>
                    <input
                      required
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Sebastiano Piazza"
                    />
                  </label>
                  <label className="ec-field">
                    <span>Email Address</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@domain.com"
                    />
                  </label>
                  <label className="ec-field full">
                    <span>Street Address</span>
                    <input
                      required
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </label>
                  <label className="ec-field">
                    <span>City</span>
                    <input
                      required
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </label>
                  <label className="ec-field">
                    <span>Postal Code</span>
                    <input
                      required
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section-block">
                <h2 className="checkout-step-heading">
                  <span>02</span>
                  {lang === 'it' ? 'METODO DI SPEDIZIONE' : 'DELIVERY METHOD'}
                </h2>
                <div className="delivery-options-row">
                  <button
                    type="button"
                    className={`delivery-option-card ${shippingMethod === 'standard' ? 'active' : ''}`}
                    onClick={() => setShippingMethod('standard')}
                  >
                    <div>
                      <strong>Standard Sicilian Courier</strong>
                      <span>3–5 business days</span>
                    </div>
                    <span>{shippingFee === 0 ? 'FREE' : `€${shippingFee.toFixed(2)}`}</span>
                  </button>
                  <button
                    type="button"
                    className={`delivery-option-card ${shippingMethod === 'express' ? 'active' : ''}`}
                    onClick={() => setShippingMethod('express')}
                  >
                    <div>
                      <strong>Express Insulated Air</strong>
                      <span>24–48h priority dispatch</span>
                    </div>
                    <span>+&euro;9.50</span>
                  </button>
                </div>
              </section>

              <section className="checkout-section-block">
                <h2 className="checkout-step-heading">
                  <span>03</span>
                  {lang === 'it' ? 'METODO DI PAGAMENTO' : 'PAYOUT METHOD'}
                </h2>

                <div className="payment-tabs">
                  {[
                    { id: 'card', label: 'Credit / Debit Card' },
                    { id: 'express', label: 'Apple Pay / PayPal' },
                    { id: 'cod', label: 'Cash on Delivery' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`shop-filter-pill ${paymentMethod === tab.id ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-payout-wrap">
                    {/* Interactive 3D Perspective Credit Card */}
                    <div
                      className="credit-card-scene"
                      onPointerMove={handleCardPointerMove}
                      onPointerLeave={handleCardPointerLeave}
                    >
                      <div ref={card3DRef} className="credit-card-3d">
                        <div className="credit-card-face front">
                          <div className="cc-top">
                            <span className="cc-brand">AGRUMEA PAY</span>
                            <span className="cc-chip" />
                          </div>
                          <div className="cc-number">{form.cardNumber}</div>
                          <div className="cc-bottom">
                            <div>
                              <small>CARDHOLDER</small>
                              <strong>{form.cardHolder || 'MARIO ROSSI'}</strong>
                            </div>
                            <div>
                              <small>EXPIRES</small>
                              <strong>{form.expiry}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="credit-card-face back">
                          <div className="cc-magstrip" />
                          <div className="cc-cvv-box">
                            <small>CVV</small>
                            <span>{form.cvv}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ec-form-grid">
                      <label className="ec-field full">
                        <span>Card Number</span>
                        <input
                          required
                          type="text"
                          value={form.cardNumber}
                          onFocus={() => setIsCardFlipped(false)}
                          onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                        />
                      </label>
                      <label className="ec-field">
                        <span>Cardholder Name</span>
                        <input
                          required
                          type="text"
                          value={form.cardHolder}
                          onFocus={() => setIsCardFlipped(false)}
                          onChange={(e) =>
                            setForm({ ...form, cardHolder: e.target.value.toUpperCase() })
                          }
                        />
                      </label>
                      <div className="ec-field-split">
                        <label className="ec-field">
                          <span>Expiry</span>
                          <input
                            required
                            type="text"
                            value={form.expiry}
                            onFocus={() => setIsCardFlipped(false)}
                            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                          />
                        </label>
                        <label className="ec-field">
                          <span>CVV</span>
                          <input
                            required
                            type="text"
                            maxLength={4}
                            value={form.cvv}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'express' && (
                  <div className="alt-payment-note">
                    Instant one-tap wallet authorization will simulate upon clicking Complete Payout.
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="alt-payment-note">
                    Pay directly to the Sicilian courier upon delivery in cash or contactless card.
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <aside className="cart-summary-card sticky">
              <span className="ec-eyebrow light">PANTRY ITEMS ({cart.length})</span>
              <div className="checkout-mini-items">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.weight}`} className="checkout-mini-row">
                    <div>
                      <strong>
                        {item.product.jarMainTitle} ({item.weight})
                      </strong>
                      <span>Qty {item.quantity}</span>
                    </div>
                    <span>&euro;{item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>&euro;{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>&minus;&euro;{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {shippingFee + expressFee === 0
                      ? 'FREE'
                      : `€${(shippingFee + expressFee).toFixed(2)}`}
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Total Payout</span>
                  <span>&euro;{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="ec-primary-btn full-width">
                COMPLETE PAYOUT &bull; &euro;{finalTotal.toFixed(2)}
              </button>
            </aside>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
