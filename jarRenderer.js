// High-DPI 3D Cylindrical Glass Jar & Studio Scene Renderer
// Renders photorealistic jars with 360-degree wraparound labels (front brand label + back 240g nutrition label),
// brushed silver lids, glass refraction highlights, and lifestyle gallery scenes.

(function () {
  const labelTextureCache = new Map();

  // Helper: Draw characteristic vector fruit silhouette
  function drawFruitSilhouette(ctx, type, x, y, radius, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;

    if (type === 'mulberry') {
      // Cluster of drupelets + stem matching Gelsi Neri artwork
      const offsets = [
        [0, -radius * 0.45], [-radius * 0.32, -radius * 0.3], [radius * 0.32, -radius * 0.3],
        [-radius * 0.42, 0], [0, 0], [radius * 0.42, 0],
        [-radius * 0.32, radius * 0.32], [0, radius * 0.35], [radius * 0.32, radius * 0.32],
        [-radius * 0.16, radius * 0.62], [radius * 0.16, radius * 0.62], [0, radius * 0.78]
      ];
      offsets.forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(ox, oy, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });
      // Stem
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, radius * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.65);
      ctx.quadraticCurveTo(radius * 0.15, -radius * 0.95, radius * 0.3, -radius * 0.9);
      ctx.stroke();
    } else if (type === 'pear') {
      // Pear silhouette matching Pere e Cannella card (00:58)
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.85);
      ctx.bezierCurveTo(radius * 0.38, -radius * 0.8, radius * 0.45, -radius * 0.3, radius * 0.68, radius * 0.15);
      ctx.bezierCurveTo(radius * 0.88, radius * 0.65, radius * 0.45, radius * 0.98, 0, radius * 0.95);
      ctx.bezierCurveTo(-radius * 0.45, radius * 0.98, -radius * 0.88, radius * 0.65, -radius * 0.68, radius * 0.15);
      ctx.bezierCurveTo(-radius * 0.45, -radius * 0.3, -radius * 0.38, -radius * 0.8, 0, -radius * 0.85);
      ctx.fill();
      // Stem
      ctx.fillRect(-radius * 0.06, -radius * 1.12, radius * 0.12, radius * 0.3);
    } else if (type === 'strawberry') {
      // Strawberry silhouette matching Fragole e Bacche Goji
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.9);
      ctx.bezierCurveTo(radius * 0.65, radius * 0.55, radius * 0.82, -radius * 0.2, radius * 0.52, -radius * 0.58);
      ctx.bezierCurveTo(radius * 0.25, -radius * 0.78, -radius * 0.25, -radius * 0.78, -radius * 0.52, -radius * 0.58);
      ctx.bezierCurveTo(-radius * 0.82, -radius * 0.2, -radius * 0.65, radius * 0.55, 0, radius * 0.9);
      ctx.fill();
      // Calyx leaves
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(i * radius * 0.18, -radius * 0.72, radius * 0.12, radius * 0.26, i * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'lemon') {
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.92, radius * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-radius * 0.94, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.arc(radius * 0.94, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'eggplant') {
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.12, radius * 0.58, radius * 0.88, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -radius * 0.75, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'pistachio') {
      // Overlapping pistachio leaves & kernels
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(i * radius * 0.38, 0, radius * 0.28, radius * 0.72, i * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Orange / Tomato round citrus silhouette with leaf
      ctx.beginPath();
      ctx.arc(0, radius * 0.08, radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(radius * 0.24, -radius * 0.78, radius * 0.32, radius * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Build wraparound 360-degree cylindrical label texture (Width: 1024, Height: 420)
  // Left half (0..512): Front Product Label
  // Right half (512..1024): Back Nutritional & Weight (240g) Label (as seen at 00:04, 00:18, 00:24)
  function getProductLabelTexture(product) {
    if (labelTextureCache.has(product.id)) {
      return labelTextureCache.get(product.id);
    }

    const tex = document.createElement('canvas');
    tex.width = 1024;
    tex.height = 420;
    const ctx = tex.getContext('2d');

    // Base label background
    ctx.fillStyle = product.labelBg;
    ctx.fillRect(0, 0, 1024, 420);

    // Subtle paper grain & decorative botanical silhouettes across label
    ctx.save();
    drawFruitSilhouette(ctx, product.fruitType, 120, 210, 145, product.labelSecondary, -0.25);
    drawFruitSilhouette(ctx, product.fruitType, 410, 120, 110, product.labelSecondary, 0.35);
    drawFruitSilhouette(ctx, product.fruitType, 450, 320, 95, product.labelSecondary, -0.4);
    drawFruitSilhouette(ctx, product.fruitType, 670, 270, 130, product.labelSecondary, 0.18);
    ctx.restore();

    // Small white/cream fruit emblem at bottom center of front label
    drawFruitSilhouette(ctx, product.fruitType, 256, 360, 22, product.labelTextColor, 0);

    // ========================================================================
    // FRONT LABEL (X = 40 .. 472, Center = 256)
    // ========================================================================
    ctx.fillStyle = product.labelTextColor;
    ctx.textAlign = 'center';

    // Top arched brand mark: AGRUMEA Farm
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('AGRUMEA', 256, 76);
    ctx.font = 'italic 600 23px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Farm', 256, 100);

    // Category line (e.g. CONFETTURA EXTRA DI)
    if (product.jarCategoryLine) {
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(product.jarCategoryLine, 256, 168);
    }

    // Main Product Title on Jar
    if (product.jarMainTitleLine2) {
      ctx.font = '500 54px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarMainTitle, 256, 198);
      ctx.fillText(product.jarMainTitleLine2, 256, 248);
    } else {
      ctx.font = '600 52px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarMainTitle, 256, 222);
    }

    // Subtitle on Jar (e.g. e Bacche Goji, Caponata Siciliana, Ibleo)
    if (product.jarSubTitle) {
      const lines = product.jarSubTitle.split('\n');
      ctx.font = 'italic 500 28px "Cormorant Garamond", Georgia, serif';
      lines.forEach((line, idx) => {
        ctx.fillText(line, 256, 266 + idx * 28);
      });
    }

    // Optional 100% badge
    if (product.jarBadge) {
      ctx.save();
      ctx.strokeStyle = product.labelTextColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(385, 345, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('100%', 385, 343);
      ctx.font = '400 8px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SICILIA', 385, 354);
      ctx.restore();
    }

    // ========================================================================
    // BACK NUTRITIONAL LABEL (X = 560 .. 980) — Matches Video 00:04, 00:18, 00:24
    // ========================================================================
    ctx.save();
    ctx.fillStyle = product.labelTextColor;
    ctx.textAlign = 'left';

    const backX = 590;
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('INGREDIENTI / INGREDIENTS:', backX, 68);

    ctx.font = '400 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Frutta selezionata siciliana, zucchero,', backX, 86);
    ctx.fillText('succo di limone, gelificante: pectina.', backX, 102);
    ctx.fillText('Frutta utilizzata: 85g x 100g', backX, 122);
    ctx.fillText('Zuccheri totali: 45g x 100g', backX, 138);

    // Nutrition divider line
    ctx.strokeStyle = product.labelTextColor;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(backX, 152);
    ctx.lineTo(backX + 290, 152);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VALORI NUTRIZIONALI MEDI PER 100g:', backX, 170);
    ctx.font = '400 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Energia / Energy: 789 kJ / 186 kcal', backX, 188);
    ctx.fillText('Grassi / Fat: 0.2 g  (di cui saturi: 0.0 g)', backX, 204);
    ctx.fillText('Carboidrati / Carbs: 45.0 g  (zuccheri: 42.0 g)', backX, 220);
    ctx.fillText('Proteine / Protein: 0.7 g   |   Sale / Salt: 0.02 g', backX, 236);

    ctx.font = '400 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Prodotto e confezionato da Agrumea Farm', backX, 268);
    ctx.fillText('Contrada Piana S. Croce - 96014 Floridia (SR) - Italy', backX, 282);

    // Bottom row of back label: agrumeafarm.it and 240g
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('agrumeafarm.it', backX, 344);

    ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('240g', backX + 145, 348);

    ctx.restore();

    labelTextureCache.set(product.id, tex);
    return tex;
  }

  // Helper: Draw a rounded path
  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Renders a photorealistic 3D cylindrical Agrumea Farm glass jar onto a target canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {Object} product - Product entry from window.AGRUMEA_PRODUCTS
   * @param {number} yawAngleRad - Rotation around vertical Y axis in radians (0 = front label centered, Math.PI = back 240g label centered)
   */
  function renderJar3D(canvas, product, yawAngleRad = 0) {
    if (!canvas || !product) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W * 0.5;
    const jarWidth = W * 0.62;
    const jarLeft = cx - jarWidth * 0.5;
    const jarTop = H * 0.14;
    const jarHeight = H * 0.78;
    const jarBottom = jarTop + jarHeight;

    const lidWidth = jarWidth * 0.92;
    const lidLeft = cx - lidWidth * 0.5;
    const lidTop = H * 0.055;
    const lidHeight = H * 0.105;

    // 1. GLASS BODY BASE & ORGANIC CONTENTS INSIDE JAR
    ctx.save();
    roundedRectPath(ctx, jarLeft, jarTop, jarWidth, jarHeight, jarWidth * 0.13);
    ctx.clip();

    // Rich internal preserve gradient
    const bodyGrad = ctx.createLinearGradient(jarLeft, jarTop, jarLeft + jarWidth, jarBottom);
    bodyGrad.addColorStop(0, product.jarContentsColor);
    bodyGrad.addColorStop(0.32, product.jarContentsHighlight);
    bodyGrad.addColorStop(0.7, product.jarContentsColor);
    bodyGrad.addColorStop(1, '#0F0708');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(jarLeft, jarTop, jarWidth, jarHeight);

    // Organic fruit chunks / seeds / texture visible inside glass shoulder & base
    ctx.save();
    for (let i = 0; i < 42; i++) {
      const seedAngle = (i * 1.37) + yawAngleRad * 0.8;
      const sx = cx + Math.sin(seedAngle) * (jarWidth * 0.42);
      const sy = jarTop + ((i * 29) % jarHeight);
      const sr = 4 + (i % 5) * 2.5;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 160, 0.18)' : 'rgba(15, 5, 5, 0.35)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, sr * 1.4, sr * 0.8, (i % 4) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Top shoulder shadow under the lid neck
    const neckShadow = ctx.createLinearGradient(0, jarTop, 0, jarTop + jarHeight * 0.18);
    neckShadow.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    neckShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
    neckShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neckShadow;
    ctx.fillRect(jarLeft, jarTop, jarWidth, jarHeight * 0.18);

    // Bottom thick glass base refraction
    const baseGlassGrad = ctx.createLinearGradient(0, jarBottom - jarHeight * 0.1, 0, jarBottom);
    baseGlassGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    baseGlassGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.16)');
    baseGlassGrad.addColorStop(0.8, 'rgba(20, 8, 8, 0.55)');
    baseGlassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.28)');
    ctx.fillStyle = baseGlassGrad;
    ctx.fillRect(jarLeft, jarBottom - jarHeight * 0.1, jarWidth, jarHeight * 0.1);

    // 2. 3D CYLINDRICAL WRAPAROUND LABEL PROJECTION
    const labelTex = getProductLabelTexture(product);
    const labelTop = jarTop + jarHeight * 0.165;
    const labelHeight = jarHeight * 0.70;
    const radius = jarWidth * 0.5;
    const strips = 56; // High-resolution cylindrical strips

    for (let i = 0; i < strips; i++) {
      const t0 = i / strips;
      const t1 = (i + 1) / strips;
      // Map strip across visible front hemisphere [-PI/2 .. +PI/2]
      const theta0 = -Math.PI * 0.485 + t0 * (Math.PI * 0.97);
      const theta1 = -Math.PI * 0.485 + t1 * (Math.PI * 0.97);

      const x0 = cx + Math.sin(theta0) * radius;
      const x1 = cx + Math.sin(theta1) * radius;
      const stripW = Math.max(1.5, x1 - x0 + 0.9);

      // Texture UV coordinate wrapping around [0 .. 1]
      const thetaMid = (theta0 + theta1) * 0.5 + yawAngleRad;
      let u = (thetaMid / (Math.PI * 2)) + 0.25;
      u = ((u % 1) + 1) % 1;

      const srcX = Math.floor(u * (labelTex.width - 4));
      const srcW = Math.max(2, Math.ceil(labelTex.width / (strips * 1.8)));

      // Vertical cylindrical curvature perspective (subtle barrel curve)
      const cosTheta = Math.cos((theta0 + theta1) * 0.5);
      const curveOffsetY = (1 - cosTheta) * (jarHeight * 0.018);

      ctx.drawImage(
        labelTex,
        srcX, 0, srcW, labelTex.height,
        x0, labelTop + curveOffsetY, stripW, labelHeight
      );
    }

    // 3. CYLINDRICAL LIGHTING & SPECULAR GLASS HIGHLIGHTS OVER LABEL & GLASS
    const cylShade = ctx.createLinearGradient(jarLeft, 0, jarLeft + jarWidth, 0);
    cylShade.addColorStop(0.0, 'rgba(18, 8, 8, 0.52)');
    cylShade.addColorStop(0.12, 'rgba(255, 255, 255, 0.22)');
    cylShade.addColorStop(0.22, 'rgba(255, 255, 255, 0.04)');
    cylShade.addColorStop(0.55, 'rgba(0, 0, 0, 0.0)');
    cylShade.addColorStop(0.84, 'rgba(0, 0, 0, 0.26)');
    cylShade.addColorStop(0.93, 'rgba(255, 255, 255, 0.16)');
    cylShade.addColorStop(1.0, 'rgba(12, 5, 5, 0.58)');
    ctx.fillStyle = cylShade;
    ctx.fillRect(jarLeft, jarTop, jarWidth, jarHeight);

    // Crisp left vertical studio softbox reflection bar on glass shoulder & bottom
    const leftSpecGrad = ctx.createLinearGradient(0, jarTop, 0, jarBottom);
    leftSpecGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    leftSpecGrad.addColorStop(0.16, 'rgba(255, 255, 255, 0.35)');
    leftSpecGrad.addColorStop(0.17, 'rgba(255, 255, 255, 0.07)');
    leftSpecGrad.addColorStop(0.86, 'rgba(255, 255, 255, 0.07)');
    leftSpecGrad.addColorStop(0.88, 'rgba(255, 255, 255, 0.38)');
    leftSpecGrad.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
    ctx.fillStyle = leftSpecGrad;
    ctx.fillRect(jarLeft + jarWidth * 0.11, jarTop + 6, jarWidth * 0.065, jarHeight - 12);

    ctx.restore(); // End jar body clip

    // 4. BRUSHED ALUMINUM / SILVER METALLIC LID
    ctx.save();
    roundedRectPath(ctx, lidLeft, lidTop, lidWidth, lidHeight, 8);
    const lidGrad = ctx.createLinearGradient(lidLeft, 0, lidLeft + lidWidth, 0);
    lidGrad.addColorStop(0.0, '#7B7E82');
    lidGrad.addColorStop(0.09, '#D8DCDF');
    lidGrad.addColorStop(0.22, '#FFFFFF');
    lidGrad.addColorStop(0.36, '#B8BCC0');
    lidGrad.addColorStop(0.55, '#8E9297');
    lidGrad.addColorStop(0.76, '#E4E7EA');
    lidGrad.addColorStop(0.90, '#9B9FA4');
    lidGrad.addColorStop(1.0, '#5A5D61');
    ctx.fillStyle = lidGrad;
    ctx.fill();

    // Top bevel & bottom rim lip on silver lid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(lidLeft + 6, lidTop + 2, lidWidth - 12, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(lidLeft + 2, lidTop + lidHeight - 5, lidWidth - 4, 4);
    ctx.restore();
  }

  /**
   * Renders a rich lifestyle/studio photography scene for the horizontal draggable gallery
   * matching the scenes in the recording (00:29 - 00:34, 00:44 - 00:54).
   */
  function renderGalleryScene(canvas, product, sceneIndex) {
    if (!canvas || !product) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.save();

    if (sceneIndex === 0) {
      // SCENE 1: Macro Hero — Jar on textured dark pedestal cube surrounded by fresh fruits & leaves (00:29, 00:50)
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.4, 40, W * 0.5, H * 0.5, W * 0.7);
      bgGrad.addColorStop(0, product.labelBg === '#191C36' ? '#25263A' : '#6D1A26');
      bgGrad.addColorStop(1, product.labelBg === '#191C36' ? '#12131F' : '#2C090E');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Studio table surface
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, H * 0.76, W, H * 0.24);

      // 3D Architectural Pedestal Cube under jar
      const cubeW = W * 0.26;
      const cubeH = H * 0.36;
      const cubeX = W * 0.5 - cubeW * 0.5;
      const cubeY = H * 0.52;
      ctx.fillStyle = product.labelBg === '#191C36' ? '#362742' : '#581322';
      ctx.fillRect(cubeX, cubeY, cubeW, cubeH);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(cubeX, cubeY);
      ctx.lineTo(cubeX + 24, cubeY - 16);
      ctx.lineTo(cubeX + cubeW + 24, cubeY - 16);
      ctx.lineTo(cubeX + cubeW, cubeY);
      ctx.closePath();
      ctx.fill();

      // Scattered fresh fruits around pedestal base
      for (let i = 0; i < 16; i++) {
        const fx = W * 0.24 + (i * 37) % (W * 0.52);
        const fy = H * 0.76 + (i % 4) * 18;
        drawFruitSilhouette(ctx, product.fruitType, fx, fy, 20 + (i % 3) * 4, product.jarContentsColor, i * 0.4);
      }

      // Fresh green botanical leaf accent
      ctx.fillStyle = '#3B6E2C';
      ctx.beginPath();
      ctx.ellipse(cubeX + cubeW * 0.88, cubeY + cubeH * 0.72, 42, 24, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Render 3D Jar perched atop pedestal
      const offJar = document.createElement('canvas');
      offJar.width = 340;
      offJar.height = 440;
      renderJar3D(offJar, product, 0.08);
      ctx.drawImage(offJar, W * 0.5 - 118, cubeY - 265, 236, 305);

    } else if (sceneIndex === 1) {
      // SCENE 2: Close-up Nestled in Natural Harvest / Bark / Fresh Fruit Bed (00:33, 00:45)
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#2B2018');
      bgGrad.addColorStop(0.5, '#3E2D20');
      bgGrad.addColorStop(1, '#1A120D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Rich organic texture of fruits/bark surrounding the jar
      for (let i = 0; i < 48; i++) {
        const fx = (i * 73) % W;
        const fy = H * 0.25 + ((i * 53) % (H * 0.75));
        const col = i % 3 === 0 ? product.jarContentsHighlight : (i % 2 === 0 ? product.jarContentsColor : '#1E1510');
        drawFruitSilhouette(ctx, product.fruitType, fx, fy, 28 + (i % 4) * 8, col, i * 0.6);
      }

      // Soft vignette
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.15, W * 0.5, H * 0.5, W * 0.65);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // Large Hero Jar in Center
      const offJar = document.createElement('canvas');
      offJar.width = 420;
      offJar.height = 540;
      renderJar3D(offJar, product, -0.05);
      ctx.drawImage(offJar, W * 0.5 - 165, H * 0.5 - 215, 330, 430);

    } else {
      // SCENE 3: Sicilian Culinary Pairing — Warm Croissant / Artisanal Bread Dipping into Open Preserve (00:47, 00:52)
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 50, W * 0.5, H * 0.5, W * 0.75);
      bgGrad.addColorStop(0, '#9E131B');
      bgGrad.addColorStop(1, '#3D060A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Ceramic plate at bottom
      ctx.fillStyle = '#B8292F';
      ctx.beginPath();
      ctx.ellipse(W * 0.52, H * 0.83, W * 0.28, H * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render Jar on plate
      const offJar = document.createElement('canvas');
      offJar.width = 360;
      offJar.height = 460;
      renderJar3D(offJar, product, 0.0);
      ctx.drawImage(offJar, W * 0.5 - 115, H * 0.43, 230, 295);

      // Golden flaky croissant / rustic bread above jar dripping preserve
      ctx.save();
      ctx.translate(W * 0.47, H * 0.23);
      ctx.rotate(-0.28);
      const breadGrad = ctx.createLinearGradient(-90, -50, 90, 60);
      breadGrad.addColorStop(0, '#E39B46');
      breadGrad.addColorStop(0.5, '#C47222');
      breadGrad.addColorStop(1, '#7A3E0C');
      ctx.fillStyle = breadGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 95, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      // Glossy preserve drip from croissant tip
      ctx.fillStyle = product.jarContentsHighlight;
      ctx.beginPath();
      ctx.arc(38, 46, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(44, 86, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders the animated fruit silhouette pattern inside a "The Other Products" card on hover (00:57 - 01:00).
   */
  function renderCardFruitPattern(canvas, product) {
    if (!canvas || !product) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 340;
    const H = canvas.height = 420;

    ctx.fillStyle = product.hoverCardBg;
    ctx.fillRect(0, 0, W, H);

    const positions = [
      { x: 52, y: 78, r: 54, rot: -0.35 },
      { x: 165, y: 55, r: 58, rot: 0.22 },
      { x: 285, y: 115, r: 52, rot: 0.48 },
      { x: 64, y: 210, r: 56, rot: 0.15 },
      { x: 268, y: 255, r: 60, rot: -0.28 },
      { x: 88, y: 345, r: 58, rot: -0.42 },
      { x: 210, y: 360, r: 55, rot: 0.32 }
    ];

    positions.forEach((p) => {
      drawFruitSilhouette(ctx, product.fruitType, p.x, p.y, p.r, product.hoverFruitColor, p.rot);
    });
  }

  window.AgrumeaJarRenderer = {
    renderJar3D,
    renderGalleryScene,
    renderCardFruitPattern,
    drawFruitSilhouette
  };
})();
