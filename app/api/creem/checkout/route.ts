import { NextRequest, NextResponse } from 'next/server';
import { creemEnv, validateCreemEnv } from '@/lib/env';
import { CreateCheckoutRequest, CreemCheckoutSession } from '@/lib/creem/types';
import { createClient } from '@/lib/supabase-server';

/**
 * 创建Creem支付会话
 */
export async function POST(request: NextRequest) {
  console.log('🛒 ================================');
  console.log('🛒 Checkout API called');
  console.log('🛒 Timestamp:', new Date().toISOString());
  console.log('🛒 URL:', request.url);
  console.log('🛒 Method:', request.method);
  
  try {
    // 1. 验证环境变量
    const envValidation = validateCreemEnv();
    if (!envValidation.valid) {
      console.error('❌ Missing Creem environment variables:', envValidation.missingVars);
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }
    
    // 2. 验证用户登录状态
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 Auth result:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 3. 解析请求参数
    const body = await request.json();
    console.log('📋 Request body received:', body);
    
    const { plan_type } = body;
    console.log('📋 Plan type:', plan_type);
    
    if (!plan_type) {
      console.error('❌ Missing plan_type in request body');
      return NextResponse.json(
        { error: 'Missing plan_type' }, 
        { status: 400 }
      );
    }
    
    // 4. 获取对应的product_id
    console.log('🏷️ Looking up product ID for plan:', plan_type);
    const productId = getProductIdForPlan(plan_type);
    console.log('🏷️ Product ID result:', productId);
    
    if (!productId) {
      console.error('❌ Invalid plan_type:', plan_type);
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }
    
    // 5. 获取用户信息
    const { data: userMeta } = await supabase
      .from('user_meta')
      .select('username')
      .eq('user_id', user.id)
      .single();
    
    // 6. 构建checkout请求 (注意：Creem API 不支持 cancel_url 字段)
    const checkoutData: CreateCheckoutRequest = {
      product_id: productId,
      customer: {
        email: user.email
      },
      success_url: `${request.nextUrl.origin}/dashboard`,

      request_id: `${user.id}-${Date.now()}`,
      metadata: {
        internal_user_id: user.id,
        username: userMeta?.username || 'Unknown',
        plan_type: plan_type
      }
    };
    
    console.log('📡 ================================');
    console.log('📡 Preparing Creem API request:');
    console.log('📡 API URL:', creemEnv.API_URL);
    console.log('📡 API Key (first 10 chars):', creemEnv.API_KEY?.substring(0, 10) + '...');
    console.log('📡 Product ID:', productId);
    console.log('📡 Checkout data:', checkoutData);
    console.log('📡 ================================');
    
    // 7. 调用Creem API创建checkout session
    console.log('🚀 Calling Creem checkout API...');
    const response = await fetch(`${creemEnv.API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creemEnv.API_KEY
      },
      body: JSON.stringify(checkoutData)
    });
    
    console.log('📡 Creem API response status:', response.status);
    console.log('📡 Creem API response headers:', Object.fromEntries(response.headers.entries()));
    
    // 先获取原始响应文本，以便在出错时查看详细信息
    const responseText = await response.text();
    console.log('📡 Creem API raw response:', responseText);
    
    if (!response.ok) {
      console.error('❌ ================================');
      console.error('❌ Creem API error:');
      console.error('❌ Status:', response.status);
      console.error('❌ Status Text:', response.statusText);
      console.error('❌ Response body:', responseText);
      console.error('❌ Request URL:', `${creemEnv.API_URL}/checkouts`);
      console.error('❌ Request headers:', {
        'Content-Type': 'application/json',
        'x-api-key': creemEnv.API_KEY ? `${creemEnv.API_KEY.substring(0, 10)}...` : 'MISSING'
      });
      console.error('❌ Request body:', JSON.stringify(checkoutData, null, 2));
      console.error('❌ ================================');
      
      // 尝试解析错误响应
      let errorMessage = 'Failed to create checkout session';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('❌ Parsed error data:', errorData);
      } catch (parseError) {
        console.error('❌ Failed to parse error response as JSON:', parseError);
      }
      
      return NextResponse.json(
        { error: errorMessage, details: responseText },
        { status: response.status }
      );
    }
    
    // 解析成功响应
    let checkoutSession: CreemCheckoutSession;
    try {
      checkoutSession = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse success response as JSON:', parseError);
      console.error('❌ Response text was:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from payment provider' },
        { status: 500 }
      );
    }
    
    console.log('✅ ================================');
    console.log('✅ Creem checkout session created:');
    console.log('✅ Session ID:', checkoutSession.id);
    console.log('✅ Checkout URL:', checkoutSession.checkout_url);
    console.log('✅ Status:', checkoutSession.status);
    console.log('✅ Product:', checkoutSession.product);
    console.log('✅ Order ID:', checkoutSession.order?.id);
    console.log('✅ Full response:', checkoutSession);
    console.log('✅ ================================');
    
    // 8. 返回checkout URL
    return NextResponse.json({
      checkout_url: checkoutSession.checkout_url,
      session_id: checkoutSession.id
    });
    
  } catch (error) {
    console.error('💥 ================================');
    console.error('💥 Checkout API error:');
    console.error('💥 Error:', error);
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('💥 ================================');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 根据plan_type获取对应的Creem product_id
 * 从环境变量读取确保使用线上产品ID
 */
function getProductIdForPlan(planType: string): string | null {
  // 从环境变量读取产品ID，确保使用线上配置
  const PLAN_TO_PRODUCT_MAP: Record<string, string> = {
    'starter_monthly': creemEnv.PRODUCTS.STARTER_MONTHLY,
    'starter_yearly': creemEnv.PRODUCTS.STARTER_YEARLY,
    'explorer_monthly': creemEnv.PRODUCTS.EXPLORER_MONTHLY,
    'explorer_yearly': creemEnv.PRODUCTS.EXPLORER_YEARLY,
    'creator_monthly': creemEnv.PRODUCTS.CREATOR_MONTHLY,
    'creator_yearly': creemEnv.PRODUCTS.CREATOR_YEARLY,
  };
  
  const productId = PLAN_TO_PRODUCT_MAP[planType];
  
  if (!productId) {
    console.error('❌ Unknown plan_type in checkout:', planType);
    console.log('📋 Available plan types:', Object.keys(PLAN_TO_PRODUCT_MAP));
    console.log('📋 Environment product IDs:', creemEnv.PRODUCTS);
  }
  
  return productId || null;
} 