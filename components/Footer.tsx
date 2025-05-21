import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-24 pt-16 pb-10 bg-transparent relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-pink-100/10 blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-purple-100/10 blur-3xl"></div>
      </div>
      
      {/* 内容部分 */}
      <div className="container mx-auto z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 px-6">
          {/* 左侧品牌部分 */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-xl mb-5 gradient-text">KidsDrawingAi</h3>
            <p className="text-gray-600 text-center md:text-left mb-5">
              Our AI technology brings children's imagination to life by transforming their drawings into beautiful artwork.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-[#ff6b9d]/10 transition-colors hover-scale">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-[#ff6b9d]/10 transition-colors hover-scale">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-[#ff6b9d]/10 transition-colors hover-scale">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* 中间导航部分 */}
          <div className="flex flex-col items-center md:mt-0 mt-8">
            <h4 className="font-semibold mb-5 gradient-text text-center md:text-left">Navigation</h4>
            <ul className="text-sm space-y-3 text-center md:text-left">
              <li><Link href="/" className="hover:text-[#ff6b9d] transition-colors">Home</Link></li>
              <li><Link href="/transform/image" className="hover:text-[#ff6b9d] transition-colors">Transform</Link></li>
              <li><Link href="#how-it-works" className="hover:text-[#ff6b9d] transition-colors">How It Works</Link></li>
              <li><Link href="#pricing" className="hover:text-[#ff6b9d] transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="hover:text-[#ff6b9d] transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* 右侧法律部分 */}
          <div className="flex flex-col items-center md:mt-0 mt-8">
            <h4 className="font-semibold mb-5 gradient-text text-center md:text-left">Legal</h4>
            <ul className="text-sm space-y-3 text-center md:text-left">
              <li><Link href="/terms-of-service" className="hover:text-[#ff6b9d] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#ff6b9d] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* 分隔线 */}
        <div className="border-t border-[#a17ef5]/20 mt-12 mx-6"></div>
        
        {/* 版权信息 */}
        <div className="pt-8 text-sm text-center text-gray-600">
          © 2025 KidsDrawingAi. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 