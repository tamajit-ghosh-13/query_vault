'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { AGRUMEA_PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThreeJarCanvas from '@/components/ThreeJarCanvas';

export default function LoginSignUpPage() {
  const router = useRouter();
  const { lang, user, loginUser, logoutUser, runGlobalCurtain, showToast } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const formCardRef = useRef(null);
  const titleRef = useRef(null);

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
  }, [mode, user]);

  useEffect(() => {
    if (formCardRef.current) {
      gsap.fromTo(
        formCardRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      name: mode === 'signup' ? form.name : form.email.split('@')[0],
      email: form.email
    });
    showToast(
      mode === 'signup' ? 'WELCOME TO AGRUMEA' : 'SIGNED IN',
      form.email
    );
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
        <div className="auth-split-grid">
          {/* Left Burgundy Showcase Panel */}
          <div className="auth-visual-panel">
            <span className="ec-eyebrow light">AGRUMEA FARM CLUB</span>
            <h2 className="auth-visual-heading">
              WE PRESERVE
              <br />
              <em>WE GROW</em>
            </h2>
            <p className="auth-visual-copy">
              Access seasonal Sicilian micro-batches, save your pantry favorites, and track
              cold-packed harvests from Floridia.
            </p>
            <div className="auth-jar-stage">
              <ThreeJarCanvas
                product={mode === 'login' ? AGRUMEA_PRODUCTS[5] : AGRUMEA_PRODUCTS[4]}
                yawAngle={mode === 'login' ? 0.15 : -0.2}
                tiltDeg={-6}
                width={260}
                height={330}
                interactive={true}
              />
            </div>
          </div>

          {/* Right Cream Form / Member Profile Panel */}
          <div className="auth-form-panel">
            {user ? (
              <div className="member-profile-box">
                <span className="ec-eyebrow">AUTHENTICATED MEMBER</span>
                <h1 ref={titleRef} className="ec-display-title left small">
                  <span className="title-line-mask">{renderSplitChars(user.name.toUpperCase())}</span>
                </h1>
                <p className="member-email">{user.email}</p>

                <div className="member-info-grid">
                  <div className="member-info-card">
                    <span className="spec-heading">SAVED ADDRESS</span>
                    <p>Via Etnea 124, 95124 Catania (CT), Sicily</p>
                  </div>
                  <div className="member-info-card">
                    <span className="spec-heading">RECENT HARVEST ORDER</span>
                    <p>#AGR-482910 &bull; 3 Jars &bull; Delivered</p>
                  </div>
                </div>

                <div className="cart-empty-actions left">
                  <button
                    type="button"
                    className="ec-primary-btn"
                    onClick={() => runGlobalCurtain(() => router.push('/shop'))}
                  >
                    BROWSE PANTRY SHOP
                  </button>
                  <button
                    type="button"
                    className="ec-secondary-btn"
                    onClick={() => {
                      logoutUser();
                      showToast('SIGNED OUT', 'See you next harvest');
                    }}
                  >
                    SIGN OUT
                  </button>
                </div>
              </div>
            ) : (
              <div ref={formCardRef}>
                <div className="auth-mode-tabs">
                  <button
                    type="button"
                    className={`shop-filter-pill ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => setMode('login')}
                  >
                    {lang === 'it' ? 'ACCEDI' : 'SIGN IN'}
                  </button>
                  <button
                    type="button"
                    className={`shop-filter-pill ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => setMode('signup')}
                  >
                    {lang === 'it' ? 'REGISTRATI' : 'CREATE ACCOUNT'}
                  </button>
                </div>

                <h1 ref={titleRef} className="ec-display-title left small">
                  <span className="title-line-mask">
                    {renderSplitChars(
                      mode === 'login'
                        ? lang === 'it'
                          ? 'BENTORNATO'
                          : 'WELCOME BACK'
                        : lang === 'it'
                        ? 'UNISCITI A NOI'
                        : 'JOIN THE FARM'
                    )}
                  </span>
                </h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {mode === 'signup' && (
                    <label className="ec-field">
                      <span>Full Name</span>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Giulia Rizzo"
                      />
                    </label>
                  )}

                  <label className="ec-field">
                    <span>Email Address</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                    />
                  </label>

                  <label className="ec-field">
                    <span>Password</span>
                    <div className="password-input-wrap">
                      <input
                        required
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="show-pass-btn"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </label>

                  <button type="submit" className="ec-primary-btn full-width">
                    {mode === 'login' ? 'SIGN IN TO PANTRY' : 'CREATE ACCOUNT'} &rarr;
                  </button>
                </form>

                <div className="auth-social-divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <div className="auth-social-row">
                  <button
                    type="button"
                    className="ec-secondary-btn"
                    onClick={() => {
                      loginUser({ name: 'Elena Conti', email: 'elena@sicilia.it' });
                      showToast('SIGNED IN WITH GOOGLE', 'elena@sicilia.it');
                    }}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="ec-secondary-btn"
                    onClick={() => {
                      loginUser({ name: 'Marco Greco', email: 'marco@icloud.com' });
                      showToast('SIGNED IN WITH APPLE', 'marco@icloud.com');
                    }}
                  >
                    Apple
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
