'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AGRUMEA_I18N, AGRUMEA_PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import ThreeJarCanvas from './ThreeJarCanvas';

const ORBIT_KEYFRAMES = [
  { diff: -2.5, xRatio: -0.58, yRatio: -0.14, scale: 0.38, tilt: 14, blur: 4.5, opacity: 0 },
  { diff: -2.0, xRatio: -0.49, yRatio: -0.10, scale: 0.48, tilt: 11, blur: 3.4, opacity: 0.92 },
  { diff: -1.0, xRatio: -0.295, yRatio: -0.045, scale: 0.78, tilt: 27, blur: 0, opacity: 1 },
  { diff: 0.0, xRatio: 0.012, yRatio: 0.055, scale: 1.05, tilt: -4.2, blur: 0, opacity: 1 },
  { diff: 1.0, xRatio: 0.315, yRatio: 0.145, scale: 0.76, tilt: 8.5, blur: 0.9, opacity: 1 },
  { diff: 2.0, xRatio: 0.515, yRatio: 0.18, scale: 0.48, tilt: 22, blur: 3.4, opacity: 0.9 },
  { diff: 2.5, xRatio: 0.60, yRatio: 0.21, scale: 0.38, tilt: 26, blur: 4.5, opacity: 0 }
];

function sampleOrbitKeyframe(diff) {
  if (diff <= ORBIT_KEYFRAMES[0].diff) return ORBIT_KEYFRAMES[0];
  if (diff >= ORBIT_KEYFRAMES[ORBIT_KEYFRAMES.length - 1].diff) {
    return ORBIT_KEYFRAMES[ORBIT_KEYFRAMES.length - 1];
  }

  for (let i = 0; i < ORBIT_KEYFRAMES.length - 1; i++) {
    const k0 = ORBIT_KEYFRAMES[i];
    const k1 = ORBIT_KEYFRAMES[i + 1];
    if (diff >= k0.diff && diff <= k1.diff) {
      const linearT = (diff - k0.diff) / (k1.diff - k0.diff);
      const t = 0.5 - 0.5 * Math.cos(linearT * Math.PI);
      return {
        xRatio: k0.xRatio + (k1.xRatio - k0.xRatio) * t,
        yRatio: k0.yRatio + (k1.yRatio - k0.yRatio) * t,
        scale: k0.scale + (k1.scale - k0.scale) * t,
        tilt: k0.tilt + (k1.tilt - k0.tilt) * t,
        blur: k0.blur + (k1.blur - k0.blur) * t,
        opacity: k0.opacity + (k1.opacity - k0.opacity) * t
      };
    }
  }
  return ORBIT_KEYFRAMES[3];
}

