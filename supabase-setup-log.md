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