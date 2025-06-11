# Supabase设置日志

## 2024/07/08 - Supabase初始化配置

### 1. 安装Supabase依赖包

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. 创建数据库类型定义

创建文件：`lib/database.types.ts`

该文件定义了数据库表结构类型，包括：
- `user_meta` 表：存储用户元数据，包括用户ID、用户名、头像URL、付费状态
- `user_usage` 表：记录用户使用情况，包括日期和生成次数

### 3. 创建Supabase客户端工具

#### 服务端客户端

创建文件：`lib/supabase-server.ts`

用于服务端组件和API路由中访问Supabase，使用Next.js的cookies API进行会话管理。

#### 浏览器端客户端

创建文件：`lib/supabase-browser.ts`

用于客户端组件中访问Supabase，实现了客户端单例模式避免重复创建客户端实例。

#### 辅助工具函数

创建文件：`lib/supabase.ts`

导出类型定义和通用工具函数，如`getPublicUrl`用于获取存储文件的公共URL。

### 4. 实现图片上传功能

创建文件：`lib/uploadToSupabase.ts`

实现了将图片上传到Supabase Storage的功能，包含：
- 文件大小验证（限制5MB）
- 文件类型验证（仅接受图片文件）
- 超时控制（15秒）
- 自动重试机制（最多3次，使用指数退避策略）
- 详细的日志记录

### 5. 实现远程图片下载功能

创建文件：`lib/downloadBlob.ts`

实现了从URL下载图片为本地文件的功能，使用Blob API和动态创建下载链接的方式。

### 6. Supabase Storage图床设置 (2024/07/08手动完成)

已在Supabase后台完成以下设置：
- 创建名为"uploads"的公共存储桶用于图片上传
- 设置storage.objects访问策略:
  - 策略1: `allow select for all users` - 允许所有用户查看上传的图片
    - 使用条件: `true` (无限制)
  - 策略2: `allow insert for anon and login` - 允许匿名和已登录用户上传图片
    - 使用条件: `(auth.role() = 'anon'::text) OR (auth.uid() IS NOT NULL)`

这些策略确保:
1. 所有用户可以查看上传的图片，使图片能被公开访问
2. 不管用户是否登录都可以上传图片，支持匿名使用图片转换功能
3. 通过使用Supabase的RLS (Row Level Security)，保证基本的安全限制

### 7. 错误修复 (2024/07/08)

修复了Supabase依赖安装路径问题：

- 问题：最初安装命令在根目录(E:\1)执行而非项目目录(E:\1\kidsdrawingai)，导致依赖文件错误地创建在根目录
- 解决：在项目目录下重新安装依赖
  ```bash
  cd kidsdrawingai
  npm install @supabase/supabase-js @supabase/ssr
  ```
- 验证：确认依赖已正确安装到项目目录中
  ```bash
  npm list @supabase/supabase-js @supabase/ssr
  ```

## 2024/07/08 - 图像转换功能实现

### 1. Supabase图床集成

已成功实现以下功能：
- 上传组件与Supabase Storage集成
- 上传图片到uploads存储桶
- 获取公共URL用于API调用
- 完整的错误处理和重试机制，包括超时控制

### 2. 组件开发

创建了以下组件，全部集成Supabase功能：
- `UploadPanel.tsx`: 集成Supabase上传功能，支持拖放上传和文件选择
- `ResultDisplay.tsx`: 显示结果图片，支持下载和社交媒体分享

### 3. 页面开发

实现了transform/image页面：
- 所有组件完全集成
- 状态管理与Supabase客户端集成
- 通过公共API调用Replicate AI处理图像
- 使用Supabase托管上传图片 

## 2024/05/24 - 数据库架构更新

### 添加updated_at字段到user_usage表

在表结构中添加了标准timestamp字段用于跟踪记录更新时间：

