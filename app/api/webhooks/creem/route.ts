import { NextRequest, NextResponse } from 'next/server';
import { verifyCreemSignature } from '@/lib/creem/verify-signature';
import { creemEnv } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { CreemWebhookEvent, PlanType } from '@/lib/creem/types';

// 使用service role key用于webhook处理
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 处理Creem webhook事件
 */
export async function POST(request: NextRequest) {
  console.log('🪝 ================================');
  console.log('🪝 Creem Webhook received');
  console.log('🪝 Timestamp:', new Date().toISOString());
  console.log('🪝 URL:', request.url);
  console.log('🪝 Method:', request.method);
  
  try {
    // 获取请求体
    const rawBody = await request.text();
    console.log('🪝 Raw body length:', rawBody.length);
    console.log('🪝 Raw body (first 200 chars):', rawBody.substring(0, 200));
    
    // 获取签名
    const signature = request.headers.get('creem-signature');
    console.log('🪝 Received signature:', signature);
    
    if (!signature) {
      console.error('❌ Missing creem-signature header');
      return NextResponse.json(
        { error: 'Missing signature' }, 
        { status: 401 }
      );
    }
    
    // 验证签名
    console.log('🔐 Verifying signature...');
    const webhookSecret = creemEnv.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ Missing CREEM_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' }, 
        { status: 500 }
      );
    }
    
    const isValid = verifyCreemSignature(rawBody, signature, webhookSecret);
    console.log('🔐 Signature verification result:', isValid);
    
    if (!isValid) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 401 }
      );
    }
    
    // 解析事件数据
    const event = JSON.parse(rawBody) as CreemWebhookEvent;
    console.log('📨 ================================');
    console.log('📨 Event parsed successfully:');
    console.log('📨 Event ID:', event.id);
    console.log('📨 Event Type:', event.eventType);
    console.log('📨 Created At:', event.created_at);
    console.log('📨 Object Type:', event.object?.object);
    console.log('📨 Object ID:', event.object?.id);
    console.log('📨 Product ID:', event.object?.product);
    console.log('📨 Customer ID:', event.object?.customer);
    console.log('📨 Status:', event.object?.status);
    console.log('📨 Metadata:', event.object?.metadata);
    console.log('📨 ================================');
    
    // 检查是否是重复事件（幂等性）
    console.log('🔍 Checking event idempotency...');
    console.log('🔍 Event ID to check:', event.id);
    
    const { data: existingEvent, error: idempotencyError } = await supabase
      .from('payment_events')
      .select('id, event_type, created_at')
      .eq('event_id', event.id)
      .single();
    
    console.log('🔍 Idempotency check result:');
    console.log('🔍 Existing event:', existingEvent);
    console.log('🔍 Error:', idempotencyError);
    console.log('🔍 Error code:', idempotencyError?.code);
    
    // 如果找到了现有事件，说明是重复事件
    if (existingEvent) {
       console.log('⚠️ ================================');
       console.log('⚠️ DUPLICATE EVENT DETECTED');
       console.log('⚠️ Event ID:', event.id);
       console.log('⚠️ Event type:', event.eventType);
       console.log('⚠️ Already processed at:', existingEvent.created_at);
       console.log('⚠️ Skipping processing (idempotency)');
       console.log('⚠️ ================================');
       return new Response('Event already processed', { status: 200 });
    }
    
    // 只有在查询出现意外错误时才返回500（PGRST116是正常的"记录不存在"错误）
    if (idempotencyError && idempotencyError.code !== 'PGRST116') {
      console.error('❌ Unexpected error checking idempotency:', idempotencyError);
      console.error('❌ Error details:', JSON.stringify(idempotencyError, null, 2));
      // 不要因为这个错误就阻止处理，继续处理事件
      console.log('⚠️ Continuing with event processing despite idempotency check error...');
    }
    
    console.log('✅ Event is new, proceeding with processing...');

         // 根据事件类型处理
     console.log('⚙️ Processing event type:', event.eventType);
     let result;
     
     switch (event.eventType) {
       case 'checkout.completed':
         console.log('💳 Processing checkout.completed event');
         result = await handleCheckoutCompleted(event);
         break;
       case 'subscription.active':
         console.log('🟢 Processing subscription.active event');
         result = await handleSubscriptionPaid(event);
         break;
       case 'subscription.paid':
         console.log('💰 Processing subscription.paid event');
         result = await handleSubscriptionPaid(event);
         break;
       case 'subscription.canceled':
         console.log('⚠️ Processing subscription.canceled event');
         result = await handleSubscriptionCanceled(event);
         break;
       case 'subscription.expired':
         console.log('⏰ Processing subscription.expired event');
         result = await handleSubscriptionExpired(event);
         break;
       case 'subscription.trialing':
         console.log('🔄 Processing subscription.trialing event');
         result = await handleSubscriptionTrialing(event);
         break;
       case 'subscription.update':
         console.log('🔄 Processing subscription.update event');
         result = await handleSubscriptionUpdate(event);
         break;
       case 'refund.created':
         console.log('💸 Processing refund.created event');
         result = await handleRefundCreated(event);
         break;
       default:
         console.log('⚠️ Unknown event type, recording for future reference');
         result = await recordPaymentEvent(event);
         return NextResponse.json({ received: true, status: 'unhandled' });
     }

         console.log('✅ Event processing completed:', result);
     console.log('🪝 ================================');
     return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('💥 ================================');
    console.error('💥 Webhook processing error:');
    console.error('💥 Error:', error);
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
         console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
     console.error('💥 ================================');
     return new Response('Internal server error', { status: 500 });
  }
}

