require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentRefunds() {
  console.log('🔍 Checking recent refund events...\n');
  
  // 查询最近的退款事件
  const { data: refundEvents, error: refundError } = await supabase
    .from('payment_events')
    .select('*')
    .eq('event_type', 'refund.created')
    .order('processed_at', { ascending: false })
    .limit(5);

  if (refundError) {
    console.error('❌ Error fetching refund events:', refundError);
    return;
  }

  console.log('📊 Recent refund events:');
  console.log('Total refund events:', refundEvents?.length || 0);
  console.log('');
  
  refundEvents?.forEach((record, index) => {
    console.log(`${index + 1}. Event ID: ${record.event_id}`);
    console.log(`   User ID: ${record.user_id || 'NULL ❌'}`);
    console.log(`   Order ID: ${record.creem_order_id || 'NULL'}`);
    console.log(`   Plan Type: ${record.plan_type || 'NULL'}`);
    console.log(`   Amount: ${record.amount || 'NULL'}`);
    console.log(`   Processed: ${record.processed_at}`);
    console.log(`   Metadata keys: ${Object.keys(record.metadata || {}).join(', ')}`);
    console.log('');
  });

  // 特别检查我们测试用的固定order_id
  console.log('🎯 Checking test order records...');
  
  const { data: testOrderEvents, error: testError } = await supabase
    .from('payment_events')
    .select('*')
    .eq('creem_order_id', 'ord_test_fixed_for_refund_1749394000000')
    .order('processed_at', { ascending: false });

  if (testError) {
    console.error('❌ Error fetching test order events:', testError);
  } else {
    console.log(`Found ${testOrderEvents?.length || 0} events for test order:`);
    testOrderEvents?.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.event_type} - User: ${record.user_id || 'NULL ❌'} - ${record.processed_at}`);
    });
  }

  // 检查用户当前状态
  console.log('\n👤 Checking user status...');
  const { data: userMeta, error: userError } = await supabase
    .from('user_meta')
    .select('user_id, is_paid, plan_type, paid_at, updated_at')
    .eq('user_id', 'a245e0e0-9228-4854-8342-8e86a9aaa4b7');

  if (userError) {
    console.error('❌ Error fetching user meta:', userError);
  } else if (userMeta && userMeta.length > 0) {
    const user = userMeta[0];
    console.log(`User ID: ${user.user_id}`);
    console.log(`Is Paid: ${user.is_paid}`);
    console.log(`Plan Type: ${user.plan_type}`);
    console.log(`Paid At: ${user.paid_at || 'NULL'}`);
    console.log(`Updated At: ${user.updated_at}`);
  } else {
    console.log('❌ User not found');
  }
}

checkRecentRefunds().catch(console.error); 