- **表名**：user_usage
- **更新内容**：添加updated_at字段
- **字段详情**：
  - 名称：updated_at
  - 类型：TIMESTAMPTZ (带时区的时间戳)
  - 默认值：now()
  - 允许NULL：是
  - 说明：记录最后更新时间

- **执行的SQL**：
  ```sql
  ALTER TABLE user_usage 
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  
  -- 更新所有现有记录的updated_at字段为当前时间
  UPDATE user_usage 
  SET updated_at = now() 
  WHERE updated_at IS NULL;
  
  -- 添加注释说明字段用途
  COMMENT ON COLUMN user_usage.updated_at IS '记录最后更新时间';
  ```

- **解决的问题**：修复了代码中引用`updated_at`字段但数据库中不存在该字段的错误
- **错误信息**：`{code: "PGST704", message: "Could not find the 'updated_at' column of 'user_usage' in the schema cache"}` 

## 2024/12/29 - 套餐系统架构更新

### 添加plan_type字段到user_meta表

为支持多层级付费套餐，在user_meta表中添加plan_type字段：

- **表名**：user_meta
- **更新内容**：添加plan_type字段，实现套餐分级管理
- **字段详情**：
  - 名称：plan_type
  - 类型：TEXT
  - 默认值：'free'
  - 允许NULL：否
  - 约束：CHECK (plan_type IN ('free', 'starter_monthly', 'starter_yearly', 'explorer_monthly', 'explorer_yearly', 'creator_monthly', 'creator_yearly'))
  - 说明：用户套餐类型，支持7种完整套餐计划

- **套餐级别定义（共7种）**：
  - `free`：免费用户（0次/月，需付费才能使用）
  - `starter_monthly`：入门套餐月付（50次/月，$7.99/月）
  - `starter_yearly`：入门套餐年付（50次/月，$59/年一次性付费，显示$5/月促销）
  - `explorer_monthly`：探索套餐月付（200次/月，$14.99/月）
  - `explorer_yearly`：探索套餐年付（200次/月，$99/年一次性付费，显示$9/月促销）
  - `creator_monthly`：创作套餐月付（500次/月，$30/月）
  - `creator_yearly`：创作套餐年付（500次/月，$199/年一次性付费，显示$17/月促销)

- **执行的SQL**：
  ```sql
  -- 1. 新增 plan_type 字段到 user_meta 表
  ALTER TABLE user_meta 
  ADD COLUMN plan_type TEXT DEFAULT 'free';

  -- 2. 添加字段注释
  COMMENT ON COLUMN user_meta.plan_type IS '用户套餐类型: free, starter_monthly, starter_yearly, explorer_monthly, explorer_yearly, creator_monthly, creator_yearly';

  -- 3. 创建检查约束
  ALTER TABLE user_meta 
  ADD CONSTRAINT user_meta_plan_type_check 
  CHECK (plan_type IN (
    'free', 
    'starter_monthly', 
    'starter_yearly', 
    'explorer_monthly', 
    'explorer_yearly', 
    'creator_monthly', 
    'creator_yearly'
  ));

  -- 4. 为现有记录设置合适的 plan_type 值
  UPDATE user_meta 
  SET plan_type = 'starter_monthly' 
  WHERE is_paid = true;

  -- 5. 创建索引
  CREATE INDEX idx_user_meta_plan_type ON user_meta(plan_type);
  CREATE INDEX idx_user_meta_user_plan ON user_meta(user_id, plan_type);

  -- 6. 验证结果
  SELECT plan_type, is_paid, COUNT(*) as user_count 
  FROM user_meta 
  GROUP BY plan_type, is_paid 
  ORDER BY plan_type;
  ```

- **业务逻辑更新**：
  - 免费用户无试用次数，必须付费才能使用转换功能
  - 保留is_paid字段作为付费状态标识（向后兼容）
  - plan_type字段精确控制不同套餐和计费周期的使用限制
  - 现有付费用户自动升级为starter_monthly套餐
  - 月付和年付分别管理，支持用户在计费周期间切换