/**
 * 处理具体的webhook事件
 */
async function handleWebhookEvent(event: CreemWebhookEvent) {
  switch (event.eventType) {
    case 'checkout.completed':
      return await handleCheckoutCompleted(event);
    
    case 'subscription.active':
    case 'subscription.paid':
      return await handleSubscriptionPaid(event);
    
    case 'subscription.canceled':
      return await handleSubscriptionCanceled(event);
    
    case 'subscription.expired':
      return await handleSubscriptionExpired(event);
    
    case 'refund.created':
      return await handleRefundCreated(event);
    
    default:
      console.log('⚠️ Unhandled event type:', event.eventType);
      // 仍然记录到payment_events表
      await recordPaymentEvent(event);
      return { status: 'unhandled', eventType: event.eventType };
  }
}

/**
 * 处理支付完成事件
 */
async function handleCheckoutCompleted(event: CreemWebhookEvent) {
  console.log('💳 ================================');
  console.log('💳 Processing checkout.completed event');
  console.log('💳 Event ID:', event.id);
  console.log('💳 ================================');
  
  const checkoutSession = event.object;
  const metadata = checkoutSession.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Checkout session details:');
  console.log('📋 Session ID:', checkoutSession.id);
  console.log('📋 Session object type:', checkoutSession.object);
  console.log('📋 Metadata:', metadata);
  console.log('📋 User ID from metadata:', userId);
  
  // 根据真实Creem webhook格式获取产品ID
  let productId = null;
  
  // 方法1: 从order.product获取
  if (checkoutSession.order?.product) {
    productId = checkoutSession.order.product;
    console.log('📋 Product ID from order.product:', productId);
  }
  
  // 方法2: 从product.id获取
  if (!productId && checkoutSession.product?.id) {
    productId = checkoutSession.product.id;
    console.log('📋 Product ID from product.id:', productId);
  }
  
  // 方法3: 从metadata获取
  if (!productId && metadata.product_id) {
    productId = metadata.product_id;
    console.log('📋 Product ID from metadata.product_id:', productId);
  }
  
  // 方法4: 兼容旧格式（直接在object.product）
  if (!productId && checkoutSession.product && typeof checkoutSession.product === 'string') {
    productId = checkoutSession.product;
    console.log('📋 Product ID from object.product (legacy):', productId);
  }
  
  console.log('📋 Final product ID:', productId);
  
  if (!userId) {
    console.error('❌ No user_id in checkout.completed metadata');
    console.error('❌ Available metadata keys:', Object.keys(metadata));
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 根据product_id确定plan_type
  console.log('🏷️ Looking up plan type for product:', productId);
  const planType = getplanTypeFromProductId(productId);
  console.log('🏷️ Plan type result:', planType);
  
  if (!planType) {
    console.error('❌ Unknown product_id:', productId);
    console.error('❌ Available checkout session structure:');
    console.error('❌ - checkoutSession.order:', checkoutSession.order);
    console.error('❌ - checkoutSession.product:', checkoutSession.product);
    console.error('❌ - metadata.product_id:', metadata.product_id);
    await recordPaymentEvent(event, userId);
    return { status: 'error', message: 'Unknown product' };
  }
  
  console.log('💾 Updating user_meta table...');
  // 更新用户套餐
  const { error: updateError } = await supabase
    .from('user_meta')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
      plan_type: planType,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Failed to update user_meta:', updateError);
    console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
    await recordPaymentEvent(event, userId, planType || undefined);
    return { status: 'error', message: 'Database update failed' };
  }
  
  console.log('✅ User meta updated successfully');
  
  // 记录支付事件
  console.log('📝 Recording payment event...');
  await recordPaymentEvent(event, userId, planType, {
    creem_order_id: checkoutSession.order?.id || checkoutSession.id,
    creem_customer_id: checkoutSession.order?.customer || checkoutSession.customer,
    amount: checkoutSession.order?.amount || checkoutSession.amount
  });
  
  console.log('✅ ================================');
  console.log('✅ Checkout completed successfully');
  console.log('✅ User ID:', userId);
  console.log('✅ Plan Type:', planType);
  console.log('✅ Product ID:', productId);
  console.log('✅ ================================');
  
  return { status: 'success', userId, planType };
}

