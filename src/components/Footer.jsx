'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function Footer({ onNavigateHome }) {
  const router = useRouter();
  const { runGlobalCurtain } = useStore();

  const handleHome = (e) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      runGlobalCurtain(() => router.push('/'));
    }
  };

  const go = (e, path) => {
    e.preventDefault();
    runGlobalCurtain(() => router.push(path));
  };

  return (
    <footer className="site-footer">
      <div className="footer-brand-giant">
        <span className="footer-giant-agrumea">AGRUMEA</span>
        <span className="footer-giant-farm">Farm</span>
      </div>

      <div className="footer-columns">
        {/* Col 1: Sicilian Farmer Line Art & Legal */}
        <div className="footer-col footer-col-legal">
          <div className="footer-farmer-illustration">
            <svg viewBox="0 0 90 95" width="68" height="72" fill="none">
              <path d="M26 24 C26 14, 64 14, 64 24 C69 24, 72 27, 68 29 L22 29 C18 27, 21 24, 26 24 Z" stroke="#DF3D14" strokeWidth="2" fill="none" />
              <circle cx="45" cy="36" r="9" stroke="#DF3D14" strokeWidth="2" fill="none" />
              <path d="M39 39 Q45 36 51 39" stroke="#DF3D14" strokeWidth="1.8" fill="none" />
              <path d="M22 68 C22 50, 68 50, 68 68" stroke="#DF3D14" strokeWidth="2" fill="none" />
              <path d="M27 66 L63 66 L57 82 L33 82 Z" stroke="#DF3D14" strokeWidth="2" fill="none" />
              <circle cx="37" cy="62" r="4" stroke="#DF3D14" strokeWidth="1.6" />
              <circle cx="45" cy="60" r="4.5" stroke="#DF3D14" strokeWidth="1.6" />
              <circle cx="53" cy="62" r="4" stroke="#DF3D14" strokeWidth="1.6" />
              <circle cx="41" cy="56" r="3.5" stroke="#DF3D14" strokeWidth="1.6" />
              <circle cx="49" cy="56" r="3.5" stroke="#DF3D14" strokeWidth="1.6" />
            </svg>
          </div>
          <div className="footer-copyright">
            <p className="copyright-orange">&copy;2026 | AGRUMEA FARM</p>
            <p>Azienda Agricola Sebastiano Piazza</p>
            <p className="vat-number">VAT IT01980440894</p>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="footer-col footer-col-nav">
          <ul className="footer-links-primary">
            <li><a href="/" onClick={handleHome}>Home</a></li>
            <li><a href="/shop" onClick={(e) => go(e, '/shop')}>Shop</a></li>
            <li><a href="/cart" onClick={(e) => go(e, '/cart')}>Cart</a></li>
            <li><a href="/checkout" onClick={(e) => go(e, '/checkout')}>Payout</a></li>
          </ul>
          <ul className="footer-links-secondary">
            <li><a href="/login" onClick={(e) => go(e, '/login')}>Account / Sign In</a></li>
            <li><a href="#contacts" onClick={(e) => e.preventDefault()}>Contacts</a></li>
          </ul>
        </div>

        {/* Col 3: Offices */}
        <div className="footer-col footer-col-offices">
          <div className="office-group">
            <h4 className="footer-label">REGISTERED OFFICE</h4>
            <p>Via Generale Ameglio, 13</p>
            <p>95123 - Catania</p>
          </div>
          <div className="office-group">
            <h4 className="footer-label">OPERATIONAL OFFICE</h4>
            <p>Seconda strada c.da piana s. Croce sn</p>
            <p>96014 - Floridia (SR)</p>
          </div>
        </div>

        {/* Col 4: Social & Contact */}
        <div className="footer-col footer-col-contact">
          <div className="follow-group">
            <h4 className="footer-label">FOLLOW US</h4>
            <a href="#instagram" onClick={(e) => e.preventDefault()} className="instagram-link">
              @Instagram
            </a>
          </div>
          <div className="inquiry-group">
            <p>
              Do you have a question or would you like to find out more about us? Drop us a line,
              we&apos;d be delighted to tell you all about Agrumea Farm.
            </p>
            <a href="#contact" onClick={(e) => e.preventDefault()} className="footer-mailto">
              info@agrumeafarm.it
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <a href="#privacy" onClick={(e) => e.preventDefault()} className="footer-privacy-link">
          Privacy &amp; Cookies
        </a>
        <span className="footer-studio-credit">Designed by Studio K95</span>
      </div>
    </footer>
  );
}
