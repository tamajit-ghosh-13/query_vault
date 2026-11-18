'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  createPreserveTextureCanvas,
  createProductLabelCanvas
} from '@/utils/jarTextureGenerator';

/**
 * Creates a realistic brushed-aluminum procedural texture for the silver twist-off lid (`Capsula`)
 * matching the soft studio softbox highlight in Untitled.mov (`trans_007.jpg`, `frame_022.jpg`).
 */
let lidTextureCache = null;
function getBrushedMetalTexture() {
  if (typeof document === 'undefined') return null;
  if (lidTextureCache) return lidTextureCache;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, '#8E9297');
  grad.addColorStop(0.16, '#CFD3D8');
  grad.addColorStop(0.32, '#F8FAFC');
  grad.addColorStop(0.46, '#C2C6CB');
  grad.addColorStop(0.62, '#92969B');
  grad.addColorStop(0.78, '#E4E8EC');
  grad.addColorStop(0.92, '#AEB2B7');
  grad.addColorStop(1.0, '#8E9297');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Fine horizontal brushed-metal micro-grain
  for (let y = 0; y < 128; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, y, 512, 1);
  }

  // Subtle top highlight & bottom lip shadow on lid skirt
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(0, 0, 512, 6);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 120, 512, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  lidTextureCache = tex;
  return tex;
}

/**
 * ThreeJarCanvas — Photorealistic, Unclipped 3D Sicilian Glass Preserve Jar
 * - Applies large 2D tangential wheel tilts (`tiltDeg`) to the wrapper container so the
 *   3D jar stays centered inside the WebGL frustum and the cap/base corners are NEVER
 *   sliced off by the rectangular canvas bounds on steeply tilted side jars.
 * - Uses solid closed CylinderGeometry + TorusGeometry for the silver twist-off cap (`Capsula`),
 *   recessed neck, and preserve core so the cap has no hollow underside or missing pieces.
 */