- **数据一致性保障**：
  - 数据库约束确保套餐类型有效性
  - 索引优化提升查询性能


## 2024/12/29 - Supabase计数逻辑核心优化

### 账单周期计数系统实现

#### 核心改进
- **目标**：从自然月计数改为基于用户付费日期的30天账单周期
- **符合**：Supabase官方计费最佳实践

## 2024/12/30 - Payment Events 表创建

### 创建payment_events表用于Creem支付集成

为支持Creem支付webhook集成，创建专门的支付事件表：

- **表名**：payment_events
- **目的**：记录所有Creem支付相关事件，确保webhook处理的幂等性
- **特性**：包含用户自读RLS策略、事件类型约束、支持UPSERT操作

```sql
-- 创建payment_events表
CREATE TABLE public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT,
    creem_customer_id TEXT,
    creem_order_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 事件类型约束
    CONSTRAINT payment_events_event_type_check 
    CHECK (event_type IN (
        'checkout.completed',
        'subscription.active', 
        'subscription.paid',
        'subscription.trialing',
        'subscription.update',
        'subscription.canceled',
        'subscription.expired',
        'refund.created'
    )),
    
    -- 套餐类型约束（与user_meta保持一致）
    CONSTRAINT payment_events_plan_type_check 
    CHECK (plan_type IN (
        'free',
        'starter_monthly',
        'starter_yearly', 
        'explorer_monthly',
        'explorer_yearly',
        'creator_monthly',
        'creator_yearly'
    ) OR plan_type IS NULL)
);

-- 创建索引
CREATE UNIQUE INDEX idx_payment_events_event_id ON public.payment_events(event_id);
CREATE INDEX idx_payment_events_user_id ON public.payment_events(user_id);
CREATE INDEX idx_payment_events_type ON public.payment_events(event_type);
CREATE INDEX idx_payment_events_processed_at ON public.payment_events(processed_at DESC);

-- 启用RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- RLS策略1：用户可以查看自己的支付事件
CREATE POLICY "Users can view own payment events" ON public.payment_events
    FOR SELECT USING (auth.uid() = user_id);

-- RLS策略2：Service role可以管理所有支付事件（webhook使用）
CREATE POLICY "Service role can manage payment events" ON public.payment_events
    FOR ALL USING (auth.role() = 'service_role');

-- 授权给service role
GRANT ALL ON public.payment_events TO service_role;

-- 添加注释
COMMENT ON TABLE public.payment_events IS 'Creem支付事件记录表，确保webhook处理幂等性';
COMMENT ON COLUMN public.payment_events.event_id IS 'Creem事件唯一标识，确保幂等性';
COMMENT ON COLUMN public.payment_events.event_type IS 'Creem事件类型';
COMMENT ON COLUMN public.payment_events.user_id IS '关联用户ID';
COMMENT ON COLUMN public.payment_events.plan_type IS '对应的套餐类型';
COMMENT ON COLUMN public.payment_events.metadata IS '完整的webhook载荷数据';
```

### UPSERT函数（可选）

为方便webhook处理，创建UPSERT函数：

```sql
-- 创建payment_events的UPSERT函数
CREATE OR REPLACE FUNCTION upsert_payment_event(
    p_event_id TEXT,
    p_event_type TEXT,
    p_user_id UUID,
    p_plan_type TEXT DEFAULT NULL,
    p_creem_customer_id TEXT DEFAULT NULL,
    p_creem_order_id TEXT DEFAULT NULL,
    p_amount INTEGER DEFAULT NULL,
    p_currency TEXT DEFAULT 'usd',
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.payment_events (
        event_id,
        event_type,
        user_id,
        plan_type,
        creem_customer_id,
        creem_order_id,
        amount,
        currency,
        metadata
    ) VALUES (
        p_event_id,
        p_event_type,
        p_user_id,
        p_plan_type,
        p_creem_customer_id,
        p_creem_order_id,
        p_amount,
        p_currency,
        p_metadata
    )
    ON CONFLICT (event_id) 
    DO UPDATE SET
        processed_at = NOW(),
        metadata = EXCLUDED.metadata
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授权给service role使用此函数
GRANT EXECUTE ON FUNCTION upsert_payment_event TO service_role;
```

