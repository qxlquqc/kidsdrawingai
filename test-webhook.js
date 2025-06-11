const crypto = require('crypto');

// 配置
const WEBHOOK_URL = 'http://localhost:3002/api/webhooks/creem';
const WEBHOOK_SECRET = 'whsec_1f6U2zy4RERfhnfoI5ovJa';
const USER_ID = 'a245e0e0-9228-4854-8342-8e86a9aaa4b7'; // 替换为实际的用户ID

// 固定的测试ID，用于建立关联关系
const FIXED_ORDER_ID = 'ord_test_fixed_for_refund_1749394000000';
const FIXED_CUSTOMER_ID = 'cust_test_fixed_for_refund_1749394000000';

/**
 * ✅ 更新后的测试脚本 - 完全模拟真实Creem webhook格式
 * 
 * 主要修复：
 * 1. checkout.completed事件现在使用正确的数据结构：
 *    - object.order.product (产品ID的正确位置)
 *    - object.product.id (产品详情)
 *    - 完整的Creem webhook载荷结构
 * 
 * 2. 所有subscription事件包含：
 *    - 正确的产品ID位置
 *    - metadata中包含product_id和plan_type
 *    - 符合Creem官方文档的格式
 * 
 * 3. 使用starter_monthly产品ID进行测试
 *    - prod_26evbPr0Zr5QG2pGpFk4bp
 */

