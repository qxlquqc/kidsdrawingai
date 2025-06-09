require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPaymentEvents() {
  console.log('🔍 Checking recent payment_events...\n');
  
  // 查询最近的3条记录
  const { data, error } = await supabase
    .from('payment_events')
    .select('event_id, event_type, user_id, creem_order_id, plan_type, processed_at')
    .order('processed_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Recent payment events:');
  console.log('Total records:', data?.length || 0);
  console.log('');
  
  data?.forEach((record, index) => {
    console.log(`${index + 1}. Event ID: ${record.event_id}`);
    console.log(`   Event Type: ${record.event_type}`);
    console.log(`   User ID: ${record.user_id || 'NULL ❌'}`);
    console.log(`   Order ID: ${record.creem_order_id || 'NULL'}`);
    console.log(`   Plan Type: ${record.plan_type || 'NULL'}`);
    console.log(`   Processed: ${record.processed_at}`);
    console.log('');
  });

  // 特别查找我们的固定order_id
  console.log('🎯 Looking for our test order_id: ord_test_fixed_for_refund_1749394000000');
  
  const { data: testData, error: testError } = await supabase
    .from('payment_events')
    .select('*')
    .eq('creem_order_id', 'ord_test_fixed_for_refund_1749394000000');

  if (testError) {
    console.error('❌ Test query error:', testError);
  } else {
    console.log('🔍 Test order records found:', testData?.length || 0);
    testData?.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.event_type} - User: ${record.user_id || 'NULL ❌'}`);
    });
  }
}

checkPaymentEvents().catch(console.error); 