export default function ThreeJarCanvas({
  product,
  yawAngle = 0,
  tiltDeg = 0,
  pitchDeg = 0,
  width = 380,
  height = 500,
  interactive = true,
  className = ''
}) {
  const mountRef = useRef(null);
  const tiltGroupRef = useRef(null);
  const spinGroupRef = useRef(null);
  const keyLightRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const labelMatRef = useRef(null);
  const preserveMatRef = useRef(null);

  const targetStateRef = useRef({
    baseYaw: yawAngle,
    basePitchRad: THREE.MathUtils.degToRad(pitchDeg),
    pointerYaw: 0,
    pointerPitch: 0,
    pointerRoll: 0
  });

  const renderNow = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera with generous frustum margin so cap & base never clip
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
    camera.position.set(0, 0.08, 8.2);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff9f2, 1.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.55);
    keyLight.position.set(3.2, 4.0, 5.8);
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe6cc, 1.45);
    rimLight.position.set(-4.2, 2.0, 3.8);
    scene.add(rimLight);

    const bottomBounce = new THREE.PointLight(0xf5e0c8, 0.75, 12);
    bottomBounce.position.set(0, -3.4, 3.5);
    scene.add(bottomBounce);

    // 4. Transform Hierarchy
    const tiltGroup = new THREE.Group();
    tiltGroupRef.current = tiltGroup;
    scene.add(tiltGroup);

    const spinGroup = new THREE.Group();
    spinGroupRef.current = spinGroup;
    tiltGroup.add(spinGroup);

    // 4a. Solid Inner Preserve Cylinder (1:1 cylindrical UV mapping, zero ring distortion)
    const preserveGeo = new THREE.CylinderGeometry(0.985, 0.985, 2.06, 72);
    const preserveCanvas = createPreserveTextureCanvas(product);
    const preserveTex = new THREE.CanvasTexture(preserveCanvas);
    preserveTex.colorSpace = THREE.SRGBColorSpace;
    preserveTex.wrapS = THREE.RepeatWrapping;
    preserveTex.wrapT = THREE.ClampToEdgeWrapping;
    preserveTex.needsUpdate = true;

    const preserveMat = new THREE.MeshStandardMaterial({
      map: preserveTex,
      roughness: 0.32,
      metalness: 0.04
    });
    preserveMatRef.current = preserveMat;
    const preserveMesh = new THREE.Mesh(preserveGeo, preserveMat);
    preserveMesh.position.y = -0.08;
    spinGroup.add(preserveMesh);

    // 4b. Recessed Dark Neck Cylinder connecting preserve body up inside the silver cap
    const neckGeo = new THREE.CylinderGeometry(0.95, 0.98, 0.22, 72);
    const neckMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A0D0A'),
      roughness: 0.2,
      metalness: 0.1
    });
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = 1.00;
    spinGroup.add(neckMesh);

    // 4c. Outer Clearcoat Glass Jar Cylinder + Rounded Shoulder & Thick Glass Base
    const glassGeo = new THREE.CylinderGeometry(1.02, 1.02, 2.12, 72);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.22,
      roughness: 0.08,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.96
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = -0.08;
    spinGroup.add(glassMesh);

    // Subtle glass neck thread ring & thick bottom glass base ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f7efe6'),
      transparent: true,
      opacity: 0.38,
      roughness: 0.15,
      metalness: 0.25
    });
    const neckRingGeo = new THREE.TorusGeometry(0.97, 0.016, 12, 72);
    const neckRingMesh = new THREE.Mesh(neckRingGeo, ringMat);
    neckRingMesh.rotation.x = Math.PI * 0.5;
    neckRingMesh.position.y = 0.98;
    spinGroup.add(neckRingMesh);

    const baseRingGeo = new THREE.TorusGeometry(0.995, 0.025, 14, 72);
    const baseRingMesh = new THREE.Mesh(baseRingGeo, ringMat);
    baseRingMesh.rotation.x = Math.PI * 0.5;
    baseRingMesh.position.y = -1.12;
    spinGroup.add(baseRingMesh);

    // 4d. 360-Degree Wraparound Cylindrical Paper Label Mesh
    // Height = 1.56 (leaves exposed preserve shoulder above and exposed glass base below)
    const labelCanvas = createProductLabelCanvas(product);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.wrapS = THREE.RepeatWrapping;
    labelTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    labelTexture.needsUpdate = true;

    const labelGeo = new THREE.CylinderGeometry(1.028, 1.028, 1.56, 96, 1, true);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.34,
      metalness: 0.02,
      side: THREE.FrontSide
    });
    labelMatRef.current = labelMat;
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.08;
    // Align u = 0.25 (X = 512, Front Label Center) directly toward +Z camera at yawAngle = 0
    labelMesh.rotation.y = -Math.PI * 0.5;
    spinGroup.add(labelMesh);

    // 4e. Complete Solid Multi-Part Brushed Silver Twist-Off Cap (`Capsula`)
    // Built from closed CylinderGeometries + Torus lip so no piece is ever hollow or missing
    const lidTex = getBrushedMetalTexture();
    const lidSideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EDF0F3'),
      map: lidTex,
      roughness: 0.24,
      metalness: 0.82
    });
    const lidCapTopMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E2E6EA'),
      roughness: 0.26,
      metalness: 0.80
    });
    const lidUndersideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A3D40'),
      roughness: 0.4,
      metalness: 0.5
    });

    // Main cylindrical cap skirt with solid top & solid dark underside
    const lidBodyGeo = new THREE.CylinderGeometry(1.022, 1.026, 0.32, 72);
    const lidBodyMesh = new THREE.Mesh(lidBodyGeo, [
      lidSideMat,
      lidCapTopMat,
      lidUndersideMat
    ]);
    lidBodyMesh.position.y = 1.21;
    spinGroup.add(lidBodyMesh);

    // Rounded top bevel crown of the silver cap
    const lidCrownGeo = new THREE.CylinderGeometry(0.985, 1.022, 0.032, 72);
    const lidCrownMesh = new THREE.Mesh(lidCrownGeo, lidCapTopMat);
    lidCrownMesh.position.y = 1.385;
    spinGroup.add(lidCrownMesh);

    // Rolled bottom lip ring of the silver cap
    const lidLipGeo = new THREE.TorusGeometry(1.012, 0.018, 16, 72);
    const lidLipMesh = new THREE.Mesh(lidLipGeo, lidCapTopMat);
    lidLipMesh.rotation.x = Math.PI * 0.5;
    lidLipMesh.position.y = 1.052;
    spinGroup.add(lidLipMesh);

    // Initial transform & render
    tiltGroup.rotation.x = THREE.MathUtils.degToRad(pitchDeg);
    spinGroup.rotation.y = yawAngle;
    renderer.render(scene, camera);

    return () => {
      gsap.killTweensOf(tiltGroup.rotation);
      gsap.killTweensOf(spinGroup.rotation);
      gsap.killTweensOf(keyLight.position);
      preserveGeo.dispose();
      neckGeo.dispose();
      glassGeo.dispose();
      neckRingGeo.dispose();
      baseRingGeo.dispose();
      labelGeo.dispose();
      lidBodyGeo.dispose();
      lidCrownGeo.dispose();
      lidLipGeo.dispose();
      if (preserveMat.map) preserveMat.map.dispose();
      preserveMat.dispose();
      neckMat.dispose();
      glassMat.dispose();
      ringMat.dispose();
      if (labelMat.map) labelMat.map.dispose();
      labelMat.dispose();
      lidSideMat.dispose();
      lidCapTopMat.dispose();
      lidUndersideMat.dispose();
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') {
        renderer.forceContextLoss();
      }
    };
  }, [width, height]);

  // Update label & preserve textures when product changes
  useEffect(() => {
    if (!product || !labelMatRef.current || !preserveMatRef.current) return;

    const labelCanvas = createProductLabelCanvas(product);
    const newLabelTex = new THREE.CanvasTexture(labelCanvas);
    newLabelTex.colorSpace = THREE.SRGBColorSpace;
    newLabelTex.wrapS = THREE.RepeatWrapping;
    if (rendererRef.current) {
      newLabelTex.anisotropy = Math.min(rendererRef.current.capabilities.getMaxAnisotropy(), 8);
    }
    newLabelTex.needsUpdate = true;

    if (labelMatRef.current.map) labelMatRef.current.map.dispose();
    labelMatRef.current.map = newLabelTex;
    labelMatRef.current.needsUpdate = true;

    const preserveCanvas = createPreserveTextureCanvas(product);
    const newPreserveTex = new THREE.CanvasTexture(preserveCanvas);
    newPreserveTex.colorSpace = THREE.SRGBColorSpace;
    newPreserveTex.wrapS = THREE.RepeatWrapping;
    newPreserveTex.needsUpdate = true;

    if (preserveMatRef.current.map) preserveMatRef.current.map.dispose();
    preserveMatRef.current.map = newPreserveTex;
    preserveMatRef.current.needsUpdate = true;

    renderNow();
  }, [product]);

  // Smooth GSAP update whenever yawAngle or pitchDeg changes
  useEffect(() => {
    const st = targetStateRef.current;
    st.baseYaw = yawAngle;
    st.basePitchRad = THREE.MathUtils.degToRad(pitchDeg);

    if (!tiltGroupRef.current || !spinGroupRef.current) return;

    gsap.to(spinGroupRef.current.rotation, {
      y: st.baseYaw + st.pointerYaw,
      duration: 0.28,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });

    gsap.to(tiltGroupRef.current.rotation, {
      z: st.pointerRoll,
      x: st.basePitchRad + st.pointerPitch,
      duration: 0.24,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });
  }, [yawAngle, pitchDeg]);

  // Real-time pointer tracking on the jar
  const handlePointerMove = (e) => {
    if (!interactive || !mountRef.current || !tiltGroupRef.current || !spinGroupRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const st = targetStateRef.current;
    st.pointerYaw = nx * 0.22;
    st.pointerPitch = ny * 0.11;
    st.pointerRoll = -nx * 0.045;

    gsap.to(spinGroupRef.current.rotation, {
      y: st.baseYaw + st.pointerYaw,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });

    gsap.to(tiltGroupRef.current.rotation, {
      z: st.pointerRoll,
      x: st.basePitchRad + st.pointerPitch,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });

    if (keyLightRef.current) {
      gsap.to(keyLightRef.current.position, {
        x: 3.2 + nx * 1.5,
        y: 4.0 - ny * 1.2,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };

  const handlePointerLeave = () => {
    if (!interactive || !tiltGroupRef.current || !spinGroupRef.current) return;
    const st = targetStateRef.current;
    st.pointerYaw = 0;
    st.pointerPitch = 0;
    st.pointerRoll = 0;

    gsap.to(spinGroupRef.current.rotation, {
      y: st.baseYaw,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });

    gsap.to(tiltGroupRef.current.rotation, {
      z: 0,
      x: st.basePitchRad,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: renderNow
    });

    if (keyLightRef.current) {
      gsap.to(keyLightRef.current.position, {
        x: 3.2,
        y: 4.0,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  };

  return (
    <div
      ref={mountRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${(-tiltDeg).toFixed(2)}deg)`,
        transition: 'transform 0.18s ease-out',
        filter: 'drop-shadow(0 24px 36px rgba(28, 10, 12, 0.28))'
      }}
    />
  );
}