### 执行验证

```sql
-- 验证表创建
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_events'
ORDER BY ordinal_position;

-- 验证约束
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'payment_events';

-- 验证RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'payment_events';
```

## 2025/01/02 - Google OAuth客户端配置记录

### Google Cloud Console OAuth配置更新

根据用户提供的Google Cloud Console配置截图，记录当前OAuth客户端设置：

- **配置时间**：2025年01月02日
- **操作类型**：OAuth客户端配置验证
- **配置项目**：Google OAuth 2.0客户端配置

#### 已获授权的JavaScript来源（共3个）：
1. `https://eohxvswbydnwybzrupng.supabase.co` - Supabase项目域名
2. `https://kidsdrawingai.com` - 生产环境域名  
3. `http://localhost:3002` - 本地开发环境

#### 已获授权的重定向URI（共3个）：
1. `https://eohxvswbydnwybzrupng.supabase.co/auth/v1/callback` - Supabase OAuth回调地址
2. `https://kidsdrawingai.com/auth/v1/callback` - 生产环境OAuth回调地址
3. `http://localhost:3002/auth/v1/callback` - 本地开发OAuth回调地址

#### 客户端密钥信息：
- **客户端密钥**：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（已启用状态）
- **创建日期**：2025年5月22日 GMT+8 11:12:27
- **状态**：✅ 已启用

#### 配置目的：
支持Google OAuth登录在多个环境下的正常运行：
- 生产环境：kidsdrawingai.com
- Supabase环境：eohxvswbydnwybzrupng.supabase.co  
- 本地开发：localhost:3002

## 2025/01/02 - Supabase Authentication URL配置记录

### Supabase URL Configuration设置

- **配置时间**：2025年01月02日
- **操作类型**：URL Configuration配置验证
- **配置位置**：Supabase Dashboard -> Authentication -> URL Configuration

#### Site URL配置：
- **Site URL**：`https://kidsdrawingai.com`
- **说明**：默认重定向URL，用于认证重定向的默认地址

#### Redirect URLs配置（共7个）：
1. `https://kidsdrawingai.com` - 生产环境主域名
2. `https://kidsdrawingai.com/` - 生产环境主域名（带斜杠）
3. `http://localhost:3002` - 本地开发环境
4. `https://kidsdrawingai.com/reset-password` - 生产环境密码重置页面
5. `https://kidsdrawingai.com/auth/callback` - 生产环境认证回调
6. `http://localhost:3002/reset-password` - 本地开发密码重置页面
7. `http://localhost:3002/auth/callback` - 本地开发认证回调

## 2025/01/02 - Supabase邮件模板配置记录

### Supabase Email Templates设置

- **配置时间**：2025年01月02日
- **操作类型**：邮件模板配置验证
- **配置位置**：Supabase Dashboard -> Authentication -> Emails -> Templates -> Reset Password

#### 邮件限制提醒：
- **状态**：显示Email rate-limits和restrictions警告
- **说明**：使用内置邮件服务，有速率限制，不适用于生产应用

#### Reset Password邮件模板配置：
- **Subject heading**：`Reset Your Password`
- **Message body**（HTML源码）：
  ```html
  <h2>Reset Password</h2>
  <p>Follow this link to reset the password for your user:</p>
  <p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset Password</a></p>
  ```

#### 邮件模板说明：
- 使用Supabase模板变量：`{{ .SiteURL }}`、`{{ .TokenHash }}`
- 重定向路径：`/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
- 支持密码重置功能完整流程