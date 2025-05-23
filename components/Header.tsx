"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { showSuccess } from "@/lib/toast";
import Avatar from "./Avatar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useUser();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 处理滚动
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

  // 处理点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理登出
  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("Successfully logged out");
      router.push("/");
    } catch (error) {
      console.error("登出错误:", error);
    }
  };

  // 获取用户名
  const getUserName = () => {
    return user?.user_metadata?.name || 
           user?.user_metadata?.full_name || 
           user?.email?.split('@')[0] || 
           'User';
  };

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
          {user ? (
            // 已登录状态
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar 
                  src={user.user_metadata?.avatar_url}
                  name={getUserName()}
                  size={40}
                  className="border-2 border-purple-200"
                />
                <span className="hidden md:inline text-gray-700">
                  {getUserName()}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5 text-gray-500"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/transform/image" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Transform Images
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 未登录状态
          <Link href="/login" className="glass-card px-4 py-2 rounded-full border border-[#a17ef5]/30 text-[#a17ef5] hover:bg-[#a17ef5]/10 transition-all hover-scale hidden md:block">
            Login
          </Link>
          )}
          
          <Link href={user ? "/transform/image" : "/login"} className="btn-hover-effect px-6 py-2 rounded-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] text-white shadow-md hover:shadow-lg transition-all">
            {user ? "Create Now" : "Get Started"}
          </Link>
          
          <button 
            className="md:hidden ml-2 text-gray-700 focus:outline-none" 
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-3 space-y-2 glass-card shadow-lg bg-white/90 backdrop-blur-md">
            <Link href="/" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/transform/image" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>Transform</Link>
            <Link href="/#how-it-works" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/pricing" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/#faq" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2 hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-[#a17ef5] hover:text-[#ff6b9d]">
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-[#a17ef5] hover:text-[#ff6b9d]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 