/**
 * 设备检测工具函数
 * 用于判断当前设备类型，帮助决定链接打开方式
 */

/**
 * 检测是否为移动设备
 * @returns {boolean} 如果是移动设备返回 true，否则返回 false
 */
export function isMobileDevice(): boolean {
  // 如果在服务端渲染环境，默认返回 false (桌面端行为)
  if (typeof window === 'undefined') {
    return false;
  }

  // 通过屏幕宽度检测
  const screenWidth = window.innerWidth <= 768;
  
  // 通过用户代理检测
  const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // 通过触摸能力检测
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 综合判断：满足任意两个条件即认为是移动设备
  const mobileIndicators = [screenWidth, userAgent, hasTouch].filter(Boolean).length;
  
  return mobileIndicators >= 2;
}

/**
 * 检测是否为桌面设备
 * @returns {boolean} 如果是桌面设备返回 true，否则返回 false
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice();
}

/**
 * 根据设备类型打开链接
 * @param {string} url - 要打开的链接
 * @param {boolean} preferNewTab - 桌面端是否优先使用新标签页（默认 true）
 */
export function openLinkByDevice(url: string, preferNewTab: boolean = true): void {
  if (isMobileDevice()) {
    // 移动端：同窗口打开，避免Pop-up拦截
    window.location.href = url;
  } else {
    // 桌面端：根据 preferNewTab 参数决定
    if (preferNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }
} 