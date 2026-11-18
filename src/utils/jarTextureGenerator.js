// High-DPI Photorealistic Texture & Scene Generator for Three.js 3D Jar Meshes,
// Preserve Contents, Matter.js Rigid-Body Fruit Silhouettes, and Studio Gallery Scenes

const labelCanvasCache = new Map();
const preserveCanvasCache = new Map();

export function drawFruitSilhouette(ctx, type, x, y, radius, color, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;

  if (type === 'mulberry') {
    // Rich scalloped berry silhouette + spiky calyx leaves matching Gelsi Neri (frame_018.jpg, frame_058.jpg)
    const lobes = 14;
    ctx.beginPath();
    for (let i = 0; i < lobes; i++) {
      const a = (i / lobes) * Math.PI * 2;
      const lx = Math.cos(a) * radius * 0.56;
      const ly = Math.sin(a) * radius * 0.68 + radius * 0.08;
      ctx.moveTo(lx + radius * 0.26, ly);
      ctx.arc(lx, ly, radius * 0.26, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.08, radius * 0.54, radius * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spiky top calyx leaves matching Gelsi Neri artwork
    for (let i = -3; i <= 3; i++) {
      ctx.save();
      ctx.translate(0, -radius * 0.52);
      ctx.rotate(i * 0.26);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.08, 0);
      ctx.lineTo(0, -radius * 0.44);
      ctx.lineTo(radius * 0.08, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'pear') {
    // Pear silhouette matching Pere e Cannella (frame_060.jpg)
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.85);
    ctx.bezierCurveTo(radius * 0.38, -radius * 0.8, radius * 0.45, -radius * 0.3, radius * 0.68, radius * 0.15);
    ctx.bezierCurveTo(radius * 0.88, radius * 0.65, radius * 0.45, radius * 0.98, 0, radius * 0.95);
    ctx.bezierCurveTo(-radius * 0.45, radius * 0.98, -radius * 0.88, radius * 0.65, -radius * 0.68, radius * 0.15);
    ctx.bezierCurveTo(-radius * 0.45, -radius * 0.3, -radius * 0.38, -radius * 0.8, 0, -radius * 0.85);
    ctx.fill();
    // Curved stem
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2.5, radius * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.82);
    ctx.quadraticCurveTo(radius * 0.08, -radius * 1.12, radius * 0.24, -radius * 1.18);
    ctx.stroke();
  } else if (type === 'strawberry') {
    // Strawberry silhouette matching Fragole e Bacche Goji (scroll_021.jpg)
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.92);
    ctx.bezierCurveTo(radius * 0.68, radius * 0.55, radius * 0.84, -radius * 0.2, radius * 0.54, -radius * 0.58);
    ctx.bezierCurveTo(radius * 0.25, -radius * 0.78, -radius * 0.25, -radius * 0.78, -radius * 0.54, -radius * 0.58);
    ctx.bezierCurveTo(-radius * 0.84, -radius * 0.2, -radius * 0.68, radius * 0.55, 0, radius * 0.92);
    ctx.fill();
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * radius * 0.18, -radius * 0.74, radius * 0.11, radius * 0.28, i * 0.36, 0, Math.PI * 2);
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
    // Baroque eggplant/tomato silhouette matching Sinfonia Barocca (scroll_004.jpg)
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.1, radius * 0.78, radius * 0.68, -0.1, 0, Math.PI * 2);
    ctx.fill();
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(-radius * 0.08, -radius * 0.54);
      ctx.rotate(i * 0.35);
      ctx.beginPath();
      ctx.ellipse(0, -radius * 0.22, radius * 0.08, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'pistachio') {
    // Bold botanical pistachio leaf & kernel cutouts matching Smeralda (frame_015.jpg)
    ctx.beginPath();
    ctx.ellipse(-radius * 0.35, 0, radius * 0.28, radius * 0.78, -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(radius * 0.32, radius * 0.08, radius * 0.26, radius * 0.72, 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -radius * 0.45, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'onion') {
    // Bulbous Sicilian onion silhouette matching Cipolla in Agrodolce (frame_018.jpg)
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.14, radius * 0.78, radius * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-radius * 0.22, -radius * 0.42);
    ctx.quadraticCurveTo(0, -radius * 0.98, 0, -radius * 1.05);
    ctx.quadraticCurveTo(0, -radius * 0.98, radius * 0.22, -radius * 0.42);
    ctx.closePath();
    ctx.fill();
  } else {
    // Orange / Tomato silhouette with leaf
    ctx.beginPath();
    ctx.arc(0, radius * 0.08, radius * 0.76, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(radius * 0.24, -radius * 0.76, radius * 0.32, radius * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Generates a realistic procedural texture for the inner preserve core visible through the
 * exposed glass shoulder above the label and the glass base below the label (scroll_004.jpg, scroll_016.jpg).
 */
export function createPreserveTextureCanvas(product) {
  if (typeof document === 'undefined') return null;
  if (preserveCanvasCache.has(product.id)) {
    return preserveCanvasCache.get(product.id);
  }

  const canvas = document.createElement('canvas');
  const W = (canvas.width = 512);
  const H = (canvas.height = 512);
  const ctx = canvas.getContext('2d');

  // Rich base preserve gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, product.jarContentsColor);
  grad.addColorStop(0.25, product.jarContentsHighlight);
  grad.addColorStop(0.75, product.jarContentsColor);
  grad.addColorStop(1, '#120705');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const style = product.preserveStyle || 'berry-jam';

  if (style === 'chunky-caponata') {
    // Diced eggplant, yellow/red peppers, green olives & capers (Sinfonia Barocca, scroll_004.jpg)
    const palette = ['#D98A2B', '#B8321A', '#5E6E28', '#361822', '#E5AC46', '#7A2814'];
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = palette[i % palette.length];
      const x = (i * 79) % W;
      const y = (i * 47) % H;
      const rw = 10 + (i % 4) * 6;
      const rh = 8 + ((i * 3) % 4) * 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * 0.7) % Math.PI);
      ctx.beginPath();
      ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 3);
      ctx.fill();
      ctx.restore();
    }
  } else if (style === 'crushed-pesto') {
    // Sun-dried red tomatoes with golden-white crushed Sicilian almond specks (Pesto Rosso, scroll_016.jpg)
    for (let i = 0; i < 340; i++) {
      const x = (i * 67) % W;
      const y = (i * 43) % H;
      if (i % 4 === 0) {
        // Crushed almond fleck
        ctx.fillStyle = 'rgba(248, 224, 176, 0.85)';
        ctx.beginPath();
        ctx.ellipse(x, y, 4 + (i % 3) * 2, 2.5 + (i % 2) * 1.5, i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = i % 2 === 0 ? '#B82312' : '#5E0E06';
        ctx.beginPath();
        ctx.arc(x, y, 6 + (i % 5) * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (style === 'caramelized-onion') {
    // Golden-amber caramelized onion ribbons (Cipolla in Agrodolce, frame_018.jpg)
    const palette = ['#C88A32', '#9E5818', '#DFAC52', '#5C2C0C'];
    for (let i = 0; i < 240; i++) {
      ctx.strokeStyle = palette[i % palette.length];
      ctx.lineWidth = 4 + (i % 3) * 2;
      const x = (i * 61) % W;
      const y = (i * 37) % H;
      ctx.beginPath();
      ctx.arc(x, y, 10 + (i % 4) * 4, 0.2, 2.2);
      ctx.stroke();
    }
  } else if (style === 'smooth-cream') {
    // Velvety roasted pistachio cream with subtle nutty micro-specks (Smeralda, frame_015.jpg)
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(165, 182, 78, 0.35)' : 'rgba(55, 68, 18, 0.35)';
      ctx.beginPath();
      ctx.ellipse((i * 83) % W, (i * 53) % H, 18, 6, (i % 3) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Glossy fruit jam with organic berry seeds & pulp (Gelsi Neri, Fragole, Arance, Pere)
    for (let i = 0; i < 260; i++) {
      const x = (i * 71) % W;
      const y = (i * 41) % H;
      if (i % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 220, 185, 0.22)';
        ctx.beginPath();
        ctx.ellipse(x, y, 2.2, 1.3, i * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(10, 4, 6, 0.42)';
        ctx.beginPath();
        ctx.arc(x, y, 5 + (i % 4) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Dark shadow Band at very top under the lid neck
  const topShadow = ctx.createLinearGradient(0, 0, 0, 95);
  topShadow.addColorStop(0, 'rgba(8, 3, 3, 0.82)');
  topShadow.addColorStop(0.5, 'rgba(12, 5, 5, 0.35)');
  topShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topShadow;
  ctx.fillRect(0, 0, W, 95);

  preserveCanvasCache.set(product.id, canvas);
  return canvas;
}

/**
 * Helper to draw the arched "AGRUMEA" + italic "Farm" header on jar labels
 */
function drawAgrumeaHeader(ctx, centerX, topY, color, scale = 1) {
  ctx.save();
  ctx.translate(centerX, topY);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';

  // Gentle arch effect for AGRUMEA letters
  const letters = ['A', 'G', 'R', 'U', 'M', 'E', 'A'];
  const offsetsX = [-66, -44, -22, 0, 23, 45, 66];
  const offsetsY = [5, 2, 0.5, 0, 0.5, 2, 5];
  const tilts = [-0.11, -0.07, -0.03, 0, 0.03, 0.07, 0.11];

  ctx.font = '700 34px "Cormorant Garamond", Georgia, serif';
  letters.forEach((ch, idx) => {
    ctx.save();
    ctx.translate(offsetsX[idx], offsetsY[idx]);
    ctx.rotate(tilts[idx]);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  ctx.font = 'italic 600 28px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Farm', 0, 27);
  ctx.restore();
}

/**
 * Helper to draw the authentic right-side disposal & weight panel (`RACCOLTA DIFFERENZIATA` + `240g`)
 * seen in Untitled.mov (`scroll_001.jpg`, `frame_005.jpg`, `frame_019.jpg`, `frame_024.jpg`).
 */
function drawSideDisposalAndWeightColumn(ctx, xLeft, topColor, bottomColor, isSplit) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = isSplit ? topColor : bottomColor;

  ctx.font = '700 13.5px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('RACCOLTA DIFFERENZIATA,', xLeft, 64);
  ctx.fillText('VERIFICA LE DISPOSIZIONI', xLeft, 82);
  ctx.fillText('DEL TUO COMUNE.', xLeft, 100);

  ctx.font = '500 13px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Vaso (GL 70) Vetro', xLeft, 122);
  ctx.fillText('Capsula (C/FE 91) Acciaio', xLeft, 140);

  // Small recycling person & bin icon on the right of the disposal block
  ctx.save();
  ctx.translate(xLeft + 215, 118);
  ctx.fillStyle = isSplit ? topColor : bottomColor;
  ctx.beginPath();
  ctx.arc(0, -14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-5, -7, 10, 18);
  ctx.strokeStyle = isSplit ? topColor : bottomColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(12, -2, 10, 14);
  ctx.restore();

  ctx.font = '400 12.5px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Prodotto e confezionato:', xLeft, 174);
  ctx.fillText('Azienda agricola Sebastiano', xLeft, 192);
  ctx.fillText('Piazza - Seconda strada c.da', xLeft, 210);
  ctx.fillText('piana s. Croce, sn - 96014', xLeft, 228);
  ctx.fillText('Floridia (SR)', xLeft, 246);

  // Bottom row: agrumeafarm.it and large serif 240g
  ctx.fillStyle = bottomColor;
  ctx.font = '500 15px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('agrumeafarm.it', xLeft, 368);

  ctx.font = '400 46px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('240g', xLeft + 135, 366);

  ctx.restore();
}

/**
 * Helper to draw the left-back Ingredients & Nutrition column (`frame_024.jpg`)
 */
function drawBackIngredientsColumn(ctx, xLeft, textColor) {
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';

  ctx.font = '500 15px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Gelsi neri, zucchero, succo di limone,', xLeft, 76);
  ctx.fillText('gelificante: pectina.', xLeft, 96);
  ctx.fillText('Frutta utilizzata: 50g x 100g', xLeft, 122);
  ctx.fillText('di prodotto finito', xLeft, 142);
  ctx.fillText('Zuccheri totali: 45g x 100g', xLeft, 164);

  ctx.font = '500 14px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Può contenere cereali contenenti glutine,', xLeft, 198);
  ctx.fillText('soia, latte, senape, sesamo, frutta a', xLeft, 218);
  ctx.fillText('guscio, lupini, arachidi.', xLeft, 238);

  ctx.font = '400 13.5px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Conservare in luogo fresco e asciutto, al', xLeft, 266);
  ctx.fillText('riparo da fonti di calore e raggi solari', xLeft, 284);
  ctx.fillText('diretti. Dopo l’apertura conservare in frigo.', xLeft, 302);

  // Nutrition mini-box at bottom
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.65;
  ctx.strokeRect(xLeft, 330, 310, 150);
  ctx.globalAlpha = 1;

  ctx.font = '700 13px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Valori nutrizionali medi per 100g', xLeft + 12, 354);
  ctx.font = '400 12.5px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('Energia / Energy: 789 kJ / 186 kcal', xLeft + 12, 378);
  ctx.fillText('Grassi / Fat: 0.2 g  (di cui saturi: 0.0 g)', xLeft + 12, 400);
  ctx.fillText('Carboidrati / Carbs: 45.0 g (zuccheri: 42.0 g)', xLeft + 12, 422);
  ctx.fillText('Proteine / Protein: 0.7 g  |  Sale: 0.02 g', xLeft + 12, 444);

  ctx.restore();
}

/**
 * Creates an undistorted 1:1 cylindrical aspect-ratio 360-degree wraparound label canvas (2048 x 556).
 * UV mapping with labelMesh.rotation.y = -Math.PI * 0.5:
 * - Front label center: u = 0.25 -> X = 512 (faces +Z camera directly at yawAngle = 0)
 * - Right-side disposal & 240g panel: u = 0.44..0.62 -> X = 890..1260 (peeks into view on hover at frame_019.jpg!)
 * - Back ingredients panel: u = 0.70..0.92 -> X = 1440..1880 (visible during spin at frame_024.jpg!)
 */
export function createProductLabelCanvas(product) {
  if (typeof document === 'undefined') return null;
  if (labelCanvasCache.has(product.id)) {
    return labelCanvasCache.get(product.id);
  }

  const W = 2048;
  const H = 556;
  const tex = document.createElement('canvas');
  tex.width = W;
  tex.height = H;
  const ctx = tex.getContext('2d');

  const frontCenterX = 512; // u = 0.25 (Front face center +Z)
  const isSplit = product.labelLayout === 'split';

  if (isSplit) {
    // =========================================================================
    // TYPE A: TWO-TONE SPLIT BAND LABEL (Sinfonia Barocca, Pesto Rosso, Smeralda, Cipolla)
    // Matches scroll_004.jpg, scroll_016.jpg, frame_015.jpg, frame_018.jpg
    // =========================================================================
    const splitY = 286;

    // 1. Top Band Background
    ctx.fillStyle = product.labelTopBg;
    ctx.fillRect(0, 0, W, splitY);

    // 2. Bottom Band Background
    ctx.fillStyle = product.labelBottomBg;
    ctx.fillRect(0, splitY, W, H - splitY);

    // 3. Botanical Silhouettes clipped inside the Top Band
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, splitY);
    ctx.clip();

    if (product.id === 'smeralda') {
      // Bold dark-green pistachio botanical shapes across top green band (frame_015.jpg)
      drawFruitSilhouette(ctx, 'pistachio', frontCenterX - 150, 170, 145, product.labelSecondary, -0.2);
      drawFruitSilhouette(ctx, 'pistachio', frontCenterX + 20, 210, 155, product.labelSecondary, 0.25);
      drawFruitSilhouette(ctx, 'pistachio', frontCenterX + 195, 130, 140, product.labelSecondary, -0.15);
      drawFruitSilhouette(ctx, 'pistachio', 180, 160, 135, product.labelSecondary, 0.3);
      drawFruitSilhouette(ctx, 'pistachio', 1120, 180, 145, product.labelSecondary, -0.25);
    } else {
      // Large botanical silhouettes in top band (Sinfonia Barocca, Pesto Rosso, Cipolla)
      drawFruitSilhouette(ctx, product.fruitType, frontCenterX - 30, 205, 148, product.labelSecondary, -0.15);
      drawFruitSilhouette(ctx, product.fruitType, frontCenterX + 185, 155, 135, product.labelSecondary, 0.28);
      drawFruitSilhouette(ctx, product.fruitType, frontCenterX - 230, 135, 120, product.labelSecondary, 0.22);
      drawFruitSilhouette(ctx, product.fruitType, 1080, 185, 140, product.labelSecondary, -0.2);
    }
    ctx.restore();

    // 4. Crisp horizontal separator line between Top and Bottom bands
    ctx.fillStyle = product.labelDividerColor || '#FBF3E8';
    ctx.fillRect(0, splitY - 2, W, 4);

    // 5. Arched "AGRUMEA Farm" in Top Band
    drawAgrumeaHeader(ctx, frontCenterX - 25, 76, product.labelTopTextColor || product.labelTextColor, 1.05);

    // 6. Main Serif Product Title & Subtitle in Bottom Band (left-aligned editorial block matching scroll_004.jpg & scroll_016.jpg)
    ctx.save();
    ctx.fillStyle = product.labelTextColor;
    ctx.textAlign = 'left';
    const titleLeftX = frontCenterX - 155;

    if (product.jarMainTitleLine2) {
      ctx.font = '700 68px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarMainTitle, titleLeftX, splitY + 82);
      ctx.fillText(product.jarMainTitleLine2, titleLeftX, splitY + 148);
      if (product.jarSubTitle) {
        ctx.font = 'italic 500 32px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(product.jarSubTitle, titleLeftX, splitY + 194);
      }
    } else {
      ctx.font = '700 66px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarMainTitle, titleLeftX - 20, splitY + 95);
      if (product.jarSubTitle) {
        const lines = product.jarSubTitle.split('\n');
        ctx.font = 'italic 500 31px "Cormorant Garamond", Georgia, serif';
        lines.forEach((line, idx) => {
          ctx.fillText(line, titleLeftX - 5, splitY + 142 + idx * 34);
        });
      }
    }
    ctx.restore();

    // 7. Side Disposal & 240g Column (X = 875) + Back Ingredients Column (X = 1420)
    drawSideDisposalAndWeightColumn(
      ctx,
      875,
      product.labelTopTextColor || '#3B1D1A',
      product.labelTextColor,
      true
    );
    drawBackIngredientsColumn(ctx, 1420, product.labelTextColor);
  } else {
    // =========================================================================
    // TYPE B: FULL-BLEED BOTANICAL SILHOUETTE JAM LABEL (Gelsi Neri, Fragole, Arance, Pere)
    // Matches frame_018.jpg, scroll_021.jpg, scroll_004.jpg, frame_060.jpg
    // =========================================================================
    ctx.fillStyle = product.labelBg;
    ctx.fillRect(0, 0, W, H);

    // 1. Large Full-Bleed Fruit Silhouettes across the label matching Gelsi Neri & Fragole
    ctx.save();
    // Central/left hero silhouette behind title
    drawFruitSilhouette(ctx, product.fruitType, frontCenterX - 35, 290, 175, product.labelSecondary, -0.14);
    // Upper-left & upper-right flanking silhouettes
    drawFruitSilhouette(ctx, product.fruitType, frontCenterX - 255, 115, 130, product.labelSecondary, 0.28);
    drawFruitSilhouette(ctx, product.fruitType, frontCenterX + 225, 125, 138, product.labelSecondary, 0.32);
    // Lower-right silhouette
    drawFruitSilhouette(ctx, product.fruitType, frontCenterX + 205, 430, 145, product.labelSecondary, -0.25);
    // Side/back silhouettes
    drawFruitSilhouette(ctx, product.fruitType, 1140, 320, 165, product.labelSecondary, 0.18);
    drawFruitSilhouette(ctx, product.fruitType, 1890, 260, 150, product.labelSecondary, -0.22);
    ctx.restore();

    // 2. Arched "AGRUMEA Farm" at top center of front label
    drawAgrumeaHeader(ctx, frontCenterX, 74, product.labelTextColor, 1.05);

    // 3. Category line, Giant Serif Title, and Italic Subtitle
    ctx.save();
    ctx.fillStyle = product.labelTextColor;
    ctx.textAlign = 'center';

    if (product.jarCategoryLine) {
      ctx.font = '500 21px "Cormorant Garamond", Georgia, serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(product.jarCategoryLine, frontCenterX, 232);
      ctx.letterSpacing = '0px';
    }

    ctx.font = '700 84px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(product.jarMainTitle, frontCenterX, 308);

    if (product.jarSubTitle) {
      ctx.font = 'italic 600 44px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarSubTitle, frontCenterX, 356);
    }

    // 4. Small white/cream fruit emblem at bottom center of front label (frame_018.jpg, scroll_021.jpg)
    drawFruitSilhouette(ctx, product.fruitType, frontCenterX - 8, 468, 28, product.labelTextColor, 0.08);

    // 5. Optional circular "Bio" badge on Arance a fette (scroll_004.jpg)
    if (product.jarBadge) {
      const sealX = frontCenterX + 118;
      const sealY = 446;
      ctx.save();
      ctx.strokeStyle = product.labelTextColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sealX, sealY, 30, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.font = 'italic 700 24px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(product.jarBadge, sealX, sealY + 8);
      ctx.restore();
    }
    ctx.restore();

    // 6. Side Disposal & 240g Column (X = 875) + Back Ingredients Column (X = 1420)
    drawSideDisposalAndWeightColumn(
      ctx,
      875,
      product.labelTextColor,
      product.labelTextColor,
      false
    );
    drawBackIngredientsColumn(ctx, 1420, product.labelTextColor);
  }

  // Subtle top & bottom paper edge highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillRect(0, 0, W, 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(0, H - 3, W, 3);

  labelCanvasCache.set(product.id, tex);
  return tex;
}

/**
 * Renders the studio backdrop for the 3 draggable lifestyle gallery slides in ProductDetail.
 */
export function renderGallerySceneBackdrop(canvas, product, sceneIndex) {
  if (!canvas || !product) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (sceneIndex === 0) {
    // SCENE 1: Macro Hero — Jar on architectural pedestal cube surrounded by fresh fruits & leaves (frame_035.jpg)
    const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.4, 40, W * 0.5, H * 0.5, W * 0.7);
    bgGrad.addColorStop(0, product.labelBg === '#181B2E' ? '#25263A' : '#6D1A26');
    bgGrad.addColorStop(1, product.labelBg === '#181B2E' ? '#12131F' : '#2C090E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(0, H * 0.76, W, H * 0.24);

    const cubeW = W * 0.28;
    const cubeH = H * 0.34;
    const cubeX = W * 0.5 - cubeW * 0.5;
    const cubeY = H * 0.64;
    ctx.fillStyle = product.labelBg === '#181B2E' ? '#362742' : '#581322';
    ctx.fillRect(cubeX, cubeY, cubeW, cubeH);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(cubeX, cubeY);
    ctx.lineTo(cubeX + 24, cubeY - 16);
    ctx.lineTo(cubeX + cubeW + 24, cubeY - 16);
    ctx.lineTo(cubeX + cubeW, cubeY);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 18; i++) {
      const fx = W * 0.22 + ((i * 39) % (W * 0.56));
      const fy = H * 0.76 + (i % 4) * 16;
      drawFruitSilhouette(ctx, product.fruitType, fx, fy, 20 + (i % 3) * 4, product.jarContentsHighlight, i * 0.4);
    }

    ctx.fillStyle = '#3B6E2C';
    ctx.beginPath();
    ctx.ellipse(cubeX + cubeW * 0.88, cubeY + cubeH * 0.35, 42, 22, 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (sceneIndex === 1) {
    // SCENE 2: Close-up Nestled in Natural Harvest / Bark Bed (frame_056.jpg)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#2B2018');
    bgGrad.addColorStop(0.5, '#3E2D20');
    bgGrad.addColorStop(1, '#1A120D');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 48; i++) {
      const fx = (i * 73) % W;
      const fy = H * 0.18 + ((i * 53) % (H * 0.82));
      const col = i % 3 === 0 ? product.jarContentsHighlight : i % 2 === 0 ? product.jarContentsColor : '#1E1510';
      drawFruitSilhouette(ctx, product.fruitType, fx, fy, 28 + (i % 4) * 8, col, i * 0.6);
    }

    const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.15, W * 0.5, H * 0.5, W * 0.65);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  } else {
    // SCENE 3: Sicilian Culinary Pairing — Ceramic Plate & Warm Brioche
    const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 50, W * 0.5, H * 0.5, W * 0.75);
    bgGrad.addColorStop(0, '#9E131B');
    bgGrad.addColorStop(1, '#3D060A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#B8292F';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.82, W * 0.28, H * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(W * 0.34, H * 0.22);
    ctx.rotate(-0.24);
    const breadGrad = ctx.createLinearGradient(-90, -50, 90, 60);
    breadGrad.addColorStop(0, '#E39B46');
    breadGrad.addColorStop(0.5, '#C47222');
    breadGrad.addColorStop(1, '#7A3E0C');
    ctx.fillStyle = breadGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 88, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = product.jarContentsHighlight;
    ctx.beginPath();
    ctx.arc(34, 42, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

export function renderCardFruitPattern(canvas, product) {
  if (!canvas || !product) return;
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = 340);
  const H = (canvas.height = 420);

  ctx.fillStyle = product.hoverCardBg;
  ctx.fillRect(0, 0, W, H);

  const positions = [
    { x: 52, y: 78, r: 58, rot: -0.35 },
    { x: 165, y: 55, r: 64, rot: 0.22 },
    { x: 285, y: 115, r: 56, rot: 0.48 },
    { x: 64, y: 210, r: 62, rot: 0.15 },
    { x: 268, y: 255, r: 66, rot: -0.28 },
    { x: 88, y: 345, r: 62, rot: -0.42 },
    { x: 210, y: 360, r: 60, rot: 0.32 }
  ];

  positions.forEach((p) => {
    drawFruitSilhouette(ctx, product.fruitType, p.x, p.y, p.r, product.hoverFruitColor, p.rot);
  });
}
