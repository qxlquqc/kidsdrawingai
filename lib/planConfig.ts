import { PlanType, PlanConfig } from '@/lib/creem/types';

/**
 * 套餐配置定义
 */
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    productId: '',
    name: 'Free',
    monthlyLimit: 0, // 免费用户无法使用，需要付费
    price: 0,
    currency: 'usd',
    billing_period: 'month'
  },
  starter_monthly: {
    productId: process.env.CREEM_PID_STARTER_MONTHLY || '',
    name: 'Starter Monthly',
    monthlyLimit: 50,
    price: 799, // $7.99
    currency: 'usd',
    billing_period: 'month'
  },
  starter_yearly: {
    productId: process.env.CREEM_PID_STARTER_YEARLY || '',
    name: 'Starter Yearly',
    monthlyLimit: 50,
    price: 5900, // $59/year (显示为$5/月)
    currency: 'usd',
    billing_period: 'year',
    popular: true
  },
  explorer_monthly: {
    productId: process.env.CREEM_PID_EXPLORER_MONTHLY || '',
    name: 'Explorer Monthly',
    monthlyLimit: 200,
    price: 1499, // $14.99
    currency: 'usd',
    billing_period: 'month'
  },
  explorer_yearly: {
    productId: process.env.CREEM_PID_EXPLORER_YEARLY || '',
    name: 'Explorer Yearly',
    monthlyLimit: 200,
    price: 9900, // $99/year (显示为$9/月)
    currency: 'usd',
    billing_period: 'year'
  },
  creator_monthly: {
    productId: process.env.CREEM_PID_CREATOR_MONTHLY || '',
    name: 'Creator Monthly',
    monthlyLimit: 500,
    price: 3000, // $30
    currency: 'usd',
    billing_period: 'month'
  },
  creator_yearly: {
    productId: process.env.CREEM_PID_CREATOR_YEARLY || '',
    name: 'Creator Yearly',
    monthlyLimit: 500,
    price: 19900, // $199/year (显示为$17/月)
    currency: 'usd',
    billing_period: 'year'
  }
};

/**
 * 获取套餐配置
 */
export function getPlanConfig(planType: PlanType): PlanConfig {
  return PLAN_CONFIGS[planType];
}

/**
 * 获取套餐月度使用限制
 */
export function getPlanLimit(planType: PlanType): number {
  return PLAN_CONFIGS[planType].monthlyLimit;
}

/**
 * 检查用户是否可以使用转换功能
 */
export function canUseTransform(planType: PlanType): boolean {
  return planType !== 'free' && getPlanLimit(planType) > 0;
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: price % 100 === 0 ? 0 : 2
  }).format(price / 100);
}

/**
 * 获取年付套餐的月均价格
 */
export function getMonthlyPrice(planType: PlanType): string {
  const config = PLAN_CONFIGS[planType];
  if (config.billing_period === 'year') {
    const monthlyPrice = config.price / 12;
    return formatPrice(monthlyPrice, config.currency);
  }
  return formatPrice(config.price, config.currency);
}

/**
 * 获取所有可购买的套餐（排除free）
 */
export function getPaidPlans(): Array<{ type: PlanType; config: PlanConfig }> {
  return Object.entries(PLAN_CONFIGS)
    .filter(([type]) => type !== 'free')
    .map(([type, config]) => ({ type: type as PlanType, config }));
} 