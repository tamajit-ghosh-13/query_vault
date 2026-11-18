'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import gsap from 'gsap';
import { drawFruitSilhouette } from '@/utils/jarTextureGenerator';

/**
 * PhysicsPreloader — Matter.js 2D Rigid-Body Physics + GSAP Curtain Wipe Preloader (00:00 - 00:03)
 * Uses Matter.Engine, Matter.World, and Matter.Bodies to simulate falling Sicilian
 * fruits & vegetables while GSAP animates the 0% -> 100% counter and orange curtain reveal.
 */
export default function PhysicsPreloader({ runTrigger = 0, onComplete }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const curtainRef = useRef(null);
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    setPercent(0);

    const canvas = canvasRef.current;
    const curtain = curtainRef.current;
    if (!canvas || !curtain) return;

    const ctx = canvas.getContext('2d');
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    // 1. Initialize Matter.js Physics Engine & World
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.35, scale: 0.001 }
    });
    const world = engine.world;

    // Static boundaries (floor, left wall, right wall)
    const wallThickness = 120;
    const floor = Matter.Bodies.rectangle(W / 2, H + wallThickness / 2 - 10, W + 400, wallThickness, {
      isStatic: true,
      restitution: 0.35,
      friction: 0.4
    });
    const leftWall = Matter.Bodies.rectangle(-wallThickness / 2, H / 2, wallThickness, H * 3, {
      isStatic: true
    });
    const rightWall = Matter.Bodies.rectangle(W + wallThickness / 2, H / 2, wallThickness, H * 3, {
      isStatic: true
    });
    Matter.World.add(world, [floor, leftWall, rightWall]);

    // 2. Spawn 18 Matter.js rigid-body fruit & vegetable shapes
    const fruitSpecs = [
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

    const scale = Math.min(1.15, Math.max(0.72, W / 1400));
    const fruitBodies = fruitSpecs.concat(fruitSpecs.slice(0, 7)).map((spec, i) => {
      const radius = spec.r * scale;
      const x = W * 0.1 + ((i * 179) % (W * 0.8));
      const y = -120 - i * 65;
      const body = Matter.Bodies.circle(x, y, radius * 0.76, {
        restitution: 0.38,
        friction: 0.25,
        frictionAir: 0.008,
        angle: (i * 0.65) % (Math.PI * 2)
      });
      body.fruitMeta = { type: spec.type, color: spec.color, r: radius };
      return body;
    });

    Matter.World.add(world, fruitBodies);

    // 3. GSAP Timeline for 0% -> 100% Counter & Orange Curtain Wipe
    gsap.set(curtain, { y: 0, yPercent: 101 });
    const counterObj = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        if (onComplete) onComplete();
      }
    });

    tl.to(counterObj, {
      val: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        setPercent(Math.floor(counterObj.val));
      }
    })
      .to(curtain, {
        y: 0,
        yPercent: 0,
        duration: 0.56,
        ease: 'power4.inOut'
      })
      .to(curtain, {
        y: 0,
        yPercent: -101,
        duration: 0.56,
        ease: 'power4.inOut',
        delay: 0.08
      });

    // 4. Render Loop synced with Matter.Engine.update
    let rafId;
    const renderLoop = () => {
      Matter.Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, W, H);

      fruitBodies.forEach((b) => {
        const { type, color, r } = b.fruitMeta;
        drawFruitSilhouette(ctx, type, b.position.x, b.position.y, r, color, b.angle);
      });

      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [runTrigger]);

  if (!visible) return null;

  return (
    <div ref={containerRef} className="preloader">
      <canvas ref={canvasRef} id="preloader-canvas" />
      <div className="preloader-counter">{percent}%</div>
      <div ref={curtainRef} className="preloader-curtain" />
    </div>
  );
}
