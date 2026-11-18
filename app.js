// Main Interactive Controller for Agrumea Farm Clone
// Implements:
// 1. 2D Rigid-Body Physics Preloader (00:00 - 00:03) with falling fruit silhouettes & 0-100% counter
// 2. Orbital 3D Jar Carousel (00:03 - 00:19) with rotating burgundy wheel, tangential tilt, and 360° Y-axis jar spin
// 3. Curtain Wipe Transitions & Scroll-Linked Product Detail View (00:20 - 01:05)
// 4. Momentum-Draggable Horizontal Lifestyle Gallery & Interactive 4-Card "Other Products" Grid
// 5. Bilingual IT / EN Switcher & Menu Drawer

(function () {
  const products = window.AGRUMEA_PRODUCTS;
  const i18n = window.AGRUMEA_I18N;
  const renderer = window.AgrumeaJarRenderer;

  let currentLang = 'en';
  let currentView = 'home'; // 'home' | 'product'
  let activeProductIndex = 5; // Starts near Gelsi Neri / Fragole as in video

  // Orbital carousel continuous state
  let wheelProgress = 4.0; // Continuous float index along products[]
  let targetWheelProgress = 4.0;
  let activeJarSpinYaw = 0;
  let targetJarSpinYaw = 0;
  let hoveredOrbitalIndex = -1;

  // Detail view scroll-linked jar state
  let currentDetailProduct = products[5];
  let detailScrollYaw = Math.PI * 0.82; // Starts showing back/side label & rotates to front on scroll (00:21 -> 00:25)

  // DOM Elements
  const preloaderEl = document.getElementById('preloader');
  const preloaderCanvas = document.getElementById('preloader-canvas');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloaderCurtain = document.getElementById('preloader-curtain');
  const transitionCurtain = document.getElementById('transition-curtain');
  const cursorPill = document.getElementById('cursor-pill');
  const cursorPillText = document.getElementById('cursor-pill-text');
  const urlPreview = document.getElementById('url-preview');

  const homeView = document.getElementById('home-view');
  const productView = document.getElementById('product-view');
  const orbitalJarsLayer = document.getElementById('orbital-jars-layer');
  const burgundyWheelSvg = document.getElementById('burgundy-wheel-svg');

  const detailJarCanvas = document.getElementById('detail-jar-canvas');
  const detailJarTransform = document.getElementById('detail-jar-transform');
  const galleryViewport = document.getElementById('gallery-viewport');
  const galleryTrack = document.getElementById('gallery-track');
  const otherProductsGrid = document.getElementById('other-products-grid');

  // ==========================================================================
  // 1. PHYSICS PRELOADER (00:00 - 00:03)
  // ==========================================================================
  function runPhysicsPreloader() {
    preloaderEl.classList.remove('hidden');
    preloaderCurtain.classList.remove('wipe-up', 'wipe-away');
    preloaderCounter.textContent = '0%';

    const ctx = preloaderCanvas.getContext('2d');
    let W = (preloaderCanvas.width = window.innerWidth);
    let H = (preloaderCanvas.height = window.innerHeight);

    const fruitPalette = [
      { type: 'tomato', color: '#7D1418', r: 95 },
      { type: 'orange', color: '#DF5314', r: 88 },
      { type: 'strawberry', color: '#D91B24', r: 78 },
      { type: 'pear', color: '#641C34', r: 92 },
      { type: 'orange', color: '#1F5A34', r: 86 },
      { type: 'lemon', color: '#F4C813', r: 82 },
      { type: 'eggplant', color: '#4B1D52', r: 105 },
      { type: 'orange', color: '#E47B1B', r: 74 },
      { type: 'mulberry', color: '#1A1B3A', r: 72 },
      { type: 'pear', color: '#3A4E18', r: 90 },
      { type: 'lemon', color: '#6E3219', r: 64 }
    ];

    // Spawn 18 rigid-body fruit silhouettes falling from top
    const bodies = [];
    for (let i = 0; i < 18; i++) {
      const spec = fruitPalette[i % fruitPalette.length];
      const scale = Math.min(1.15, Math.max(0.75, W / 1400));
      bodies.push({
        type: spec.type,
        color: spec.color,
        r: spec.r * scale,
        x: W * 0.08 + ((i * 173) % (W * 0.84)),
        y: -120 - i * 68,
        vx: (Math.sin(i * 2.1) * 2.2),
        vy: 2 + (i % 3) * 1.5,
        angle: (i * 0.7) % (Math.PI * 2),
        vAngle: (i % 2 === 0 ? 1 : -1) * 0.018
      });
    }

    const startTime = performance.now();
    const duration = 2350; // 2.35s physics drop + counter 0% -> 100%

    function stepPhysics(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const pct = Math.floor(progress * 100);
      preloaderCounter.textContent = pct + '%';

      ctx.clearRect(0, 0, W, H);

      // Update & collide rigid bodies
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        b.vy += 0.58; // Gravity
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.vAngle;

        // Floor collision
        if (b.y + b.r * 0.78 > H) {
          b.y = H - b.r * 0.78;
          b.vy *= -0.32;
          b.vx *= 0.85;
          b.vAngle *= 0.85;
        }
        // Wall collisions
        if (b.x - b.r * 0.75 < 0) {
          b.x = b.r * 0.75;
          b.vx *= -0.5;
        } else if (b.x + b.r * 0.75 > W) {
          b.x = W - b.r * 0.75;
          b.vx *= -0.5;
        }

        // Pairwise circle-circle collision response so fruits pile up naturally (00:01)
        for (let j = i + 1; j < bodies.length; j++) {
          const o = bodies[j];
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const dist = Math.hypot(dx, dy);
          const minDist = (b.r + o.r) * 0.74;
          if (dist > 0 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;
            b.x -= nx * overlap;
            b.y -= ny * overlap;
            o.x += nx * overlap;
            o.y += ny * overlap;

            const kx = b.vx - o.vx;
            const ky = b.vy - o.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;
            b.vx -= p * nx * 0.42;
            b.vy -= p * ny * 0.42;
            o.vx += p * nx * 0.42;
            o.vy += p * ny * 0.42;
          }
        }

        renderer.drawFruitSilhouette(ctx, b.type, b.x, b.y, b.r, b.color, b.angle);
      }

      if (progress < 1) {
        requestAnimationFrame(stepPhysics);
      } else {
        // Trigger orange-red curtain wipe up (00:02)
        preloaderCurtain.classList.add('wipe-up');
        setTimeout(() => {
          preloaderCurtain.classList.add('wipe-away');
          setTimeout(() => {
            preloaderEl.classList.add('hidden');
          }, 680);
        }, 580);
      }
    }

    requestAnimationFrame(stepPhysics);
  }

  // ==========================================================================
  // 2. ORBITAL 3D JAR CAROUSEL (00:03 - 00:19)
  // ==========================================================================
  const orbitalItems = [];

  function initOrbitalCarousel() {
    orbitalJarsLayer.innerHTML = '';
    orbitalItems.length = 0;

    products.forEach((prod, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'orbital-jar-item';
      itemEl.dataset.index = index;

      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 520;
      itemEl.appendChild(canvas);

      // Hover interactions matching 00:17 - 00:19
      itemEl.addEventListener('mouseenter', () => {
        hoveredOrbitalIndex = index;
        showCursorPill(i18n[currentLang].discoverProduct);
        showUrlPreview(prod.slug);
        // Spin active jar to show back nutritional label (240g) on hover just like 00:18!
        if (Math.abs(getShortestWrappedDiff(index, wheelProgress)) < 0.45) {
          targetJarSpinYaw = Math.PI * 0.85;
        }
      });

      itemEl.addEventListener('mouseleave', () => {
        hoveredOrbitalIndex = -1;
        hideCursorPill();
        hideUrlPreview();
        targetJarSpinYaw = 0;
      });

      itemEl.addEventListener('click', () => {
        const diff = getShortestWrappedDiff(index, wheelProgress);
        if (Math.abs(diff) > 0.35) {
          // Orbit smoothly to clicked jar first
          targetWheelProgress += diff;
        } else {
          // Open Product Detail View
          openProductDetail(prod.id, true);
        }
      });

      orbitalJarsLayer.appendChild(itemEl);
      orbitalItems.push({ el: itemEl, canvas, product: prod, index, lastYaw: null });

      // Initial render
      renderer.renderJar3D(canvas, prod, 0);
    });
  }

  function getShortestWrappedDiff(index, progress) {
    const N = products.length;
    let diff = (index - (progress % N) + N) % N;
    if (diff > N / 2) diff -= N;
    return diff;
  }

  function animateOrbitalLoop() {
    if (currentView === 'home') {
      // Smooth damping toward target wheel progress
      wheelProgress += (targetWheelProgress - wheelProgress) * 0.085;
      activeJarSpinYaw += (targetJarSpinYaw - activeJarSpinYaw) * 0.09;

      // Rotate the giant burgundy wheel SVG at bottom center
      const wheelDeg = -wheelProgress * 34;
      burgundyWheelSvg.style.transform = `rotate(${wheelDeg.toFixed(2)}deg)`;

      const W = window.innerWidth;
      const H = window.innerHeight;
      const orbitRadiusX = Math.min(W * 0.56, 780);
      const orbitRadiusY = Math.min(H * 0.42, 340);
      const orbitCenterY = H * 0.84;

      orbitalItems.forEach((item) => {
        const diff = getShortestWrappedDiff(item.index, wheelProgress);
        const absDiff = Math.abs(diff);

        if (absDiff > 2.4) {
          item.el.style.opacity = '0';
          item.el.style.pointerEvents = 'none';
          return;
        }

        // Angle along upper arc (-PI/2 is top center)
        const angleStep = 0.46; // radians per slot
        const theta = -Math.PI * 0.5 + diff * angleStep;

        const x = Math.cos(theta) * orbitRadiusX;
        const y = (orbitCenterY - H * 0.5) + Math.sin(theta) * orbitRadiusY;

        // Center jar is upright/slightly tilted; side jars tilt tangentially along the wheel arc
        let tiltDeg = diff * 21;
        if (absDiff < 0.25) {
          tiltDeg = diff * 12;
        }

        const scale = Math.max(0.55, 1.04 - absDiff * 0.22);
        const opacity = absDiff > 1.85 ? Math.max(0, 1 - (absDiff - 1.85) * 2) : 1;

        item.el.style.opacity = opacity.toFixed(3);
        item.el.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
        item.el.style.zIndex = String(Math.round(100 - absDiff * 20));
        item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${tiltDeg.toFixed(2)}deg)`;

        if (absDiff > 1.25) {
          item.el.classList.add('is-far');
        } else {
          item.el.classList.remove('is-far');
        }

        // Compute 3D Y-axis spin angle for the jar canvas
        let desiredYaw = diff * 0.55;
        if (absDiff < 0.45) {
          desiredYaw += activeJarSpinYaw;
        }

        if (item.lastYaw === null || Math.abs(item.lastYaw - desiredYaw) > 0.012) {
          renderer.renderJar3D(item.canvas, item.product, desiredYaw);
          item.lastYaw = desiredYaw;
        }
      });
    }

    requestAnimationFrame(animateOrbitalLoop);
  }

  // Wheel & Drag listeners on Home View
  window.addEventListener('wheel', (e) => {
    if (currentView !== 'home') return;
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetWheelProgress += delta * 0.0024;
  }, { passive: false });

  let isDraggingWheel = false;
  let wheelDragStartX = 0;
  let wheelStartProgress = 0;

  homeView.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return;
    isDraggingWheel = true;
    wheelDragStartX = e.clientX;
    wheelStartProgress = targetWheelProgress;
  });

  window.addEventListener('pointermove', (e) => {
    // Move custom floating cursor pill
    cursorPill.style.left = e.clientX + 'px';
    cursorPill.style.top = e.clientY + 'px';

    if (isDraggingWheel && currentView === 'home') {
      const dx = e.clientX - wheelDragStartX;
      targetWheelProgress = wheelStartProgress - dx * 0.0035;
    }
  });

  window.addEventListener('pointerup', () => {
    isDraggingWheel = false;
  });

  document.getElementById('carousel-prev-btn').addEventListener('click', () => {
    targetWheelProgress = Math.round(targetWheelProgress - 1);
  });

  document.getElementById('carousel-next-btn').addEventListener('click', () => {
    targetWheelProgress = Math.round(targetWheelProgress + 1);
  });

  window.addEventListener('keydown', (e) => {
    if (currentView === 'home') {
      if (e.key === 'ArrowRight') targetWheelProgress = Math.round(targetWheelProgress + 1);
      if (e.key === 'ArrowLeft') targetWheelProgress = Math.round(targetWheelProgress - 1);
    } else if (e.key === 'Escape') {
      returnToHomeView();
    }
  });

  // ==========================================================================
  // 3. CURTAIN TRANSITION & PRODUCT DETAIL VIEW (00:20 - 01:05)
  // ==========================================================================
  function runCurtainTransition(callback) {
    transitionCurtain.classList.remove('active-exit');
    transitionCurtain.classList.add('active-enter');

    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        transitionCurtain.classList.remove('active-enter');
        transitionCurtain.classList.add('active-exit');
        setTimeout(() => {
          transitionCurtain.classList.remove('active-exit');
        }, 560);
      }, 120);
    }, 520);
  }

  function openProductDetail(productId, withCurtain = true) {
    const prod = products.find((p) => p.id === productId) || products[0];
    currentDetailProduct = prod;
    hideCursorPill();
    hideUrlPreview();

    const applyDetail = () => {
      currentView = 'product';
      homeView.classList.remove('active-view');
      productView.classList.remove('revealed');
      productView.classList.add('active-view');
      productView.setAttribute('aria-hidden', 'false');

      populateProductDetailContent(prod);
      window.scrollTo({ top: 0, behavior: 'instant' });
      updateDetailScrollJar();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          productView.classList.add('revealed');
        });
      });
    };

    if (withCurtain) {
      runCurtainTransition(applyDetail);
    } else {
      applyDetail();
    }
  }

  function returnToHomeView() {
    if (currentView === 'home') return;
    hideCursorPill();
    hideUrlPreview();

    runCurtainTransition(() => {
      currentView = 'home';
      productView.classList.remove('active-view', 'revealed');
      productView.setAttribute('aria-hidden', 'true');
      homeView.classList.add('active-view');
    });
  }

  function populateProductDetailContent(prod) {
    const copy = prod[currentLang];
    const ui = i18n[currentLang];

    document.getElementById('detail-title-line1').textContent = copy.titleLine1;
    document.getElementById('detail-title-line2').textContent = copy.titleLine2;
    document.getElementById('detail-category').innerHTML = copy.category;
    document.getElementById('detail-origin').innerHTML = copy.origin;
    document.getElementById('detail-description').textContent = copy.description;
    document.getElementById('detail-ingredients').textContent = copy.ingredients;

    document.getElementById('spec-heading-tips').textContent = ui.usefulTips;
    document.getElementById('spec-heading-weights').textContent = ui.availableWeights;
    document.getElementById('spec-heading-shelf').textContent = ui.shelfLife;

    document.getElementById('detail-tips').textContent = copy.tips;
    document.getElementById('detail-shelf').textContent = prod.shelfLife[currentLang];

    const weightsEl = document.getElementById('detail-weights');
    weightsEl.innerHTML = prod.weights
      .map((w) => `<span class="weight-circle">${w}</span>`)
      .join('');

    document.getElementById('other-products-title').innerHTML = ui.theOtherProducts;

    // Build Horizontal Draggable Lifestyle Gallery (3 scenes)
    galleryTrack.innerHTML = '';
    galleryOffset = 0;
    targetGalleryOffset = 0;
    galleryTrack.style.transform = 'translate3d(0px, 0, 0)';

    for (let s = 0; s < 3; s++) {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      const canvas = document.createElement('canvas');
      canvas.width = 920;
      canvas.height = 580;
      slide.appendChild(canvas);
      galleryTrack.appendChild(slide);
      renderer.renderGalleryScene(canvas, prod, s);
    }

    // Build "THE OTHER PRODUCTS" 4-card grid (Matches 00:56 - 01:00)
    // Prefer displaying Arance, Gelsi Neri, Pere e Cannella, Smeralda (or 4 distinct products)
    const preferredIds = ['arance-fette', 'gelsi-neri', 'pere-cannella', 'smeralda', 'fragole-bacche'];
    const otherList = [];
    preferredIds.forEach((id) => {
      if (id !== prod.id && otherList.length < 4) {
        const found = products.find((p) => p.id === id);
        if (found) otherList.push(found);
      }
    });

    otherProductsGrid.innerHTML = '';
    otherList.forEach((otherProd) => {
      const card = document.createElement('div');
      card.className = 'other-product-card';

      // Fruit silhouette hover background canvas
      const bgCanvas = document.createElement('canvas');
      bgCanvas.className = 'other-card-bg-canvas';
      renderer.renderCardFruitPattern(bgCanvas, otherProd);

      // 3D Jar inside card
      const jarWrap = document.createElement('div');
      jarWrap.className = 'other-card-jar-wrap';
      const jarCanvas = document.createElement('canvas');
      jarCanvas.width = 280;
      jarCanvas.height = 360;
      renderer.renderJar3D(jarCanvas, otherProd, 0);
      jarWrap.appendChild(jarCanvas);

      card.appendChild(bgCanvas);
      card.appendChild(jarWrap);

      card.addEventListener('mouseenter', () => {
        showCursorPill(i18n[currentLang].discoverProduct);
        showUrlPreview(otherProd.slug);
      });

      card.addEventListener('mouseleave', () => {
        hideCursorPill();
        hideUrlPreview();
      });

      card.addEventListener('click', () => {
        openProductDetail(otherProd.id, true);
      });

      otherProductsGrid.appendChild(card);
    });
  }

  // Scroll-linked Floating & Tilting 3D Jar on Product Detail View (Matches 00:21 -> 00:26, 00:40 -> 00:42)
  function updateDetailScrollJar() {
    if (currentView !== 'product') return;
    const scrollY = window.scrollY || window.pageYOffset;
    const progress = Math.min(1, Math.max(0, scrollY / 340));

    // At scrollY = 0: jar sits upright (0 deg) showing back nutrition label (yaw ~ 2.7 rad)
    // As scrollY increases to 340px: jar rises slightly over the title, tilts counter-clockwise (-16.5 deg),
    // and rotates smoothly around its vertical axis to reveal the front product label (yaw -> 0 rad)!
    const tiltDeg = -progress * 16.5;
    const translateY = -progress * 58;
    const yaw = (1 - progress) * (Math.PI * 0.88);

    detailJarTransform.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) rotate(${tiltDeg.toFixed(2)}deg)`;
    renderer.renderJar3D(detailJarCanvas, currentDetailProduct, yaw);
  }

  window.addEventListener('scroll', updateDetailScrollJar, { passive: true });

  // ==========================================================================
  // 4. MOMENTUM-DRAGGABLE HORIZONTAL LIFESTYLE GALLERY (00:29 - 00:34)
  // ==========================================================================
  let isDraggingGallery = false;
  let galleryStartX = 0;
  let galleryOffset = 0;
  let targetGalleryOffset = 0;
  let galleryDragStartOffset = 0;

  galleryViewport.addEventListener('mouseenter', () => {
    showCursorPill(i18n[currentLang].drag);
  });

  galleryViewport.addEventListener('mouseleave', () => {
    isDraggingGallery = false;
    hideCursorPill();
  });

  galleryViewport.addEventListener('pointerdown', (e) => {
    isDraggingGallery = true;
    galleryStartX = e.clientX;
    galleryDragStartOffset = targetGalleryOffset;
    galleryViewport.setPointerCapture(e.pointerId);
  });

  galleryViewport.addEventListener('pointermove', (e) => {
    if (!isDraggingGallery) return;
    const dx = e.clientX - galleryStartX;
    const maxScroll = Math.max(0, galleryTrack.scrollWidth - window.innerWidth + 140);
    targetGalleryOffset = Math.max(-maxScroll, Math.min(80, galleryDragStartOffset + dx * 1.15));
  });

  galleryViewport.addEventListener('pointerup', () => {
    isDraggingGallery = false;
    const maxScroll = Math.max(0, galleryTrack.scrollWidth - window.innerWidth + 100);
    if (targetGalleryOffset > 0) targetGalleryOffset = 0;
    if (targetGalleryOffset < -maxScroll) targetGalleryOffset = -maxScroll;
  });

  function animateGalleryLoop() {
    if (currentView === 'product') {
      galleryOffset += (targetGalleryOffset - galleryOffset) * 0.1;
      galleryTrack.style.transform = `translate3d(${galleryOffset.toFixed(1)}px, 0, 0)`;
    }
    requestAnimationFrame(animateGalleryLoop);
  }

  // ==========================================================================
  // 5. CURSOR PILL, URL PREVIEW, LANGUAGE SWITCHER & MENU DRAWER
  // ==========================================================================
  function showCursorPill(text) {
    cursorPillText.textContent = text;
    cursorPill.classList.add('visible');
  }

  function hideCursorPill() {
    cursorPill.classList.remove('visible');
  }

  function showUrlPreview(slug) {
    const prefix = 'https://' + 'www.agrumeafarm.it/';
    urlPreview.textContent = `${prefix}${currentLang}/dispensa/${slug}`;
    urlPreview.classList.add('visible');
  }

  function hideUrlPreview() {
    urlPreview.classList.remove('visible');
  }

  // Language switcher (IT / EN)
  function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-it').classList.toggle('active', lang === 'it');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');

    document.getElementById('scroll-discover-indicator').textContent = i18n[lang].scrollToDiscover;
    document.getElementById('home-privacy-link').textContent = i18n[lang].privacyCookies;

    const textPath = document.querySelector('.wheel-curved-text textPath');
    if (textPath) {
      textPath.textContent = i18n[lang].wheelText;
    }

    if (currentView === 'product' && currentDetailProduct) {
      populateProductDetailContent(currentDetailProduct);
    }
  }

  document.getElementById('lang-it').addEventListener('click', () => setLanguage('it'));
  document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

  // Brand logo click -> Return to Home Orbital Carousel (with burgundy curtain wipe as at 00:35)
  document.getElementById('brand-logo').addEventListener('click', (e) => {
    e.preventDefault();
    closeMenuDrawer();
    returnToHomeView();
  });

  // Menu Drawer toggle
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBtnLabel = document.getElementById('menu-btn-label');

  function toggleMenuDrawer() {
    const isOpen = menuDrawer.classList.toggle('open');
    menuBtnLabel.textContent = isOpen ? i18n[currentLang].close : i18n[currentLang].menu;
  }

  function closeMenuDrawer() {
    menuDrawer.classList.remove('open');
    menuBtnLabel.textContent = i18n[currentLang].menu;
  }

  document.getElementById('menu-toggle-btn').addEventListener('click', toggleMenuDrawer);
  document.getElementById('menu-plus-btn').addEventListener('click', toggleMenuDrawer);

  // Navigation links in Menu Drawer & Footer
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.nav;
      closeMenuDrawer();
      if (target === 'home') {
        returnToHomeView();
      } else if (target === 'product') {
        openProductDetail(link.dataset.product, true);
      }
    });
  });

  document.getElementById('replay-preloader-btn').addEventListener('click', () => {
    closeMenuDrawer();
    runPhysicsPreloader();
  });

  // Initialize everything
  initOrbitalCarousel();
  animateOrbitalLoop();
  animateGalleryLoop();
  runPhysicsPreloader();
})();
