// 创建统一的Supabase客户端导出
// 这个文件作为单一入口点来导出所有需要的Supabase客户端工具

export { createClient } from './supabase-browser'
export { createClient as createServerClient } from './supabase-server'

// 统一导出类型
export type { Database } from './database.types'

// 导出客户端API函数
export * from './supabaseApiBrowser'

// 这个文件的目的是确保项目中所有组件使用统一的Supabase客户端实例
// 而不是在各个组件中重复创建客户端实例 