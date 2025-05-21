/**
 * 下载远程图片为文件
 * @param url 远程图片URL
 * @param filename 保存的文件名
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    console.log(`Downloading image from: ${url}`)
    // 获取图片Blob
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // 创建下载链接
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // 设置下载属性
    link.href = blobUrl
    link.download = filename
    
    // 模拟点击下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 100)
    
    console.log(`Image downloaded as: ${filename}`)
  } catch (error) {
    console.error('Error downloading image:', error)
    throw error
  }
} 