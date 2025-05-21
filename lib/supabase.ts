import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

// 从storage中获取文件公共URL
export function getPublicUrl(client: TypedSupabaseClient, bucketName: string, path: string): string {
  const { data } = client.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
} 