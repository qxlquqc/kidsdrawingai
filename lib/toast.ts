import { toast, type ToastT } from 'sonner';

// 导出toast对象，让其他组件可以直接使用
export { toast };

// Toast持续时间（毫秒）
const DEFAULT_DURATION = 4000;

// 生成唯一ID
function generateUniqueId() {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 显示成功提示
 */
export function showSuccess(message: string, options = {}) {
  return toast.success(message, {
    duration: 3000,
    id: generateUniqueId(),
    ...options,
  });
}

/**
 * 显示错误提示
 */
export function showError(message: string, options = {}) {
  return toast.error(message, {
    duration: 5000,
    id: generateUniqueId(),
    ...options,
  });
}

/**
 * 显示警告提示
 */
export function showWarning(message: string, duration = DEFAULT_DURATION): any {
  return toast.warning(message, { 
    duration,
    id: generateUniqueId()
  });
}

/**
 * 显示信息提示
 */
export function showInfo(message: string, options = {}) {
  return toast.info(message, {
    duration: 4000,
    id: generateUniqueId(),
    ...options,
  });
}

/**
 * 显示加载中提示
 * @returns toast ID，用于更新或删除该toast
 */
export function showLoading(message: string) {
  const id = generateUniqueId();
  return toast.loading(message, {
    duration: Infinity, // 不自动关闭
    id,
  });
}

/**
 * 更新现有的toast
 */
export function updateToast(id: string, message: string, type?: 'success' | 'error' | 'info' | 'warning'): void {
  if (!type) {
    toast(message, { id });
    return;
  }
  
  switch (type) {
    case 'success':
      toast.success(message, { id });
      break;
    case 'error':
      toast.error(message, { id });
      break;
    case 'info':
      toast.info(message, { id });
      break;
    case 'warning':
      toast.warning(message, { id });
      break;
  }
}

/**
 * 关闭指定的toast
 */
export function dismissToast(id?: string) {
  if (id) {
  toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

/**
 * 关闭所有toast
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}

/**
 * 显示自定义toast
 */
export function showCustomToast(options: {
  message: string;
  icon?: React.ReactNode;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}): any {
  return toast(options.message, {
    icon: options.icon,
    description: options.description,
    action: options.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
    duration: options.duration || DEFAULT_DURATION,
    id: generateUniqueId(),
  });
}

/**
 * 使用Promise显示加载状态
 * 会自动在Promise完成时更新toast状态
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
): Promise<T> {
  const id = generateUniqueId();
  return toast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
    id,
  }) as unknown as Promise<T>;
} 