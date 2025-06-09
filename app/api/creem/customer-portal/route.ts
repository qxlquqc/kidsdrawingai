import { NextRequest, NextResponse } from 'next/server';
import { creemEnv, validateCreemEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase-server';

/**
 * 创建Creem Customer Portal链接
 * 根据Creem官方文档: https://docs.creem.io/learn/customers/customer-portal
 */
export async function POST(request: NextRequest) {
  console.log('🎛️ ================================');
  console.log('🎛️ Customer Portal API called');
  console.log('🎛️ Timestamp:', new Date().toISOString());
  console.log('🎛️ URL:', request.url);
  console.log('🎛️ Method:', request.method);
  console.log('🎛️ ================================');
  
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
    
    // 3. 检查用户是否为付费用户
    console.log('💰 Checking user payment status...');
    const { data: userMeta, error: userError } = await supabase
      .from('user_meta')
      .select('is_paid, plan_type')
      .eq('user_id', user.id)
      .single();
    
    console.log('💰 User meta result:', { userMeta, error: userError });
    
    if (userError || !userMeta?.is_paid) {
      console.error('❌ User is not a paid subscriber');
      return NextResponse.json(
        { error: 'Only paid subscribers can access billing portal' },
        { status: 403 }
      );
    }
    
    console.log('✅ User is paid subscriber with plan:', userMeta.plan_type);
    
    // 4. 获取用户的customer_id
    console.log('🔍 Looking up customer ID from payment events...');
    const { data: paymentEvents, error: paymentError } = await supabase
      .from('payment_events')
      .select('creem_customer_id, metadata, event_type')
      .eq('user_id', user.id)
      .not('creem_customer_id', 'is', null)
      .order('processed_at', { ascending: false })
      .limit(5); // 获取最近的几条记录
    
    console.log('🔍 Payment events result:', { 
      count: paymentEvents?.length || 0, 
      events: paymentEvents?.map(e => ({ 
        event_type: e.event_type, 
        has_customer_id: !!e.creem_customer_id 
      })) || [],
      error: paymentError 
    });
    
    let customerId = null;
    
    // 从payment events中查找customer_id
    if (paymentEvents && paymentEvents.length > 0) {
      for (const event of paymentEvents) {
        if (event.creem_customer_id) {
          customerId = event.creem_customer_id;
          console.log(`✅ Found customer ID from ${event.event_type} event:`, customerId);
          break;
        }
      }
    }
    
    // 如果还是没找到，尝试从metadata中提取
    if (!customerId && paymentEvents && paymentEvents.length > 0) {
      for (const event of paymentEvents) {
        const metadata = event.metadata;
        if (metadata && (metadata.customer || metadata.customer_id)) {
          customerId = metadata.customer || metadata.customer_id;
          console.log(`✅ Found customer ID from ${event.event_type} metadata:`, customerId);
          break;
        }
      }
    }
    
    if (!customerId) {
      console.error('❌ Could not find customer ID for user');
      console.error('❌ This might happen for:');
      console.error('❌ 1. Old subscriptions before customer ID tracking');
      console.error('❌ 2. Test users without real payment events');
      console.error('❌ 3. Users who paid through external methods');
      
      // 为测试用户提供友好的错误信息
      if (user.email?.includes('test') || user.email?.includes('@qq.com')) {
        return NextResponse.json(
          { 
            error: 'Customer portal not available for test accounts. This feature works with real subscriptions created through the payment system.',
            is_test_user: true
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Unable to access billing portal. Please contact support if you have an active subscription.' },
        { status: 404 }
      );
    }
    
    // 5. 调用Creem API创建Customer Portal链接
    console.log('📡 ================================');
    console.log('📡 Calling Creem Customer Portal API');
    console.log('📡 API URL:', `${creemEnv.API_URL}/customers/billing`);
    console.log('📡 Customer ID:', customerId);
    console.log('📡 API Key (first 10 chars):', creemEnv.API_KEY?.substring(0, 10) + '...');
    console.log('📡 ================================');
    
    const portalData = {
      customer_id: customerId
    };
    
    const response = await fetch(`${creemEnv.API_URL}/customers/billing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creemEnv.API_KEY
      },
      body: JSON.stringify(portalData)
    });
    
    console.log('📡 Creem Customer Portal API response status:', response.status);
    console.log('📡 Creem Customer Portal API response headers:', Object.fromEntries(response.headers.entries()));
    
    // 先获取原始响应文本
    const responseText = await response.text();
    console.log('📡 Creem Customer Portal API raw response:', responseText);
    
    if (!response.ok) {
      console.error('❌ ================================');
      console.error('❌ Creem Customer Portal API error:');
      console.error('❌ Status:', response.status);
      console.error('❌ Status Text:', response.statusText);
      console.error('❌ Response body:', responseText);
      console.error('❌ Request URL:', `${creemEnv.API_URL}/customers/billing`);
      console.error('❌ Request body:', JSON.stringify(portalData, null, 2));
      console.error('❌ ================================');
      
      // 尝试解析错误响应
      let errorMessage = 'Failed to create customer portal link';
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
    let portalResponse: { customer_portal_link: string };
    try {
      portalResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse success response as JSON:', parseError);
      console.error('❌ Response text was:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from billing system' },
        { status: 500 }
      );
    }
    
    console.log('✅ ================================');
    console.log('✅ Customer Portal link created successfully');
    console.log('✅ Portal link:', portalResponse.customer_portal_link);
    console.log('✅ User ID:', user.id);
    console.log('✅ Customer ID:', customerId);
    console.log('✅ ================================');
    
    return NextResponse.json({
      success: true,
      customer_portal_link: portalResponse.customer_portal_link
    });
    
  } catch (error) {
    console.error('💥 ================================');
    console.error('💥 Customer Portal API error:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 ================================');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 