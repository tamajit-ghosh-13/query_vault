'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';

export default function Header({
  lang: propLang,
  onSelectLang,
  onNavigateHome,
  onSelectProduct,
  onReplayPreloader
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const { lang: storeLang, setLang: setStoreLang, cartCount, user, runGlobalCurtain } = useStore();

  const lang = propLang || storeLang;
  const handleLangChange = (nextLang) => {
    setStoreLang(nextLang);
    if (onSelectLang) onSelectLang(nextLang);
  };

  const ui = AGRUMEA_I18N[lang];

  const navigateWithCurtain = (href) => {
    setMenuOpen(false);
    runGlobalCurtain(() => {
      router.push(href);
    });
  };

  const handleProductClick = (e, prodId) => {
    e.preventDefault();
    setMenuOpen(false);
    if (onSelectProduct) {
      onSelectProduct(prodId);
    } else {
      navigateWithCurtain(`/dispensa/${prodId}`);
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigateWithCurtain('/');
    }
  };

  return (
    <>
      <div className="top-accent-bar" />

      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        <div className="header-left">
          <button
            className={`lang-btn ${lang === 'it' ? 'active' : ''}`}
            onClick={() => handleLangChange('it')}
            aria-label="Switch to Italian"
          >
            IT
          </button>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => handleLangChange('en')}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>

        <a href="/" className="brand-logo" onClick={handleHomeClick} aria-label="Agrumea Farm Home">
          <svg className="brand-emblem" viewBox="0 0 180 86" fill="none">
            <path
              d="M78 14 C78 8, 100 8, 100 14 C105 14, 107 17, 103 18 L75 18 C71 17, 73 14, 78 14 Z"
              fill="#DF3D14"
            />
            <circle cx="89" cy="23" r="5.5" fill="#DF3D14" />
            <path
              d="M68 42 C68 29, 110 29, 110 42 C110 51, 99 54, 89 54 C79 54, 68 51, 68 42 Z"
              fill="#DF3D14"
            />
            <circle cx="81" cy="39" r="3.2" fill="#FBF3E8" />
            <circle cx="89" cy="37.5" r="3.5" fill="#FBF3E8" />
            <circle cx="97" cy="39" r="3.2" fill="#FBF3E8" />
            <circle cx="85" cy="34" r="2.8" fill="#FBF3E8" />
            <circle cx="93" cy="34" r="2.8" fill="#FBF3E8" />
            <path d="M72 44 Q89 51 106 44" stroke="#FBF3E8" strokeWidth="1.8" fill="none" />
            <defs>
              <path id="header-arch-path" d="M 18, 74 Q 90, 55 162, 74" />
            </defs>
            <text
              fill="#3B1D1A"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              fontSize="24"
              fontWeight="700"
              letterSpacing="1.5"
            >
              <textPath href="#header-arch-path" startOffset="50%" textAnchor="middle">
                AGRUMEA
              </textPath>
            </text>
          </svg>
          <span className="brand-subtitle">Farm</span>
        </a>

        <div className="header-right">
          <button
            className="header-nav-pill hide-mobile"
            onClick={() => navigateWithCurtain('/shop')}
          >
            {ui.shop}
          </button>

          <button
            className="header-nav-pill"
            onClick={() => navigateWithCurtain('/login')}
          >
            {user ? user.name.split(' ')[0].toUpperCase() : ui.account}
          </button>

          <button
            className="header-cart-pill"
            onClick={() => navigateWithCurtain('/cart')}
            aria-label="Open Cart"
          >
            <span>{ui.cart}</span>
            <span className="header-cart-badge">{cartCount}</span>
          </button>

          <button className="menu-pill-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span>{menuOpen ? ui.close : ui.menu}</span>
          </button>
          <button
            className="menu-plus-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="plus-icon">{menuOpen ? '×' : '\u25C6'}</span>
          </button>
        </div>
      </header>

      <div className={`menu-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-drawer-inner">
          <div className="menu-drawer-col">
            <span className="menu-eyebrow">{ui.navigation}</span>
            <ul className="menu-nav-list">
              <li>
                <a href="/" onClick={handleHomeClick}>
                  Dispensa (Orbital 3D Pantry)
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithCurtain('/shop');
                  }}
                >
                  Shop All Preserves
                </a>
              </li>
              {AGRUMEA_PRODUCTS.map((p) => (
                <li key={p.id}>
                  <a href={`/dispensa/${p.slug}`} onClick={(e) => handleProductClick(e, p.id)}>
                    {p[lang].titleLine1} {p[lang].titleLine2}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="menu-drawer-col menu-drawer-info">
            <span className="menu-eyebrow">PANTRY STORE &amp; ACCOUNT</span>
            <div className="menu-ecommerce-links">
              <button
                className="menu-ec-btn"
                onClick={() => navigateWithCurtain('/cart')}
              >
                {ui.cart} ({cartCount})
              </button>
              <button
                className="menu-ec-btn"
                onClick={() => navigateWithCurtain('/checkout')}
              >
                {ui.checkout}
              </button>
              <button
                className="menu-ec-btn outline"
                onClick={() => navigateWithCurtain('/login')}
              >
                {user ? `${user.name} — Profile` : `${ui.signIn} / ${ui.signUp}`}
              </button>
            </div>

            <p className="menu-desc">
              Artisanal Sicilian jams, pistachio spreads, and savory preserves crafted in Floridia (SR)
              with interactive 3D jar inspection.
            </p>

            {onReplayPreloader && (
              <button
                className="replay-preloader-btn"
                onClick={() => {
                  setMenuOpen(false);
                  onReplayPreloader();
                }}
              >
                {ui.replayPreloader}
              </button>
            )}

            <div className="menu-office-block">
              <h4>AGRUMEA FARM</h4>
              <p>
                Via Generale Ameglio, 13 — 95123 Catania (CT)
                <br />
                Seconda strada c.da piana s. Croce sn — 96014 Floridia (SR), Sicily
              </p>
              <span className="menu-email">info@agrumeafarm.it</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
