https://docs.creem.io/introduction
https://docs.creem.io/api-reference/introduction
https://docs.creem.io/learn/webhooks/event-types
https://docs.creem.io/learn/checkout-session/introduction
https://docs.creem.io/learn/customers/customer-portal
# Creem API 快速参考（KidsDrawingAI 项目专用）

目前设置的CREEM_WEBHOOK_URL=https://dev.kidsdrawingai.com/api/webhooks/creem

> 认证方式：所有请求统一加头 `x-api-key: $CREEM_API_KEY`
> Base URL：测试环境：https://test-api.creem.io/v1


## 0. 通用字段 & 错误码
| HTTP 码 | 说明 | 常见原因 |
|---------|------|----------|
| 200 | 请求成功 | — |
| 400 | 参数错误 | 缺必填字段 / 类型不符 |
| 401 | Missing API key | 忘了 `x-api-key` |
| 403 | Invalid API key | key 填错环境（Test⬌Live） |
| 404 | 资源不存在 | ID 错 / 已删除 |
| 429 | 速率超限 | 1 min 内调用过多 |
| 500 | Creem 内部错误 | 稍后重试 |

---

## 1. Checkout
checkout  按钮直接跳转到 creem.io 链接，checkout页面直接采用creem.io的

| 操作 | Method & URL | 必填字段 ⭐ | 常用可选 |
|------|--------------|------------|----------|
| **创建会话** | `POST checkouts` | `product_id⭐` | `units` `discount_code` `customer.email` `success_url` `request_id` `metadata` |
| **查询会话** | `GET checkouts/{id}` | — | — |

**200 示例（精简）**
```jsonc
{
  "id":"ch_123","status":"open","checkout_url":"https://checkout…",
  "product":"prod_456","units":1,
  "order":{"id":"ord_abc","amount":4900,"currency":"usd","status":"unpaid"}
}


集成要点
前端点击支付 → 调你自建的 /api/payment/checkout → 拿 checkout_url 跳转

成功后 Creem 会 同时 浏览器回跳 success_url + Webhook checkout.completed

Webhook 事件必验头 creem-signature（HMAC-SHA256）

Customer Portal（可选）

商家可通过 API 生成一次性登录链接，引导用户管理订阅与支付方式。

| 操作               | URL                       | 必填 ⭐           | 返回                                                                   |
| ---------------- | ------------------------- | -------------- | -------------------------------------------------------------------- |
| **生成 Portal 登录** | `POST /customers/billing` | `customer_id⭐` | `{ "customer_portal_link": "https://creem.io/my-orders/login/..." }` |

```ts
const { data } = await axios.post(
  "https://test-api.creem.io/v1/customers/billing",
  { customer_id: "cust_abc" },
  { headers: { "x-api-key": process.env.CREEM_API_KEY! } }
);
// data.customer_portal_link → 重定向
```

## 2. Product
| 操作 | Method & URL | 关键字段 |
|------|--------------|----------|
| **创建产品** | `POST products` | `name⭐` `price⭐` `currency⭐` `billing_type` (`one-time` \| `recurring`) `billing_period` (`every-month`/`every-year`) `description` `image_url` |
| **获取产品** | `GET /products/{id}` | — |
| **搜索列表** | `GET /products/search` | `page_number` `page_size` |

---

## 3. Customer（当前无用）
| 操作 | Method & URL | 查询参数 |
|------|--------------|----------|
| **查客户** | `GET customers` | `customer_id` \| `email` |
## 4. Transactions（当前无用）
| 操作 | Method & URL | 常用过滤 |
|------|--------------|----------|
| **列交易** | `GET transactions` | `customer_id` `product_id` `status` `from` `to` |
> 说明：Transactions 端点只读，常用于后台对账或用户支付历史分页。
## 6. Discount Code（当前无用）
目前仅通过 Creem 后台手动创建折扣码，不在前端或后端主动调用该 API。
| 操作 | Method & URL | 关键字段 |
|------|--------------|----------|
| **创建** | `POST discounts` | `name⭐` `code⭐` `type` (`percentage` \| `amount`) `amount` |
| **获取** | `GET discounts/{id}` | — |
| **删除** | `DELETE discounts/{id}/delete` | — |

---

## 7. Subscription
| 操作 | Method & URL | 关键字段 |
|------|--------------|----------|
| **获取** | `GET subscriptions/{id}` | — |
| **更新** | `POST subscriptions/{id}/update` | `product_id` `update_behavior` (`proration-invoice-next` …) |
| **升级** | `POST subscriptions/{id}/upgrade` | 同上 |
| **取消** | `POST subscriptions/{id}/cancel` | `cancel_at_period_end` (bool) |

> **Webhook 载荷常看字段**：`current_period_end`（时间戳）、`plan_id`、`metadata`。  
> 若 `cancel_at_period_end=true`，建议在用户表写 `will_cancel_at` 供 UI 提示。

---

## 9. Refund
| 操作 | Method & URL | 必填字段 ⭐ |
|------|--------------|------------|
| **创建退款** | `POST refunds` | `order_id⭐` `amount⭐` |
| **查询退款** | `GET refunds/{id}` | — |

Webhook 事件：`refund.created` → 在 Supabase `payments` 表更新 `status = "refunded"` 并回收相应额度。


8. Webhook 8个事件一览（完整）

| 事件                      | 触发时机             |
| ----------------------- | ---------------- |
| `checkout.completed`    | Checkout 单次/首付完成 |
| `subscription.active`   | 新订阅创建并激活         |
| `subscription.paid`     | 订阅周期付款成功         |
| `subscription.trialing` | 订阅进入试用期          |
| `subscription.update`   | 订阅被修改（升级/降级）     |
| `subscription.canceled` | 订阅被取消            |
| `subscription.expired`  | 订阅到期且未续费         |
| `refund.created`        | 退款创建             |

> **处理建议**：仅将 `checkout.completed` / `subscription.paid` 用于**授予**额度，将 `subscription.canceled` / `subscription.expired` / `refund.created` 用于**回收或降级**。

8.1 Webhook 载荷结构示例（subscription.expired）

✅ 此结构适用于 所有 subscription.* 事件，仅 eventType 与内部 status 不同。
{
  "id": "evt_0JhsxCY7oE2Xwdab3kj7O",
  "eventType": "subscription.expired",
  "created_at": 1729999999000,
  "object": {
    "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
    "object": "subscription",
    "product": "prod_d1AY2Sadk9YAvLI0pj97f",
    "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
    "collection_method": "charge_automatically",
    "status": "expired",              // paid | active | canceled | expired
    "current_period_end_date": "2025-07-10T11:40:32Z",
    "metadata": { "internal_user_id": "u_123" },
    "mode": "test"
  }
}
8.2 Webhook 错误处理示例（伪代码）
switch (event.eventType) {
  case 'subscription.paid':
    // 1. upsert payments(status='paid')
    // 2. 增加 user_usage.credits 或延长期限
    break;
  case 'subscription.canceled':
  case 'subscription.expired':
    // 1. payments(status='inactive')
    // 2. 降级 plan_type -> 'free' / 'grace'
    // 3. 发送提醒邮件 (SendGrid)
    break;
  default:
    // 将未知事件记录日志，便于后续支持
}

// 幂等建议：对 event.id 建唯一索引，重复推送直接忽略


## 9. Webhook 基础 & 重试策略

* Creem 通过 **HTTPS POST + JSON** 向 `CREEM_WEBHOOK_URL` 发送事件。
* 如果返回码 ≠200，会自动重试：30 s → 1 min → 5 min → 1 h（最大 4 次）。
* 建议 **立即 `res.status(200).end()`**，再异步处理业务逻辑，避免超时导致重复推送。

> **本地开发**：用 `npx vercel dev --tunnel` 或 `ngrok` 暴露 URL，然后在仪表盘注册。

---

## 10. Webhook 签名校验

Creem 在 Header `creem-signature` 提供 HMAC‑SHA256 签名
Creem 每条推送都带一行签名头，格式固定为：

```text
creem-signature: 3bfa1d6c0f6e8c4...

