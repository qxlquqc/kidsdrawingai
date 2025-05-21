import { TypedSupabaseClient } from './supabase'

// 上传超时时间（毫秒）
const UPLOAD_TIMEOUT = 15000 // 15秒
// 最大重试次数
const MAX_RETRIES = 3
// 重试延迟（毫秒）
const RETRY_DELAY = 1000 // 1秒

type UploadOptions = {
  file: File
  bucketName: string
  path?: string
  upsert?: boolean
}

// 带有超时控制的fetch
async function fetchWithTimeout(
  promise: Promise<any>,
  timeout: number
): Promise<any> {
  let timer: NodeJS.Timeout | undefined = undefined
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Upload request timeout'))
    }, timeout)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    if (timer) clearTimeout(timer)
    return result
  } catch (error) {
    if (timer) clearTimeout(timer)
    throw error
  }
}

/**
 * 上传文件到Supabase Storage，带重试和超时机制
 */
export async function uploadToSupabase({
  file,
  bucketName,
  path = '',
  upsert = false,
  supabaseClient,
}: UploadOptions & { supabaseClient: TypedSupabaseClient }): Promise<string> {
  // 验证文件大小（最大5MB）
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit')
  }

  // 验证文件类型（仅接受图片）
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validImageTypes.includes(file.type)) {
    throw new Error('Only image files are allowed')
  }

  // 添加随机字符串到文件名，避免冲突
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  
  // 完整的存储路径
  const fullPath = path ? `${path}/${fileName}` : fileName
  
  console.log(`Uploading file: ${fileName} to ${bucketName}/${path}`)

  // 带重试的上传函数
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES}`)
      
      // 带超时的上传请求
      const { error, data } = await fetchWithTimeout(
        supabaseClient.storage
          .from(bucketName)
          .upload(fullPath, file, { upsert }),
        UPLOAD_TIMEOUT
      )
      
      if (error) {
        throw error
      }
      
      console.log('Upload successful:', data?.path)
      
      // 获取文件的公开URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(fullPath)
      
      return publicUrl
    } catch (error: any) {
      lastError = error
      console.error(`Upload attempt ${attempt} failed:`, error.message)
      
      if (attempt < MAX_RETRIES) {
        // 使用指数退避延迟
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Failed to upload file after multiple attempts')
} 