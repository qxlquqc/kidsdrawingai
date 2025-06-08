// Creem API Types
export interface CreemProduct {
  id: string;
  object: 'product';
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_type: 'one-time' | 'recurring';
  billing_period?: 'every-month' | 'every-year';
  image_url?: string;
  metadata?: Record<string, any>;
}

export interface CreemCustomer {
  id: string;
  object: 'customer';
  email?: string;
  metadata?: Record<string, any>;
}

export interface CreemOrder {
  id: string;
  object: 'order';
  amount: number;
  currency: string;
  status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  customer?: string;
  metadata?: Record<string, any>;
}

export interface CreemSubscription {
  id: string;
  object: 'subscription';
  product: string;
  customer: string;
  collection_method: 'charge_automatically';
  status: 'active' | 'paid' | 'canceled' | 'expired' | 'trialing';
  current_period_end_date: string;
  metadata?: Record<string, any>;
  mode: 'test' | 'live';
}

export interface CreemCheckoutSession {
  id: string;
  object: 'checkout_session';
  status: 'open' | 'complete' | 'expired';
  checkout_url: string;
  product: string;
  units?: number;
  order?: CreemOrder;
  metadata?: Record<string, any>;
}

// Webhook Event Types
export interface CreemWebhookEvent {
  id: string;
  eventType: 'checkout.completed' | 'subscription.active' | 'subscription.paid' | 
           'subscription.trialing' | 'subscription.update' | 'subscription.canceled' | 
           'subscription.expired' | 'refund.created';
  created_at: number;
  object: CreemOrder | CreemSubscription | any;
}

// Checkout Request Types
export interface CreateCheckoutRequest {
  product_id: string;
  units?: number;
  discount_code?: string;
  customer?: {
    email?: string;
  };
  success_url?: string;
  // cancel_url 不被 Creem API 支持
  request_id?: string;
  metadata?: Record<string, any>;
}

// Plan Configuration
export type PlanType = 'free' | 'starter_monthly' | 'starter_yearly' | 
                      'explorer_monthly' | 'explorer_yearly' | 
                      'creator_monthly' | 'creator_yearly';

export interface PlanConfig {
  productId: string;
  name: string;
  monthlyLimit: number;
  price: number; // in cents
  currency: string;
  billing_period: 'month' | 'year';
  popular?: boolean;
} 