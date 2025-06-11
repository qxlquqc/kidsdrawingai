const crypto = require('crypto');

async function testWebhook() {
  console.log('🔍 Testing webhook endpoint...\n');

  // 测试1: 无效签名
  console.log('Test 1: Invalid signature');
  try {
    const response1 = await fetch('http://localhost:3002/api/webhooks/creem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'creem-signature': 'invalid_signature'
      },
      body: JSON.stringify({ test: 'data' })
    });
    console.log('Response status:', response1.status);
    console.log('Response text:', await response1.text());
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n---\n');

  // 测试2: 有效签名但简单数据
  console.log('Test 2: Valid signature with simple data');
  const payload = JSON.stringify({ 
    id: "test_event_" + Date.now(),
    eventType: "checkout.completed",
    object: {
      metadata: {
        internal_user_id: "a245e0e0-9228-4854-8342-8e86a9aaa4b7"
      }
    }
  });
  
  const signature = crypto
    .createHmac('sha256', 'whsec_1f6U2zy4RERfhnfoI5ovJa')
    .update(payload)
    .digest('hex');

  try {
    const response2 = await fetch('http://localhost:3002/api/webhooks/creem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'creem-signature': signature
      },
      body: payload
    });
    console.log('Response status:', response2.status);
    console.log('Response text:', await response2.text());
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testWebhook(); 