'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';

const StoreContext = createContext(null);

const CART_STORAGE_KEY = 'agrumea_cart_v1';
const USER_STORAGE_KEY = 'agrumea_user_v1';
const LANG_STORAGE_KEY = 'agrumea_lang_v1';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Wrapper around fetch that always sends cookies and sets JSON headers. */
async function authFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  return res;
}

export function StoreProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [cart, setCart] = useState([
    { productId: 'gelsi-neri', weight: '240g', quantity: 1 },
    { productId: 'smeralda', weight: '240g', quantity: 1 }
  ]);
  const [user, setUser] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', productName: '' });
  const [hydrated, setHydrated] = useState(false);

  const toastTimerRef = useRef(null);
  const curtainRef = useRef(null);
  const curtainTlRef = useRef(null);

  useEffect(() => {
    // Restore localStorage state
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'en' || savedLang === 'it') {
        setLangState(savedLang);
      }
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);

    // Restore session from httpOnly cookie (gracefully degrades if backend is offline)
    authFetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser((prev) => prev ?? data.user);
        }
      })
      .catch(() => {
        // Backend not running — no-op, localStorage session remains
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user, hydrated]);

  const setLang = (nextLang) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (curtainRef.current) {
      gsap.set(curtainRef.current, {
        y: 0,
        yPercent: 101,
        autoAlpha: 0,
        pointerEvents: 'none'
      });
    }
    return () => {
      if (curtainTlRef.current) curtainTlRef.current.kill();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const runGlobalCurtain = (onMidpoint) => {
    const curtain = curtainRef.current;
    if (!curtain) {
      if (onMidpoint) onMidpoint();
      return;
    }

    if (curtainTlRef.current) curtainTlRef.current.kill();

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
    curtainTlRef.current = tl;

    gsap.set(curtain, {
      y: 0,
      yPercent: 101,
      autoAlpha: 1,
      pointerEvents: 'all'
    });

    tl.to(curtain, {
      y: 0,
      yPercent: 0,
      duration: 0.42,
      ease: 'power4.inOut',
      onComplete: () => {
        if (onMidpoint) onMidpoint();
      }
    }).to(curtain, {
      y: 0,
      yPercent: -101,
      duration: 0.42,
      ease: 'power4.inOut',
      delay: 0.06
    });
  };

  const showToast = (message, productName = '') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, productName });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);
  };

  const addToCart = (productId, weight = '240g', quantity = 1) => {
    const prod = AGRUMEA_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === productId && item.weight === weight);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, { productId, weight, quantity }];
    });

    const ui = AGRUMEA_I18N[lang] || AGRUMEA_I18N.en;
    showToast(ui.addedToCart, `${prod.jarMainTitle} (${weight})`);
  };

  const updateQuantity = (productId, weight, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId, weight) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.weight === weight)));
  };

  const clearCart = () => setCart([]);

  const loginUser = async ({ name, email, password }) => {
    // Try backend first; fall back to localStorage-only mock if backend is unreachable
    if (password !== undefined) {
      try {
        const res = await authFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          return { success: true, user: data.user };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || 'Login failed' };
      } catch {
        // Backend offline — fall through to mock
      }
    }
    // Offline / mock fallback
    const mockUser = {
      name: name || email.split('@')[0],
      email,
      memberSince: '2026',
      location: 'Sicily, Italy',
    };
    setUser(mockUser);
    return { success: true, user: mockUser };
  };

  const registerUser = async ({ name, email, password }) => {
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true, user: data.user };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Registration failed' };
    } catch {
      // Backend offline — mock register
      const mockUser = { name, email, memberSince: '2026', location: 'Sicily, Italy' };
      setUser(mockUser);
      return { success: true, user: mockUser };
    }
  };

  const logoutUser = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Backend offline — clear local state only
    }
    setUser(null);
  };

  const detailedCart = useMemo(() => {
    return cart
      .map((item) => {
        const product = AGRUMEA_PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        const unitPrice = product.prices?.[item.weight] ?? 9.0;
        return {
          ...item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.quantity
        };
      })
      .filter(Boolean);
  }, [cart]);

  const cartCount = useMemo(
    () => detailedCart.reduce((sum, item) => sum + item.quantity, 0),
    [detailedCart]
  );

  const cartSubtotal = useMemo(
    () => detailedCart.reduce((sum, item) => sum + item.lineTotal, 0),
    [detailedCart]
  );

  const discountRate = promoCode.trim().toUpperCase() === 'SICILIA10' ? 0.1 : 0;
  const discountAmount = cartSubtotal * discountRate;
  const shippingFee = cartSubtotal >= 45 || cartSubtotal === 0 ? 0 : 6.9;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const value = {
    lang,
    setLang,
    cart: detailedCart,
    cartCount,
    cartSubtotal,
    promoCode,
    setPromoCode,
    discountRate,
    discountAmount,
    shippingFee,
    cartTotal,
    user,
    loginUser,
    registerUser,
    logoutUser,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    runGlobalCurtain,
    showToast
  };

  return (
    <StoreContext.Provider value={value}>
      <div ref={curtainRef} className="transition-curtain" />

      <div className={`store-toast ${toast.visible ? 'visible' : ''}`} role="status" aria-live="polite">
        <span className="store-toast-diamond">&#x25C6;</span>
        <div className="store-toast-copy">
          <span className="store-toast-title">{toast.message}</span>
          {toast.productName && <span className="store-toast-sub">{toast.productName}</span>}
        </div>
      </div>

      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
