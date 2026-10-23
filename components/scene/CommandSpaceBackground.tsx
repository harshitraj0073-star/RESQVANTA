"use client";

import React, { useEffect, useRef } from "react";

interface CommandSpaceBackgroundProps {
  theme: "light" | "dark";
}

export function CommandSpaceBackground({ theme }: CommandSpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isLight = theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 65 floating micro-star particles
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulseAngle: Math.random() * Math.PI * 2,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Parallax offset based on cursor position
      const targetOffsetX = (mouseX - width / 2) * 0.02;
      const targetOffsetY = (mouseY - height / 2) * 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulseAngle += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity = p.opacity + Math.sin(p.pulseAngle) * 0.2;
        const drawX = p.x + targetOffsetX;
        const drawY = p.y + targetOffsetY;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(15, 23, 42, ${Math.max(0.08, currentOpacity * 0.4)})`
          : `rgba(103, 232, 249, ${Math.max(0.1, currentOpacity)})`;
        ctx.shadowBlur = isLight ? 0 : 6;
        ctx.shadowColor = "rgba(6, 182, 212, 0.6)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* 1. Deep Space Base Background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isLight
            ? "bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"
            : "bg-[#060b14]"
        }`}
      />

      {/* 2. Volumetric Cyan & Indigo Ambient Aura */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] transition-opacity duration-700 ${
          isLight
            ? "bg-cyan-500/10"
            : "bg-cyan-500/15"
        }`}
      />
      <div
        className={`absolute top-1/4 -right-32 w-[32rem] h-[32rem] rounded-full blur-[140px] transition-opacity duration-700 ${
          isLight
            ? "bg-blue-500/10"
            : "bg-indigo-600/15"
        }`}
      />
      <div
        className={`absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] rounded-full blur-[160px] transition-opacity duration-700 ${
          isLight
            ? "bg-teal-500/8"
            : "bg-cyan-700/12"
        }`}
      />

      {/* 3. 3D Perspective Ground Cyber-Grid (Bottom Horizon) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden opacity-40 dark:opacity-55"
        style={{
          perspective: "600px",
          transformStyle: "preserve-3d",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        }}
      >
        <div
          className="w-[200vw] h-[200vh] -ml-[50vw] origin-bottom"
          style={{
            transform: "rotateX(72deg) translateY(-20px)",
            backgroundImage: isLight
              ? `linear-gradient(to right, rgba(14, 165, 233, 0.18) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(14, 165, 233, 0.18) 1px, transparent 1px)`
              : `linear-gradient(to right, rgba(6, 182, 212, 0.32) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(6, 182, 212, 0.32) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            backgroundPosition: "center center",
          }}
        />
      </div>

      {/* 4. Canvas Floating Micro-Starfield Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