/**
 * 处理订阅续费成功事件
 */
async function handleSubscriptionPaid(event: CreemWebhookEvent) {
  console.log('💰 ================================');
  console.log('💰 Processing subscription.paid event');
  console.log('💰 Event ID:', event.id);
  console.log('💰 ================================');
  
  const subscription = event.object;
  const metadata = subscription.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Subscription details:');
  console.log('📋 Subscription ID:', subscription.id);
  console.log('📋 Product ID:', subscription.product);
  console.log('📋 Customer ID:', subscription.customer);
  console.log('📋 Status:', subscription.status);
  console.log('📋 Current period end:', subscription.current_period_end_date);
  console.log('📋 Metadata:', metadata);
  console.log('📋 User ID from metadata:', userId);
  
  if (!userId) {
    console.error('❌ No user_id in subscription metadata');
    console.error('❌ Available metadata keys:', Object.keys(metadata));
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 获取产品ID并确定plan_type
  let productId = null;
  
  // 方法1: 从subscription.product获取
  if (subscription.product) {
    if (typeof subscription.product === 'string') {
      productId = subscription.product;
    } else if (subscription.product?.id) {
      productId = subscription.product.id;
    }
    console.log('📋 Product ID from subscription.product:', productId);
  }
  
  // 方法2: 从metadata获取
  if (!productId && metadata.product_id) {
    productId = metadata.product_id;
    console.log('📋 Product ID from metadata.product_id:', productId);
  }
  
  console.log('📋 Final product ID for subscription:', productId);
  
  // 根据product_id确定plan_type
  let planType = null;
  if (productId) {
    planType = getplanTypeFromProductId(productId);
    console.log('🏷️ Plan type from product ID:', planType);
  }
  
  // 如果没有找到plan_type，尝试从metadata获取
  if (!planType && metadata.plan_type) {
    planType = metadata.plan_type as PlanType;
    console.log('🏷️ Plan type from metadata:', planType);
  }
  
  // 续费时更新paid_at和plan_type，重新开始账单周期
  console.log('💾 Updating user_meta for subscription renewal...');
  const updateData: any = {
    is_paid: true,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // 如果能确定plan_type，也要更新它
  if (planType) {
    updateData.plan_type = planType;
    console.log('💾 Will update plan_type to:', planType);
  } else {
    console.warn('⚠️ Could not determine plan_type for subscription.paid event');
    console.warn('⚠️ Product ID:', productId);
    console.warn('⚠️ Metadata plan_type:', metadata.plan_type);
  }
  
  const { error: updateError } = await supabase
    .from('user_meta')
    .update(updateData)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Failed to update user_meta for subscription:', updateError);
    console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('✅ User meta updated for subscription renewal');
    if (planType) {
      console.log('✅ Plan type updated to:', planType);
    }
  }
  
  console.log('📝 Recording subscription payment event...');
  await recordPaymentEvent(event, userId, planType || undefined);
  
  console.log('✅ ================================');
  console.log('✅ Subscription payment processed successfully');
  console.log('✅ User ID:', userId);
  console.log('✅ Subscription ID:', subscription.id);
  console.log('✅ Plan Type:', planType || 'not updated');
  console.log('✅ ================================');
  
  return { status: 'success', userId, action: 'renewed', planType };
}

/**
 * 处理订阅取消/过期事件
 */
/**
 * 处理订阅取消事件 - 用户取消订阅但继续享受服务直到期结束
 */
async function handleSubscriptionCanceled(event: CreemWebhookEvent) {
  console.log('⚠️ ================================');
  console.log('⚠️ Processing subscription.canceled event');
  console.log('⚠️ Event ID:', event.id);
  console.log('⚠️ Note: User canceled but keeps access until period ends');
  console.log('⚠️ ================================');
  
  const subscription = event.object;
  const metadata = subscription.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Subscription cancellation details:');
  console.log('📋 Subscription ID:', subscription.id);
  console.log('📋 Product ID:', subscription.product);
  console.log('📋 Customer ID:', subscription.customer);
  console.log('📋 Status:', subscription.status);
  console.log('📋 Current period end:', subscription.current_period_end_date);
  console.log('📋 Metadata:', metadata);
  console.log('📋 User ID from metadata:', userId);
  
  if (!userId) {
    console.error('❌ No user_id in subscription metadata');
    console.error('❌ Available metadata keys:', Object.keys(metadata));
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 获取当前计划类型
  const planType = getplanTypeFromProductId(subscription.product);
  
  // 订阅取消时，不立即降级，而是标记为将要取消
  // 用户继续享受付费服务直到当前计费周期结束
  console.log('📝 Marking subscription as canceled but keeping current access...');
  
  // 可以添加一个字段来标记订阅将在某个日期失效
  // 但这里我们保持简单，不立即更改用户状态
  // 真正的降级会在 subscription.expired 事件中处理
  
  console.log('📝 Recording subscription cancellation event...');
  await recordPaymentEvent(event, userId, planType || undefined);
  
  console.log('✅ ================================');
  console.log('✅ Subscription cancellation processed');
  console.log('✅ User ID:', userId);
  console.log('✅ Action: marked as canceled (access continues until period end)');
  console.log('✅ Current period end:', subscription.current_period_end_date);
  console.log('✅ ================================');
  
  return { status: 'success', userId, action: 'canceled_but_active' };
}

/**
 * 处理订阅到期事件 - 订阅真正结束，降级到免费套餐
 */
async function handleSubscriptionExpired(event: CreemWebhookEvent) {
  console.log('⏰ ================================');
  console.log('⏰ Processing subscription.expired event');
  console.log('⏰ Event ID:', event.id);
  console.log('⏰ Note: Subscription expired, downgrading to free');
  console.log('⏰ ================================');
  
  const subscription = event.object;
  const metadata = subscription.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Subscription expiration details:');
  console.log('📋 Subscription ID:', subscription.id);
  console.log('📋 Product ID:', subscription.product);
  console.log('📋 Customer ID:', subscription.customer);
  console.log('📋 Status:', subscription.status);
  console.log('📋 Current period end:', subscription.current_period_end_date);
  console.log('📋 Metadata:', metadata);
  console.log('📋 User ID from metadata:', userId);
  
  if (!userId) {
    console.error('❌ No user_id in subscription metadata');
    console.error('❌ Available metadata keys:', Object.keys(metadata));
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 订阅到期，降级到免费套餐
  console.log('⬇️ Downgrading user to free plan due to expiration...');
  const { error: updateError } = await supabase
    .from('user_meta')
    .update({
      is_paid: false,
      plan_type: 'free',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ Failed to downgrade expired user:', updateError);
    console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('✅ User downgraded to free plan due to expiration');
  }
  
  console.log('📝 Recording subscription expiration event...');
  await recordPaymentEvent(event, userId, 'free');
  
  console.log('✅ ================================');
  console.log('✅ Subscription expiration processed successfully');
  console.log('✅ User ID:', userId);
  console.log('✅ Action: downgraded to free due to expiration');
  console.log('✅ ================================');
  
  return { status: 'success', userId, action: 'expired_and_downgraded' };
}

/**
 * 记录支付事件到数据库
 */
async function recordPaymentEvent(
  event: CreemWebhookEvent, 
  userId?: string, 
  planType?: PlanType,
  additionalData?: {
    creem_order_id?: string;
    creem_customer_id?: string;
    amount?: number;
  }
) {
  console.log('📝 ================================');
  console.log('📝 Recording payment event');
  console.log('📝 Event ID:', event.id);
  console.log('📝 Event Type:', event.eventType);
  console.log('📝 User ID:', userId);
  console.log('📝 Plan Type:', planType);
  console.log('📝 Additional Data:', additionalData);
  console.log('📝 ================================');
  
  const eventData = {
      event_id: event.id,
      event_type: event.eventType,
      user_id: userId || null,
      plan_type: planType || null,
      creem_customer_id: additionalData?.creem_customer_id || null,
      creem_order_id: additionalData?.creem_order_id || null,
      amount: additionalData?.amount || null,
      currency: 'usd',
    processed_at: new Date().toISOString(), // 明确设置时间戳
      metadata: event.object
  };
  
  console.log('📝 Inserting event data:', JSON.stringify(eventData, null, 2));
  
  const { error } = await supabase
    .from('payment_events')
    .insert(eventData);
  
  if (error) {
    console.error('❌ Failed to record payment event:', error);
    console.error('❌ Insert error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Payment event recorded successfully:', event.id);
  }
}

/**
 * 根据Creem product_id映射到我们的plan_type
 * 从环境变量读取确保使用线上产品ID
 */
function getplanTypeFromProductId(productId: string): PlanType | null {
  console.log('🏷️ ================================');
  console.log('🏷️ Looking up plan type for product ID:', productId);
  
  // 从环境变量读取产品ID进行映射，确保使用线上配置
  const PRODUCT_MAPPING: Record<string, PlanType> = {
    [creemEnv.PRODUCTS.STARTER_MONTHLY]: 'starter_monthly',
    [creemEnv.PRODUCTS.STARTER_YEARLY]: 'starter_yearly',
    [creemEnv.PRODUCTS.EXPLORER_MONTHLY]: 'explorer_monthly',
    [creemEnv.PRODUCTS.EXPLORER_YEARLY]: 'explorer_yearly',
    [creemEnv.PRODUCTS.CREATOR_MONTHLY]: 'creator_monthly',
    [creemEnv.PRODUCTS.CREATOR_YEARLY]: 'creator_yearly',
  };
  
  console.log('🏷️ Environment product IDs:', creemEnv.PRODUCTS);
  console.log('🏷️ Available product mappings:');
  Object.entries(PRODUCT_MAPPING).forEach(([pid, plan]) => {
    console.log(`🏷️   ${pid} -> ${plan}`);
  });
  
  const mappedPlan = PRODUCT_MAPPING[productId];
  console.log('🏷️ Mapping result:', mappedPlan);
  
  if (!mappedPlan) {
    console.error('❌ ================================');
    console.error('❌ Unknown product_id in webhook:', productId);
    console.error('❌ Available mappings:', Object.keys(PRODUCT_MAPPING));
    console.error('❌ Environment variables check:', creemEnv.PRODUCTS);
    console.error('❌ ================================');
  } else {
    console.log('✅ Product ID mapped successfully:', mappedPlan);
  }
  
  console.log('🏷️ ================================');
  return mappedPlan || null;
}

/**
 * 处理订阅试用期事件
 */
async function handleSubscriptionTrialing(event: CreemWebhookEvent) {
  console.log('🔄 ================================');
  console.log('🔄 Processing subscription.trialing event');
  console.log('🔄 Event ID:', event.id);
  console.log('🔄 ================================');
  
  const subscription = event.object;
  const metadata = subscription.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Subscription trial details:');
  console.log('📋 Subscription ID:', subscription.id);
  console.log('📋 Product ID:', subscription.product);
  console.log('📋 Status:', subscription.status);
  console.log('📋 User ID from metadata:', userId);
  
  if (!userId) {
    console.error('❌ No user_id in subscription trial metadata');
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 获取计划类型
  const planType = getplanTypeFromProductId(subscription.product);
  
  if (planType) {
    // 试用期间给予付费权限但标记为试用
    console.log('💾 Updating user to trial status...');
    const { error: updateError } = await supabase
      .from('user_meta')
      .update({
        is_paid: true, // 试用期间享受付费功能
        plan_type: planType,
        updated_at: new Date().toISOString()
        // 注意：不设置 paid_at，表示这是试用而非真正支付
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('❌ Failed to update user trial status:', updateError);
    } else {
      console.log('✅ User trial status updated');
    }
  }
  
  await recordPaymentEvent(event, userId, planType || undefined);
  
  console.log('✅ Subscription trial processed successfully');
  return { status: 'success', userId, action: 'trial_started' };
}

/**
 * 处理订阅更新/升级事件
 */
async function handleSubscriptionUpdate(event: CreemWebhookEvent) {
  console.log('🔄 ================================');
  console.log('🔄 Processing subscription.update event');
  console.log('🔄 Event ID:', event.id);
  console.log('🔄 ================================');
  
  const subscription = event.object;
  const metadata = subscription.metadata || {};
  const userId = metadata.internal_user_id;
  
  console.log('📋 Subscription update details:');
  console.log('📋 Subscription ID:', subscription.id);
  console.log('📋 New Product ID:', subscription.product);
  console.log('📋 Status:', subscription.status);
  console.log('📋 User ID from metadata:', userId);
  
  if (!userId) {
    console.error('❌ No user_id in subscription update metadata');
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 获取新的计划类型
  const newPlanType = getplanTypeFromProductId(subscription.product);
  
  if (newPlanType) {
    console.log('💾 Updating user to new plan:', newPlanType);
    const { error: updateError } = await supabase
      .from('user_meta')
      .update({
        is_paid: true,
        plan_type: newPlanType,
        paid_at: new Date().toISOString(), // 更新支付时间
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('❌ Failed to update user plan:', updateError);
    } else {
      console.log('✅ User plan updated successfully');
    }
  }
  
  await recordPaymentEvent(event, userId, newPlanType || undefined);
  
  console.log('✅ Subscription update processed successfully');
  return { status: 'success', userId, action: 'plan_updated', newPlan: newPlanType };
}

/**
 * 处理退款事件
 */
async function handleRefundCreated(event: CreemWebhookEvent) {
  console.log('💸 ================================');
  console.log('💸 Processing refund.created event');
  console.log('💸 Event ID:', event.id);
  console.log('💸 RAW EVENT OBJECT:', JSON.stringify(event, null, 2));
  console.log('💸 ================================');
  
  const refund = event.object;
  console.log('💸 REFUND OBJECT TYPE:', typeof refund);
  console.log('💸 REFUND OBJECT KEYS:', Object.keys(refund || {}));
  console.log('💸 FULL REFUND OBJECT:', JSON.stringify(refund, null, 2));
  
  // 检查各种可能的metadata位置
  console.log('💸 METADATA ANALYSIS:');
  console.log('💸 refund.metadata:', refund.metadata);
  console.log('💸 refund.metadata type:', typeof refund.metadata);
  console.log('💸 refund.metadata keys:', Object.keys(refund.metadata || {}));
  
  const metadata = refund.metadata || {};
  console.log('💸 EXTRACTED METADATA:', JSON.stringify(metadata, null, 2));
  
  // 尝试从多个位置获取 user_id
  let userId = null;
  
  // 方法1: 从 refund.checkout.metadata.internal_user_id 获取（真实Creem格式）
  if (refund.checkout?.metadata?.internal_user_id) {
    userId = refund.checkout.metadata.internal_user_id;
    console.log('💸 USER_ID SOURCE: refund.checkout.metadata.internal_user_id =', userId);
  }
  
  // 方法2: 从 refund.subscription.metadata.internal_user_id 获取（真实Creem格式）
  if (!userId && refund.subscription?.metadata?.internal_user_id) {
    userId = refund.subscription.metadata.internal_user_id;
    console.log('💸 USER_ID SOURCE: refund.subscription.metadata.internal_user_id =', userId);
  }
  
  // 方法3: 从 refund.metadata.internal_user_id 获取（测试脚本格式）
  if (!userId && metadata.internal_user_id) {
    userId = metadata.internal_user_id;
    console.log('💸 USER_ID SOURCE: refund.metadata.internal_user_id =', userId);
  }
  
  // 方法4: 从 refund.metadata.user_id 获取
  if (!userId && metadata.user_id) {
    userId = metadata.user_id;
    console.log('💸 USER_ID SOURCE: refund.metadata.user_id =', userId);
  }
  
  // 方法5: 检查是否有其他可能的user_id字段
  if (!userId) {
    console.log('💸 SEARCHING FOR USER_ID IN ALL POSSIBLE LOCATIONS:');
    console.log('💸 refund.checkout:', refund.checkout);
    console.log('💸 refund.subscription:', refund.subscription);
    console.log('💸 refund.metadata:', metadata);
    
    // 检查所有metadata位置
    [
      refund.checkout?.metadata,
      refund.subscription?.metadata,
      metadata
    ].forEach((meta, index) => {
      if (meta) {
        const sources = ['checkout.metadata', 'subscription.metadata', 'refund.metadata'];
        console.log(`💸 Checking ${sources[index]}:`);
        Object.entries(meta).forEach(([key, value]) => {
          console.log(`💸   ${key}: ${value}`);
          if (key.toLowerCase().includes('user') || key.toLowerCase().includes('id')) {
            console.log(`💸   ^^^^ POTENTIAL USER_ID FIELD: ${key} = ${value}`);
          }
        });
      }
    });
  }
  
  // 方法6: 尝试通过order_id查找原始订单的user_id
  const orderId = refund.order?.id || refund.order_id;
  console.log('💸 ================================');
  console.log('💸 ORDER ID ANALYSIS:');
  console.log('💸 refund.order?.id:', refund.order?.id);
  console.log('💸 refund.order_id:', refund.order_id);
  console.log('💸 Final orderId:', orderId);
  console.log('💸 orderId type:', typeof orderId);
  console.log('💸 orderId is truthy:', !!orderId);
  console.log('💸 ================================');
  
  if (!userId && orderId) {
    console.log('💸 ATTEMPTING TO FIND USER_ID BY ORDER_ID:', orderId);
    
    // 先查看payment_events表中所有记录，了解数据结构
    const { data: allEvents, error: allError } = await supabase
      .from('payment_events')
      .select('event_id, event_type, user_id, creem_order_id, plan_type, processed_at')
      .order('processed_at', { ascending: false })
      .limit(10);
    
    console.log('💸 ================================');
    console.log('💸 RECENT PAYMENT_EVENTS RECORDS (for reference):');
    console.log('💸 Query error:', allError);
    console.log('💸 Recent events:', JSON.stringify(allEvents, null, 2));
    console.log('💸 ================================');
    
    // 查找支付事件表中的相关记录
    console.log('💸 SEARCHING FOR MATCHING ORDERS...');
    console.log('💸 Search criteria: creem_order_id =', orderId);
    
    const { data: relatedEvents, error: queryError } = await supabase
      .from('payment_events')
      .select('user_id, plan_type, event_type, metadata, creem_order_id, event_id')
      .eq('creem_order_id', orderId)
      .not('user_id', 'is', null);
    
    console.log('💸 RELATED PAYMENT EVENTS QUERY RESULT:');
    console.log('💸   error:', queryError);
    console.log('💸   data count:', relatedEvents?.length || 0);
    console.log('💸   data:', JSON.stringify(relatedEvents, null, 2));
    
    if (relatedEvents && relatedEvents.length > 0) {
      userId = relatedEvents[0].user_id;
      console.log('💸 ✅ USER_ID FOUND FROM RELATED ORDER:', userId);
    } else {
      console.log('💸 ❌ NO MATCHING ORDERS FOUND');
      
      // 尝试更宽松的查询 - 查找所有包含这个order_id的记录
      console.log('💸 TRYING BROADER SEARCH...');
      const { data: broadSearch, error: broadError } = await supabase
        .from('payment_events')
        .select('user_id, plan_type, event_type, metadata, creem_order_id, event_id')
        .not('user_id', 'is', null);
      
      console.log('💸 BROAD SEARCH RESULTS:');
      console.log('💸   error:', broadError);
      console.log('💸   total records:', broadSearch?.length || 0);
      
      // 检查是否有任何包含这个order_id的记录
      const matchingRecords = broadSearch?.filter(record => {
        console.log(`💸   Checking record: creem_order_id=${record.creem_order_id}, looking for=${orderId}`);
        return record.creem_order_id === orderId;
      });
      
      console.log('💸   Matching records found:', matchingRecords?.length || 0);
      console.log('💸   Matching records:', JSON.stringify(matchingRecords, null, 2));
    }
    
    console.log('💸 ================================');
  } else {
    console.log('💸 SKIPPING ORDER_ID LOOKUP:');
    console.log('💸   userId already found:', !!userId);
    console.log('💸   orderId available:', !!orderId);
    console.log('💸 ================================');
  }
  
  console.log('💸 ================================');
  console.log('💸 FINAL USER_ID RESOLUTION:');
  console.log('💸 User ID:', userId);
  console.log('💸 User ID type:', typeof userId);
  console.log('💸 User ID is truthy:', !!userId);
  console.log('💸 ================================');
  
  console.log('📋 Refund details FINAL:');
  console.log('📋 Refund ID:', refund.id);
  console.log('📋 Order ID (refund.order?.id):', refund.order?.id);
  console.log('📋 Order ID (refund.order_id):', refund.order_id);
  console.log('📋 Final Order ID used:', orderId);
  console.log('📋 Refund Amount:', refund.refund_amount);
  console.log('📋 Amount:', refund.amount);
  console.log('📋 Status:', refund.status);
  console.log('📋 User ID from analysis:', userId);
  
  if (!userId) {
    console.error('❌ ================================');
    console.error('❌ NO USER_ID FOUND IN REFUND EVENT');
    console.error('❌ All metadata keys:', Object.keys(metadata));
    console.error('❌ Metadata values:', JSON.stringify(metadata, null, 2));
    console.error('❌ Refund order_id (refund.order?.id):', refund.order?.id);
    console.error('❌ Refund order_id (refund.order_id):', refund.order_id);
    console.error('❌ Recording event with null user_id...');
    console.error('❌ ================================');
    
    await recordPaymentEvent(event);
    return { status: 'error', message: 'Missing user_id' };
  }
  
  // 退款时降级到免费套餐
  console.log('⬇️ ================================');
  console.log('⬇️ DOWNGRADING USER DUE TO REFUND');
  console.log('⬇️ Target user_id:', userId);
  console.log('⬇️ ================================');
  
  const { error: updateError } = await supabase
    .from('user_meta')
    .update({
      is_paid: false,
      plan_type: 'free',
      updated_at: new Date().toISOString()
      // 保留 paid_at 以记录历史
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('❌ ================================');
    console.error('❌ FAILED TO DOWNGRADE USER AFTER REFUND');
    console.error('❌ Error details:', JSON.stringify(updateError, null, 2));
    console.error('❌ User ID used:', userId);
    console.error('❌ ================================');
  } else {
    console.log('✅ ================================');
    console.log('✅ USER DOWNGRADED AFTER REFUND');
    console.log('✅ User ID:', userId);
    console.log('✅ New plan_type: free');
    console.log('✅ New is_paid: false');
    console.log('✅ ================================');
  }
  
  console.log('📝 RECORDING REFUND PAYMENT EVENT...');
  await recordPaymentEvent(event, userId, 'free', {
    amount: refund.refund_amount || refund.amount,
    creem_order_id: orderId
  });
  
  console.log('✅ ================================');
  console.log('✅ REFUND PROCESSED SUCCESSFULLY');
  console.log('✅ Event ID:', event.id);
  console.log('✅ User ID:', userId);
  console.log('✅ Action: refunded and downgraded');
  console.log('✅ ================================');
  
  return { status: 'success', userId, action: 'refunded' };
}

// 设置运行时
export const runtime = 'nodejs'; 