export default function OrbitalCarousel({
  lang,
  initialProductId = 'caponata',
  onDiscoverProduct,
  onHoverPill,
  onLeavePill,
  onPreviewUrl
}) {
  const { addToCart } = useStore();
  const initialIdx = Math.max(
    0,
    AGRUMEA_PRODUCTS.findIndex((p) => p.id === initialProductId)
  );

  const wheelSvgRef = useRef(null);
  const progressObjRef = useRef({ value: initialIdx });
  const targetProgressRef = useRef(initialIdx);
  const snapTimerRef = useRef(null);
  const isMorphingRef = useRef(false);

  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startProgress: initialIdx,
    movedDistance: 0
  });

  const [renderProgress, setRenderProgress] = useState(initialIdx);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [selectedWeight, setSelectedWeight] = useState('240g');
  const [morphState, setMorphState] = useState(null);
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  const ui = AGRUMEA_I18N[lang];

  useEffect(() => {
    const updateSize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const animateToProgress = (nextTarget, duration = 0.62) => {
    if (isMorphingRef.current) return;
    targetProgressRef.current = nextTarget;

    gsap.to(progressObjRef.current, {
      value: nextTarget,
      duration,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: () => {
        const val = progressObjRef.current.value;
        const vel = nextTarget - val;
        setRenderProgress(val);
        setScrollVelocity(vel);
        if (wheelSvgRef.current) {
          wheelSvgRef.current.style.transform = `rotate(${(-val * 36).toFixed(2)}deg)`;
        }
      },
      onComplete: () => {
        setScrollVelocity(0);
      }
    });
  };

  const scheduleSnapToSlot = (delayMs = 150) => {
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      if (isMorphingRef.current) return;
      const snapped = Math.round(targetProgressRef.current);
      animateToProgress(snapped, 0.54);
    }, delayMs);
  };

  useEffect(() => {
    const onWheel = (e) => {
      if (isMorphingRef.current) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      animateToProgress(targetProgressRef.current + delta * 0.0022, 0.42);
      scheduleSnapToSlot(150);
    };

    const onKeyDown = (e) => {
      if (isMorphingRef.current) return;
      if (e.key === 'ArrowRight') {
        animateToProgress(Math.round(targetProgressRef.current + 1), 0.58);
      } else if (e.key === 'ArrowLeft') {
        animateToProgress(Math.round(targetProgressRef.current - 1), 0.58);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, []);

  const handleStagePointerDown = (e) => {
    if (isMorphingRef.current || e.target.closest('button, a, .home-quick-buy-bar')) return;
    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startProgress = targetProgressRef.current;
    dragRef.current.movedDistance = 0;
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
  };

  const handleStagePointerMove = (e) => {
    if (!dragRef.current.isDown || isMorphingRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.movedDistance = Math.max(dragRef.current.movedDistance, Math.abs(dx));
    animateToProgress(dragRef.current.startProgress - dx * 0.0032, 0.28);
  };

  const handleStagePointerUp = () => {
    if (!dragRef.current.isDown) return;
    dragRef.current.isDown = false;
    if (dragRef.current.movedDistance >= 6) {
      scheduleSnapToSlot(60);
    }
  };

  const getShortestWrappedDiff = (index, progress) => {
    const N = AGRUMEA_PRODUCTS.length;
    let diff = (index - (progress % N) + N) % N;
    if (diff > N / 2) diff -= N;
    return diff;
  };

  const startProductMorphTransition = (prod, idx, currentDiff) => {
    if (isMorphingRef.current) return;
    isMorphingRef.current = true;
    onLeavePill();
    onPreviewUrl(null);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

    const startCarouselMotion = Math.abs(currentDiff) > 0.12;
    const runMorph = () => {
      const mObj = { p: 0 };
      setMorphState({ productId: prod.id, index: idx, p: 0 });
      gsap.to(mObj, {
        p: 1,
        duration: 0.56,
        ease: 'power3.inOut',
        onUpdate: () => {
          setMorphState({ productId: prod.id, index: idx, p: mObj.p });
        },
        onComplete: () => {
          onDiscoverProduct(prod.id);
        }
      });
    };

    if (startCarouselMotion) {
      const dest = targetProgressRef.current + currentDiff;
      targetProgressRef.current = dest;
      gsap.to(progressObjRef.current, {
        value: dest,
        duration: 0.36,
        ease: 'power2.out',
        onUpdate: () => {
          const val = progressObjRef.current.value;
          setRenderProgress(val);
          setScrollVelocity(dest - val);
          if (wheelSvgRef.current) {
            wheelSvgRef.current.style.transform = `rotate(${(-val * 36).toFixed(2)}deg)`;
          }
        },
        onComplete: () => {
          setScrollVelocity(0);
          runMorph();
        }
      });
    } else {
      runMorph();
    }
  };

  const morphProgress = morphState ? morphState.p : 0;
  const N = AGRUMEA_PRODUCTS.length;
  const centeredIdx = ((Math.round(renderProgress) % N) + N) % N;
  const centeredProduct = AGRUMEA_PRODUCTS[centeredIdx];
  const centeredPrice = (centeredProduct.prices?.[selectedWeight] ?? 9.0).toFixed(2);

  return (
    <main
      className="home-view active-view"
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
      onPointerCancel={handleStagePointerUp}
    >
      <div className="orbital-stage">
        <div
          className="burgundy-wheel-wrap"
          style={{
            opacity: 1 - morphProgress,
            transform: `translateX(-50%) translateY(${(morphProgress * 90).toFixed(1)}px)`
          }}
        >
          <svg
            ref={wheelSvgRef}
            className="burgundy-wheel-svg"
            viewBox="0 0 1000 1000"
            style={{ transform: `rotate(${(-renderProgress * 36).toFixed(2)}deg)` }}
          >
            <defs>
              <path id="text-ring-path" d="M 500, 145 A 355,355 0 1,1 499.9, 145" />
            </defs>
            <path
              className="wheel-polygon"
              d="M 500 30 L 776 120 L 947 355 L 947 645 L 776 880 L 500 970 L 224 880 L 53 645 L 53 355 L 224 120 Z"
              fill="#591C21"
              stroke="#591C21"
              strokeWidth="48"
              strokeLinejoin="round"
            />
            <text className="wheel-curved-text">
              <textPath href="#text-ring-path" startOffset="0%">
                {ui.wheelText}
              </textPath>
            </text>
          </svg>
        </div>

        <div className="orbital-jars-layer">
          {AGRUMEA_PRODUCTS.map((prod, idx) => {
            const diff = getShortestWrappedDiff(idx, renderProgress);
            const absDiff = Math.abs(diff);
            const isVisible = absDiff <= 2.48;
            const isHovered = hoveredIdx === idx && !morphState;
            const isMorphTarget = morphState && morphState.productId === prod.id;

            const kf = sampleOrbitKeyframe(diff);

            let x = kf.xRatio * viewport.w;
            let y = kf.yRatio * viewport.h - (isHovered ? 8 : 0);
            let scale = isHovered ? kf.scale * 1.04 : kf.scale;
            let tiltDeg = isHovered && absDiff < 0.35 ? 0 : -kf.tilt;
            let opacity = isVisible ? kf.opacity : 0;
            let blurPx = isHovered ? 0 : kf.blur;

            const motionSpin = Math.max(-Math.PI, Math.min(Math.PI, scrollVelocity * 2.8));
            const hoverSpin = isHovered ? -0.52 : 0;
            let yawAngle = motionSpin + hoverSpin;

            if (morphState) {
              if (isMorphTarget) {
                const mp = morphState.p;
                const targetHeroY = viewport.h * 0.25;
                const targetHeroScale = 1.24;
                x = x * (1 - mp);
                y = y + (targetHeroY - y) * mp;
                scale = scale + (targetHeroScale - scale) * mp;
                tiltDeg = tiltDeg * (1 - mp);
                blurPx = 0;
                opacity = 1;
                yawAngle = hoverSpin * (1 - mp) - mp * (Math.PI * 2 + 0.35);
              } else {
                opacity = kf.opacity * Math.max(0, 1 - morphState.p * 2.2);
              }
            }

            return (
              <div
                key={prod.id}
                className="orbital-jar-item"
                style={{
                  opacity,
                  pointerEvents: opacity > 0.15 && !morphState ? 'auto' : 'none',
                  zIndex: isMorphTarget ? 150 : isHovered ? 120 : Math.round(100 - absDiff * 20),
                  filter: blurPx > 0.15 ? `blur(${blurPx.toFixed(2)}px)` : 'none',
                  transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
                }}
                onPointerEnter={() => {
                  if (isMorphingRef.current) return;
                  setHoveredIdx(idx);
                  onHoverPill(ui.discoverProduct);
                  onPreviewUrl(prod.slug);
                }}
                onPointerLeave={() => {
                  setHoveredIdx((prev) => (prev === idx ? -1 : prev));
                  onLeavePill();
                  onPreviewUrl(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragRef.current.movedDistance >= 6 || isMorphingRef.current) return;
                  startProductMorphTransition(prod, idx, diff);
                }}
              >
                <ThreeJarCanvas
                  product={prod}
                  yawAngle={yawAngle}
                  tiltDeg={tiltDeg}
                  width={360}
                  height={460}
                  interactive={!morphState}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom HUD + Editorial Quick Add-to-Cart Bar for Centered Jar */}
      <div
        className="home-bottom-hud"
        style={{ opacity: 1 - morphProgress }}
      >
        <a href="#privacy" className="privacy-link" onClick={(e) => e.preventDefault()}>
          {ui.privacyCookies}
        </a>

        <div className="scroll-discover-indicator">{ui.scrollToDiscover}</div>

        <div className="home-quick-buy-bar">
          <div className="quick-buy-info">
            <span className="quick-buy-title">{centeredProduct.jarMainTitle}</span>
            <span className="quick-buy-price">&euro;{centeredPrice}</span>
          </div>
          <div className="quick-buy-weights">
            {centeredProduct.weights.map((w) => (
              <button
                key={w}
                type="button"
                className={`quick-weight-btn ${selectedWeight === w ? 'active' : ''}`}
                onClick={() => setSelectedWeight(w)}
              >
                {w}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="quick-add-btn"
            onClick={() => addToCart(centeredProduct.id, selectedWeight, 1)}
          >
            + {ui.addToCart}
          </button>
        </div>
      </div>
    </main>
  );
}
