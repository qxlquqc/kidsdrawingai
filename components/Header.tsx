"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    // 初始调用以设置初始状态
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="font-bold text-2xl gradient-text hover-scale transition-all">
          KidsDrawingAi
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="/" className="hover:text-[#ff6b9d] transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#ff6b9d] after:transition-all">Home</Link>
          <Link href="/transform/image" className="hover:text-[#ff6b9d] transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#ff6b9d] after:transition-all">Transform</Link>
          <Link href="/#how-it-works" className="hover:text-[#ff6b9d] transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#ff6b9d] after:transition-all">How It Works</Link>
          <Link href="/pricing" className="hover:text-[#ff6b9d] transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#ff6b9d] after:transition-all">Pricing</Link>
          <Link href="/#faq" className="hover:text-[#ff6b9d] transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#ff6b9d] after:transition-all">FAQ</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="glass-card px-4 py-2 rounded-full border border-[#a17ef5]/30 text-[#a17ef5] hover:bg-[#a17ef5]/10 transition-all hover-scale hidden md:block">
            Login
          </Link>
          <Link href="/transform/image" className="btn-hover-effect px-6 py-2 rounded-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] text-white shadow-md hover:shadow-lg transition-all">
            Get Started
          </Link>
          <button className="md:hidden ml-2 text-gray-700 focus:outline-none" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu (this would typically be controlled by state in a client component) */}
      <div className="hidden md:hidden">
        <div className="px-4 py-3 space-y-2 glass-card shadow-lg">
          <Link href="/" className="block py-2 hover:text-[#ff6b9d]">Home</Link>
          <Link href="/transform/image" className="block py-2 hover:text-[#ff6b9d]">Transform</Link>
          <Link href="/#how-it-works" className="block py-2 hover:text-[#ff6b9d]">How It Works</Link>
          <Link href="/pricing" className="block py-2 hover:text-[#ff6b9d]">Pricing</Link>
          <Link href="/#faq" className="block py-2 hover:text-[#ff6b9d]">FAQ</Link>
          <Link href="/login" className="block py-2 text-[#a17ef5] hover:text-[#ff6b9d]">Login</Link>
        </div>
      </div>
    </header>
  );
} 