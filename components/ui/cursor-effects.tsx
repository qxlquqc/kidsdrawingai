'use client';

import { useEffect, useRef, useState } from 'react';

interface StarParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

export function CursorStarEffect() {
  // 使用useState来避免hydration错误
  const [isMounted, setIsMounted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<StarParticle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const prevMousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  const isMoving = useRef(false);
  const moveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Only show on desktop
  const isMobile = useRef(false);

  const checkDevice = () => {
    isMobile.current = window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
    console.log("CursorStarEffect mounted");
  }, []);

  // Initialize the canvas and event listeners
  useEffect(() => {
    if (!isMounted) return;
    
    console.log("CursorStarEffect setup started");
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas ref is null");
      return;
    }
    
    // Check if we're on mobile
    checkDevice();
    if (isMobile.current) {
      console.log("Mobile device detected, not initializing canvas");
      return;
    }
    
    // Setup canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Could not get canvas context");
      return;
    }
    
    console.log("Canvas initialized successfully");
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      checkDevice();
    };
    
    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      prevMousePosition.current = { ...mousePosition.current };
      mousePosition.current = { x: e.clientX, y: e.clientY };
      
      const distanceMoved = Math.sqrt(
        Math.pow(mousePosition.current.x - prevMousePosition.current.x, 2) +
        Math.pow(mousePosition.current.y - prevMousePosition.current.y, 2)
      );
      
      // Only create particles if the mouse has moved a certain distance
      if (distanceMoved > 5) {
        isMoving.current = true;
        createStarParticles();
        
        // Reset the timeout
        if (moveTimeout.current) {
          clearTimeout(moveTimeout.current);
        }
        
        // Set a timeout to stop creating particles after movement stops
        moveTimeout.current = setTimeout(() => {
          isMoving.current = false;
        }, 100);
      }
    };
    
    // Create star particles
    const createStarParticles = () => {
      if (isMobile.current) return;
      
      // Adjust particle count based on mouse speed
      const distanceMoved = Math.sqrt(
        Math.pow(mousePosition.current.x - prevMousePosition.current.x, 2) +
        Math.pow(mousePosition.current.y - prevMousePosition.current.y, 2)
      );
      
      const particleCount = Math.min(Math.floor(distanceMoved / 5) + 1, 5);
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 12 + 5;
        const speed = Math.random() * 2 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const life = Math.random() * 40 + 20;
        const rotation = Math.random() * 360;
        const rotationSpeed = (Math.random() - 0.5) * 4;
        
        // Generate a variety of colors for the stars
        let starColor: string;
        const colorType = Math.floor(Math.random() * 4);
        
        switch (colorType) {
          case 0: // Gold/yellow
            const goldHue = Math.random() * 40 + 40; // 40-80 (gold/yellow range)
            starColor = `hsl(${goldHue}, ${Math.random() * 20 + 80}%, ${Math.random() * 20 + 70}%)`;
            break;
          case 1: // Pink/magenta (brand color)
            starColor = `rgba(255, ${Math.floor(Math.random() * 107) + 100}, ${Math.floor(Math.random() * 107) + 150}, 1)`;
            break;
          case 2: // Purple (brand color)
            starColor = `rgba(${Math.floor(Math.random() * 50) + 120}, ${Math.floor(Math.random() * 50) + 70}, ${Math.floor(Math.random() * 50) + 200}, 1)`;
            break;
          case 3: // Light blue (for variety)
            starColor = `rgba(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 200}, ${Math.floor(Math.random() * 30) + 225}, 1)`;
            break;
          default:
            starColor = 'rgba(255, 215, 0, 1)'; // Default gold color as fallback
        }
        
        // Position with slight randomness around the cursor
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        
        particles.current.push({
          x: mousePosition.current.x + offsetX,
          y: mousePosition.current.y + offsetY,
          size,
          color: starColor,
          opacity: 1,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed - 0.5, // Slight upward drift
          life,
          maxLife: life,
          rotation,
          rotationSpeed
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!ctx || !canvas || isMobile.current) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      
      // Clear canvas with COMPLETELY transparent fill
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 额外检查确保canvas是透明的
      canvas.style.backgroundColor = 'transparent';
      
      // Update and draw particles
      particles.current.forEach((particle, index) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Add some gravity and drift
        particle.speedY += 0.02;
        
        // Add some randomness to movement
        particle.x += (Math.random() - 0.5) * 0.3;
        particle.y += (Math.random() - 0.5) * 0.3;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Reduce life
        particle.life--;
        particle.opacity = particle.life / particle.maxLife;
        
        // Remove dead particles
        if (particle.life <= 0) {
          particles.current.splice(index, 1);
          return;
        }
        
        // Draw star
        drawStar(ctx, particle);
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Draw star shape
    const drawStar = (ctx: CanvasRenderingContext2D, particle: StarParticle) => {
      const { x, y, size, color, opacity, rotation } = particle;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 180 * rotation);
      
      // Create star glow effect
      const gradient = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.5);
      gradient.addColorStop(0, color);
      
      // Safely create semi-transparent version of the color
      let fadeColor = 'rgba(255, 255, 255, 0.3)'; // Default fallback
      
      try {
        if (color.startsWith('rgba')) {
          // If it's rgba, replace the opacity value
          fadeColor = color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[0-9.]+\)/, 'rgba($1, $2, $3, 0.3)');
        } else if (color.startsWith('rgb')) {
          // If it's rgb, convert to rgba
          fadeColor = color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 'rgba($1, $2, $3, 0.3)');
        } else if (color.startsWith('hsl')) {
          // If it's hsl, we'll just use a fixed color that matches our theme
          fadeColor = 'rgba(255, 170, 220, 0.3)';
        }
      } catch (e) {
        // If any error occurs, use the fallback color
        console.error('Error processing color', e);
      }
      
      gradient.addColorStop(0.5, fadeColor);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.globalAlpha = opacity;
      
      // Draw glow
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw the star
      ctx.fillStyle = color;
      ctx.beginPath();
      
      for (let i = 0; i < 5; i++) {
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        // Outer point
        const outerX = Math.cos(Math.PI * 2 / 5 * i - Math.PI / 2) * outerRadius;
        const outerY = Math.sin(Math.PI * 2 / 5 * i - Math.PI / 2) * outerRadius;
        
        // Inner point
        const innerX = Math.cos(Math.PI * 2 / 5 * i - Math.PI / 2 + Math.PI / 5) * innerRadius;
        const innerY = Math.sin(Math.PI * 2 / 5 * i - Math.PI / 2 + Math.PI / 5) * innerRadius;
        
        if (i === 0) {
          ctx.moveTo(outerX, outerY);
        } else {
          ctx.lineTo(outerX, outerY);
        }
        
        ctx.lineTo(innerX, innerY);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add sparkle in the center
      ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity * 0.9 + ')';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add cross sparkle lines for extra shine
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.7 + ')';
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      
      // Horizontal line
      ctx.moveTo(-size * 0.7, 0);
      ctx.lineTo(size * 0.7, 0);
      
      // Vertical line
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(0, size * 0.7);
      
      ctx.stroke();
      
      ctx.restore();
    };
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Also create particles on mouse clicks
    const handleMouseClick = () => {
      console.log("Click detected, creating particles");
      // Create more particles on click
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (canvas) createStarParticles();
        }, i * 30);
      }
    };
    
    window.addEventListener('click', handleMouseClick);
    
    resizeCanvas();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isMounted]);
  
  // 如果组件尚未挂载，返回null防止服务器端渲染
  if (!isMounted) {
    return null;
  }
  
  // Mobile check (client-side only)
  if (typeof window !== 'undefined' && isMounted) {
    const isMobileDevice = window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      return null;
    }
  }
  
  console.log("Rendering cursor effect canvas");
  
  return (
    <canvas
      ref={canvasRef}
      className="cursor-star-canvas"
      aria-hidden="true"
      style={{
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100
      }}
    />
  );
}

// 添加默认导出
export default CursorStarEffect; 