Node 示例（Next API Route）：

```ts
import crypto from 'crypto';

export const config = { api: { bodyParser: false } };

export default async function creemWebhook(req, res) {
  const rawBody = await getRawBody(req); // 自行实现
   const rawHeader  = req.headers['creem-signature'] ?? '';
   const receivedSig = rawHeader.trim().replace(/\s+/g, ''); // 去意外空格
  const expectedSig = crypto
    .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(
 Buffer.from(receivedSig,'hex'),
  Buffer.from(expectedSig,'hex')
 )) return res.status(401).end('Invalid signature');

  const event = JSON.parse(rawBody.toString());
  // TODO: switch(event.eventType) { … }
  res.status(200).end();
}
```

---

## 11. Metadata 使用指引

**用途**：将内部用户 ID、营销活动、来源渠道等写入订单/订阅，方便 webhook 解析、后台对账。

### 11.1 在 Checkout Session 里添加

```jsonc
POST /checkouts
{
  "product_id": "prod_456",
  "success_url": "https://kidsdrawingai.com/success",
  "request_id": "${userId}-${Date.now()}",
  "metadata": {
    "internal_user_id": "${userId}",
    "campaign": "summer24"
  }
}
```

### 11.2 在 Payment Link 上添加（无代码场景）

```
https://creem.io/pay/prod_abc123?metadata[internal_user_id]=u123&metadata[ref]=youtube
```

### 11.3 Webhook 读取

`event.object.metadata` / `event.object.subscription.metadata` 将携带同样字段，直接落库：

```ts
const meta = event.object.metadata;
const userId = meta.internal_user_id;
```

---

## 12. 集成 Checklist

* [ ] 服务器 `/api/webhooks/creem` 按上文实现验签 & 幂等处理
* [ ] 在 Creem > Developers > Webhooks 登记 Prod & Dev URL
* [ ] 设置 `CREEM_WEBHOOK_SECRET` 环境变量
* [ ] 在 Supabase `payments` 表建立唯一索引 `(event_id)`，避免重复
* [ ] `checkout.completed` → upsert `payments` & 更新 `user_meta.plan_type`
* [ ] `subscription.paid` → 更新 `user_usage.credits` / 续期
* [ ] `subscription.canceled` / `expired` → 降级权限
* [ ] `refund.created` → 标记退款并调整额度