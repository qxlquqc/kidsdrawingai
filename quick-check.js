// 直接在这里设置环境变量，避免.env问题
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://uigzgukxwlqmogwsfnku.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZ3pndWt4d2xxbW9nd3Nmbmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDQxNzQ0MywiZXhwIjoyMDM1OTkzNDQzfQ.SHBH-o4d5BZs1OZdQrwj32h1RGKlnKGz9IgGT2iIKT8';

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickCheck() {
  console.log('🔍 Quick database check...\n');
  
  try {
    // 检查最近的退款事件
    const { data: refunds, error: refundError } = await supabase
      .from('payment_events')
      .select('event_id, event_type, user_id, creem_order_id, processed_at')
      .eq('event_type', 'refund.created')
      .order('processed_at', { ascending: false })
      .limit(3);

    console.log('Recent refund events:', refunds?.length || 0);
    refunds?.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.event_id} - User: ${r.user_id || 'NULL'} - Order: ${r.creem_order_id} - ${r.processed_at}`);
    });

    // 检查测试order的所有事件
    const { data: testEvents, error: testError } = await supabase
      .from('payment_events')
      .select('event_type, user_id, processed_at')
      .eq('creem_order_id', 'ord_test_fixed_for_refund_1749394000000')
      .order('processed_at', { ascending: false });

    console.log('\nTest order events:', testEvents?.length || 0);
    testEvents?.forEach((e, i) => {
      console.log(`  ${i+1}. ${e.event_type} - User: ${e.user_id || 'NULL'} - ${e.processed_at}`);
    });

    // 检查用户状态
    const { data: user, error: userError } = await supabase
      .from('user_meta')
      .select('is_paid, plan_type, updated_at')
      .eq('user_id', 'a245e0e0-9228-4854-8342-8e86a9aaa4b7')
      .single();

    console.log('\nUser status:');
    if (user) {
      console.log(`  Paid: ${user.is_paid}, Plan: ${user.plan_type}, Updated: ${user.updated_at}`);
    } else {
      console.log('  User not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickCheck(); 