// 模拟 Creem webhook 事件 - 支持所有8种事件类型
const mockEvents = {
  // 为手动退款测试准备基础数据 - 创建一个checkout事件
  checkout_completed_for_refund_test: {
    id: "evt_checkout_for_refund_" + Date.now(),
    eventType: "checkout.completed",
    created_at: Date.now(),
    object: {
      id: "ch_for_refund_test_" + Date.now(),
      object: "checkout",
      mode: "test",
      status: "complete",
      order: {
        id: FIXED_ORDER_ID,  // 使用固定的order_id
        mode: "test",
        type: "one-time",
        amount: 999,
        object: "order",
        status: "paid",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        currency: "USD",
        customer: FIXED_CUSTOMER_ID
      },
      customer: {
        id: FIXED_CUSTOMER_ID,
        mode: "test",
        name: "Test User for Refund",
        email: "107060023@qq.com", 
        object: "customer",
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      metadata: {
        internal_user_id: USER_ID,
        plan_type: "creator_monthly"
      },
      created_at: Date.now()
    }
  },
  checkout_completed: {
    id: "evt_test_checkout_" + Date.now(),
    eventType: "checkout.completed",
    created_at: Date.now(),
    object: {
      id: "ch_test_" + Date.now(),
      object: "checkout",
      order: {
        id: "ord_test_" + Date.now(),
        customer: "cust_test_" + Date.now(),
        product: "prod_26evbPr0Zr5QG2pGpFk4bp", // starter_monthly - 正确的产品ID位置
        amount: 999,
        currency: "usd",
        status: "paid",
        type: "recurring",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: "test"
      },
      product: {
        id: "prod_26evbPr0Zr5QG2pGpFk4bp", // 产品详情
        name: "Starter Monthly",
        description: "Monthly starter plan",
        image_url: null,
        price: 999,
        currency: "usd",
        billing_type: "recurring",
        billing_period: "every-month",
        status: "active",
        tax_mode: "exclusive",
        tax_category: "saas",
        default_success_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: "test"
      },
      customer: {
        id: "cust_test_" + Date.now(),
        object: "customer",
        email: "test@kidsdrawingai.com",
        name: "Test User",
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: "test"
      },
      subscription: {
        id: "sub_test_" + Date.now(),
        object: "subscription",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        customer: "cust_test_" + Date.now(),
        collection_method: "charge_automatically",
        status: "active",
        canceled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          internal_user_id: USER_ID,
          username: "107060023",
          plan_type: "starter_monthly"
        },
        mode: "test"
      },
      custom_fields: [],
      status: "completed",
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        source: "kidsdrawingai_test"
      },
      mode: "test"
    }
  },
  
  subscription_active: {
    id: "evt_test_sub_active_" + Date.now(),
    eventType: "subscription.active",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: {
        id: "prod_26evbPr0Zr5QG2pGpFk4bp",
        name: "Starter Monthly",
        description: "Monthly starter plan",
        image_url: null,
        price: 999,
        currency: "usd",
        billing_type: "recurring",
        billing_period: "every-month",
        status: "active",
        tax_mode: "exclusive",
        tax_category: "saas",
        default_success_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: "test"
      },
      customer: {
        id: "cust_test_" + Date.now(),
        object: "customer",
        email: "test@kidsdrawingai.com",
        name: "Test User",
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: "test"
      },
      collection_method: "charge_automatically",
      status: "active",
      current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        product_id: "prod_26evbPr0Zr5QG2pGpFk4bp"
      },
      mode: "test"
    }
  },

  subscription_paid: {
    id: "evt_test_sub_paid_" + Date.now(),
    eventType: "subscription.paid",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: "prod_26evbPr0Zr5QG2pGpFk4bp", // 可以是字符串形式的产品ID
      customer: "cust_test_" + Date.now(),
      collection_method: "charge_automatically",
      status: "paid",
      current_period_start_date: new Date().toISOString(),
      current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_transaction_id: "tran_test_" + Date.now(),
      last_transaction_date: new Date().toISOString(),
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        product_id: "prod_26evbPr0Zr5QG2pGpFk4bp"
      },
      mode: "test"
    }
  },

  subscription_trialing: {
    id: "evt_test_sub_trial_" + Date.now(),
    eventType: "subscription.trialing",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: "prod_26evbPr0Zr5QG2pGpFk4bp",
      customer: "cust_test_" + Date.now(),
      collection_method: "charge_automatically",
      status: "trialing",
      current_period_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        product_id: "prod_26evbPr0Zr5QG2pGpFk4bp"
      },
      mode: "test"
    }
  },

  subscription_update: {
    id: "evt_test_sub_update_" + Date.now(),
    eventType: "subscription.update",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: "prod_Nh7ancB1Ers53vaef8cmp", // 升级到 creator_monthly
      customer: "cust_test_" + Date.now(),
      collection_method: "charge_automatically",
      status: "active",
      current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "creator_monthly",
        product_id: "prod_Nh7ancB1Ers53vaef8cmp"
      },
      mode: "test"
    }
  },

  // 订阅取消事件 - 用户取消订阅，但继续享受服务直到期结束
  // 重要：用户状态不应该立即降级为free，应该保持付费状态直到current_period_end_date
  subscription_canceled: {
    id: "evt_test_sub_canceled_" + Date.now(),
    eventType: "subscription.canceled",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: "prod_26evbPr0Zr5QG2pGpFk4bp",
      customer: "cust_test_" + Date.now(),
      collection_method: "charge_automatically",
      status: "canceled",
      current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 还有30天有效期
      canceled_at: new Date().toISOString(),
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        product_id: "prod_26evbPr0Zr5QG2pGpFk4bp"
      },
      mode: "test"
    }
  },

  // 订阅过期事件 - 订阅真正结束，此时才应该降级为free
  // 重要：只有这个事件应该将用户状态改为free
  subscription_expired: {
    id: "evt_test_sub_expired_" + Date.now(),
    eventType: "subscription.expired",
    created_at: Date.now(),
    object: {
      id: "sub_test_" + Date.now(),
      object: "subscription",
      product: "prod_26evbPr0Zr5QG2pGpFk4bp",
      customer: "cust_test_" + Date.now(),
      collection_method: "charge_automatically",
      status: "expired",
      current_period_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天过期，现在失效
      metadata: {
        internal_user_id: USER_ID,
        username: "107060023",
        plan_type: "starter_monthly",
        product_id: "prod_26evbPr0Zr5QG2pGpFk4bp"
      },
      mode: "test"
    }
  },

  // 模拟终端测试退款 - 包含完整metadata结构
  refund_created: {
    id: "evt_test_refund_" + Date.now(),
    eventType: "refund.created",
    created_at: Date.now(),
    object: {
      id: "ref_test_" + Date.now(),
      object: "refund",
      reason: "duplicate",
      status: "succeeded",
      refund_amount: 300,
      refund_currency: "USD",
      order: {
        id: "ord_test_" + Date.now(),
        mode: "test",
        type: "recurring",
        amount: 999,
        object: "order",
        status: "paid",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        currency: "USD",
        customer: "cust_test_" + Date.now()
      },
      checkout: {
        id: "ch_test_" + Date.now(),
        mode: "test",
        units: 1,
        object: "checkout",
        status: "completed",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        metadata: {
          username: "107060023",
          plan_type: "starter_monthly",
          internal_user_id: USER_ID
        },
        request_id: USER_ID + "-" + Date.now(),
        success_url: "http://localhost:3002/dashboard"
      },
      subscription: {
        id: "sub_test_" + Date.now(),
        mode: "test",
        object: "subscription",
        status: "active",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        customer: "cust_test_" + Date.now(),
        metadata: {
          username: "107060023",
          plan_type: "starter_monthly", 
          internal_user_id: USER_ID
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        canceled_at: null,
        collection_method: "charge_automatically"
      },
      customer: {
        id: "cust_test_" + Date.now(),
        mode: "test",
        name: "Test User",
        email: "107060023@qq.com", 
        object: "customer",
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      created_at: Date.now()
    }
  },

  // 模拟Creem后台手动退款 - 可能缺少某些metadata信息
  refund_created_manual: {
    id: "evt_manual_refund_" + Date.now(),
    eventType: "refund.created", 
    created_at: Date.now(),
    object: {
      id: "ref_manual_" + Date.now(),
      object: "refund",
      reason: "requested_by_customer",
      status: "succeeded",
      refund_amount: 300,
      refund_currency: "USD",
      order: {
        id: FIXED_ORDER_ID,  // 使用固定的order_id，这样可以与checkout_completed事件关联
        mode: "test",
        type: "recurring", 
        amount: 999,
        object: "order",
        status: "paid",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        currency: "USD",
        customer: FIXED_CUSTOMER_ID  // 使用固定的customer_id
      },
      // 模拟手动退款可能缺少checkout信息
      checkout: null,
      // subscription信息可能存在但metadata不完整
      subscription: {
        id: "sub_manual_" + Date.now(),
        mode: "test", 
        object: "subscription",
        status: "active",
        product: "prod_26evbPr0Zr5QG2pGpFk4bp",
        customer: FIXED_CUSTOMER_ID,
        metadata: {
          // 模拟只有部分metadata信息
          plan_type: "creator_monthly"
          // 注意：故意缺少 internal_user_id，模拟真实情况
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        canceled_at: null,
        collection_method: "charge_automatically"
      },
      customer: {
        id: FIXED_CUSTOMER_ID,
        mode: "test",
        name: "Manual Refund User",
        email: "107060023@qq.com",
        object: "customer", 
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      created_at: Date.now()
    }
  }
};

// 生成 HMAC 签名
function generateSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// 发送模拟 webhook
async function sendMockWebhook(eventType) {
  const event = mockEvents[eventType];
  if (!event) {
    console.error('❌ Unknown event type:', eventType);
    console.log('Available event types:', Object.keys(mockEvents).join(', '));
    return;
  }

  const payload = JSON.stringify(event);
  const signature = generateSignature(payload, WEBHOOK_SECRET);

  console.log('🧪 ================================');
  console.log('🧪 Sending mock webhook event');
  console.log('🧪 Event Type:', eventType);
  console.log('🧪 Event ID:', event.id);
  console.log('🧪 User ID:', USER_ID);
  console.log('🧪 Product ID:', event.object.product || 'N/A');
  console.log('🧪 Plan Type:', event.object.metadata?.plan_type || 'N/A');
  console.log('🧪 Status:', event.object.status || 'N/A');
  console.log('🧪 Signature:', signature);
  console.log('🧪 ================================');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'creem-signature': signature
      },
      body: payload
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);

    if (response.ok) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.log('❌ Webhook failed:', response.status, responseText);
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

// 测试所有事件类型
async function testAllWebhooks() {
  console.log('🚀 Starting comprehensive webhook testing...\n');
  
  const eventTypes = Object.keys(mockEvents);
  
  for (let i = 0; i < eventTypes.length; i++) {
    const eventType = eventTypes[i];
    console.log(`\n📋 Testing ${i + 1}/${eventTypes.length}: ${eventType}`);
    
    await sendMockWebhook(eventType);
    
    if (i < eventTypes.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n✅ All webhook tests completed!');
  console.log('📊 Total events tested:', eventTypes.length);
}

// 测试幂等性 - 发送重复事件
async function testIdempotency(eventType = 'checkout_completed') {
  console.log('🔄 Testing idempotency for:', eventType);
  
  const event = mockEvents[eventType];
  if (!event) {
    console.error('❌ Unknown event type:', eventType);
    return;
  }
  
  // 使用固定的事件ID进行幂等性测试
  const fixedEventId = 'evt_idempotency_test_' + Date.now();
  
  // 发送同一个事件3次，使用相同的事件ID
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🔄 Attempt ${i}/3 - Same event ID: ${fixedEventId}`);
    
    // 创建测试事件的副本并设置固定ID
    const testEvent = {
      ...event,
      id: fixedEventId,
      created_at: Date.now()
    };
    
    const payload = JSON.stringify(testEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    console.log('🧪 ================================');
    console.log('🧪 Sending mock webhook event (idempotency test)');
    console.log('🧪 Event Type:', testEvent.eventType);
    console.log('🧪 Event ID:', testEvent.id);
    console.log('🧪 Attempt:', i);
    console.log('🧪 ================================');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'creem-signature': signature
        },
        body: payload
      });

      console.log('📡 Response status:', response.status);
      const responseText = await response.text();
      console.log('📡 Response body:', responseText);

      if (response.ok) {
        if (i === 1) {
          console.log('✅ First request: Event processed successfully');
        } else {
          console.log('✅ Duplicate request: Should be skipped due to idempotency');
        }
      } else {
        console.log('❌ Webhook failed:', response.status, responseText);
      }

    } catch (error) {
      console.error('💥 Network error:', error.message);
    }
    
    if (i < 3) {
      console.log('⏳ Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n✅ Idempotency test completed!');
  console.log('📝 Check your database - there should be only ONE record for event ID:', fixedEventId);
}

// 执行测试
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const eventType = args[1];
  
  if (command === 'idempotency' || command === 'idem') {
    testIdempotency(eventType);
  } else if (command === 'all') {
    testAllWebhooks();
  } else if (command && mockEvents[command]) {
    sendMockWebhook(command);
  } else if (command) {
    console.error('❌ Unknown command or event type:', command);
    console.log('\n📚 Usage:');
    console.log('  node test-webhook.js [event_type]    - Test specific event');
    console.log('  node test-webhook.js all             - Test all events');
    console.log('  node test-webhook.js idempotency     - Test idempotency');
    console.log('  node test-webhook.js                 - Test all events (default)');
    console.log('\n💸 Refund Testing:');
    console.log('  node test-webhook.js refund_created         - Test terminal refund (full metadata)');
    console.log('  node test-webhook.js refund_created_manual  - Test manual refund (missing user_id)');
    console.log('\n📋 Available event types:', Object.keys(mockEvents).join(', '));
  } else {
    testAllWebhooks();
  }
}

module.exports = { sendMockWebhook, mockEvents, testAllWebhooks, testIdempotency }; 