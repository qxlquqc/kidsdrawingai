// Flux Kontext Pro模型ID
export const FLUX_MODEL_ID = 'black-forest-labs/flux-kontext-pro';

// 默认提示词，当用户未提供时使用
export const DEFAULT_PROMPT = 'A cute and clean illustration of a simple character or object based on this uploaded sketch, soft colors and harmonious style';

// 风格选项及对应的映射提示词
export const STYLE_OPTIONS = [
  {
    id: 'any',
    name: 'Any',
    emoji: '✨',
    a_prompt: 'clean and high quality illustration, complete structure, soft lines',
  },
  {
    id: '3d',
    name: '3D',
    emoji: '🧊',
    a_prompt: '3D render, friendly design, soft colors, simple shapes, clear structure',
  },
  {
    id: 'anime',
    name: 'Anime',
    emoji: '🎭',
    a_prompt: 'anime style, sharp lines, pastel colors, clean design',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    emoji: '📺',
    a_prompt: 'cartoon style, bold outlines, simplified shapes',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    emoji: '🧙',
    a_prompt: 'fantasy art, magical lighting, soft colors, storybook illustration',
  },
  {
    id: 'coloring',
    name: 'Coloring Page',
    emoji: '📝',
    a_prompt: 'coloring book illustration, black and white lineart only, no color, no shading, minimalistic',
  },
  {
    id: 'painting',
    name: 'Painting',
    emoji: '🎨',
    a_prompt: 'oil painting style, canvas texture, visible brush strokes',
  },
  {
    id: 'pixelart',
    name: 'Pixel Art',
    emoji: '👾',
    a_prompt: 'pixel art style, low resolution look, sharp edges, retro colors',
  },
  {
    id: 'sketch',
    name: 'Sketch Painting',
    emoji: '✏️',
    a_prompt: 'sketch style, pencil strokes, watercolor effect, textured paper background',
  },
  {
    id: 'realistic',
    name: 'Realistic',
    emoji: '📷',
    a_prompt: 'realistic rendering, soft shadows, natural proportions, clear detail',
  },
];

// 预设的轮询延迟（毫秒）
const POLL_INTERVAL = 1000;
// 最大轮询次数（约5分钟）
const MAX_POLL_COUNT = 300;
// 网络请求超时（毫秒）
const REQUEST_TIMEOUT = 15000;

// 图像转换参数接口
export interface TransformParams {
  // 图像URL (必需)
  imageUrl: string;
  // 用户提示词，若不提供则使用默认值
  prompt?: string;
  // 选择的风格ID，对应STYLE_OPTIONS中的id
  styleId?: string;
  // 是否遵循原始绘图 (0.1-30，默认9) - 注意：新API中此参数不再使用
  
  followDrawingStrength?: number;
  // 自定义图像分辨率 - 注意：新API中此参数不再使用，改用aspect_ratio
  resolution?: '256' | '512' | '768';
}

// 图像转换结果接口
export interface TransformResult {
  // 是否成功
  success: boolean;
  // 错误信息（若失败）
  error?: string;
  // 结果图像URL（若成功）
  outputUrl?: string;
}

/**
 * 带超时控制的fetch
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  console.log(`开始请求: ${url}`, {
    method: options.method,
    timeout: timeout
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    
    console.log(`请求完成: ${url}`, {
      status: response.status,
      ok: response.ok
    });
    
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error(`请求失败: ${url}`, error);
    throw error;
  }
}

/**
 * 创建Replicate API预测
 */
async function createPrediction(params: TransformParams): Promise<{ id: string, error?: string }> {


  // 确定实际使用的基础提示词
  const basePrompt = params.prompt && params.prompt.trim() !== '' ? params.prompt : DEFAULT_PROMPT;

  
  // 确定风格对应的映射提示词
  let selectedStyleId = params.styleId || 'any';
  // 确保styleId存在于STYLE_OPTIONS中
  const validStyleIds = STYLE_OPTIONS.map(s => s.id);
  if (!validStyleIds.includes(selectedStyleId)) {
    // 可能无用，待确认 - 原warn日志
    selectedStyleId = 'any'; // 切换到默认风格
  }
  
  const style = STYLE_OPTIONS.find(s => s.id === selectedStyleId);
  const defaultStyle = STYLE_OPTIONS[0];
  
  // 确保一定有风格对象
  const finalStyle = style || defaultStyle;

  
  // 构建最终的prompt：用户输入 + style映射提示词 + 质量补充语句
  const finalPrompt = `${basePrompt}, ${finalStyle.a_prompt}, high quality, professional, beautiful composition`;
  

  
  // 构建完整的输入参数（新的Flux Kontext Pro API格式）
  const input: any = {
    prompt: finalPrompt,
    aspect_ratio: params.imageUrl ? "match_input_image" : "1:1", // 无图片时使用方形比例
    output_format: "png",
    safety_tolerance: 2,
    seed: undefined // 让系统随机生成
  };
  
  // 只有当有图片URL时才添加input_image参数
  if (params.imageUrl && params.imageUrl.trim() !== '') {
    input.input_image = params.imageUrl;
  }
  

  
  // 获取API令牌
  const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '';
  
  if (!REPLICATE_API_TOKEN) {
    console.error('⚠️ 无法获取 REPLICATE_API_TOKEN，请检查环境变量配置');
    return { id: '', error: 'Missing API token' };
  }
  
  // 首先尝试通过我们的API路由调用
  try {
    const response = await fetchWithTimeout(
      '/api/replicate/predictions', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: FLUX_MODEL_ID,
          input: input,
        }),
        // 禁用缓存
        cache: 'no-store'
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('API路由错误，尝试直接调用:', error);
      // 失败后尝试直接调用Replicate API
      return await directReplicateCall(FLUX_MODEL_ID, input, REPLICATE_API_TOKEN);
    }

    const data = await response.json();
    
    return { id: data.id };
  } catch (error: any) {
    console.error('通过API路由创建预测失败:', error);
    
    // 尝试直接调用Replicate API作为备用方案
    return await directReplicateCall(FLUX_MODEL_ID, input, REPLICATE_API_TOKEN);
  }
}

/**
 * 直接调用Replicate API的备用方案
 */
async function directReplicateCall(
  modelId: string, 
  input: any, 
  token: string
): Promise<{ id: string, error?: string }> {
  try {
    const response = await fetchWithTimeout(
      'https://api.replicate.com/v1/predictions', 
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: modelId,
          input: input,
        }),
        // 禁用缓存 
        cache: 'no-store'
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('直接调用Replicate API失败:', error);
      return { id: '', error: `Direct API call error: ${error}` };
    }

    const data = await response.json();
    
    return { id: data.id };
  } catch (error: any) {
    console.error('直接调用Replicate API失败:', error);
    return { id: '', error: error.message };
  }
}

/**
 * 直接获取预测结果的备用方案
 */
async function directGetPrediction(
  id: string,
  token: string
): Promise<{ status: string; output: string | null; error?: string }> {
  try {
    const response = await fetchWithTimeout(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        // 禁用缓存
        cache: 'no-store'
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`直接获取预测结果失败: ${error}`);
      return { status: 'failed', output: null, error: error };
    }

    const result = await response.json();
    
    return result;
  } catch (error: any) {
    console.error('直接获取预测结果失败:', error);
    return { status: 'failed', output: null, error: error.message };
  }
}

/**
 * 获取预测结果
 */
async function getPrediction(id: string): Promise<{ status: string; output: string | null; error?: string }> {
  // 获取API令牌
  const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '';
  
  if (!REPLICATE_API_TOKEN) {
    console.error('⚠️ 无法获取 REPLICATE_API_TOKEN，请检查环境变量配置');
    return { status: 'failed', output: null, error: 'Missing API token' };
  }
  
  try {
    const response = await fetchWithTimeout(
      `/api/replicate/predictions/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // 禁用缓存
        cache: 'no-store'
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`通过API路由获取预测失败: ${error}，尝试直接调用`);
      // 失败后尝试直接调用
      return await directGetPrediction(id, REPLICATE_API_TOKEN);
    }

    const result = await response.json();
    
    return result;
  } catch (error: any) {
    console.error('通过API路由获取预测失败:', error);
    
    // 失败后尝试直接调用
    return await directGetPrediction(id, REPLICATE_API_TOKEN);
  }
}

/**
 * 转换图像的主函数
 * @param params 转换参数
 * @param onProgress 进度回调，返回0-100的进度值
 * @returns 转换结果
 */
export async function transformImage(
  params: TransformParams,
  onProgress?: (progress: number) => void
): Promise<TransformResult> {
  // 尝试禁用Next.js缓存
  try {
    // 动态导入unstable_noStore以避免服务器端渲染错误
    const { unstable_noStore } = await import('next/cache');
    unstable_noStore();
  } catch (e) {
    // 可能无用，待确认 - 原缓存禁用警告
  }

  console.log('🎨 开始图像转换过程', {
    hasImageUrl: !!params.imageUrl,
    hasPrompt: !!params.prompt,
    styleId: params.styleId,
    imageUrlPreview: params.imageUrl.substring(0, 50) + '...'
  });
  
  // 首先验证前端环境变量是否正确配置
  const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '';
  
  console.log('前端环境变量检查:', {
    REPLICATE_API_TOKEN_SET: !!REPLICATE_API_TOKEN,
    REPLICATE_API_TOKEN_PREFIX: REPLICATE_API_TOKEN ? REPLICATE_API_TOKEN.substring(0, 3) : 'none'
  });
  
  if (!REPLICATE_API_TOKEN) {
    console.error('⚠️ NEXT_PUBLIC_REPLICATE_API_TOKEN 未在环境变量中正确配置');
    return {
      success: false,
      error: 'API configuration error: NEXT_PUBLIC_REPLICATE_API_TOKEN is not set. Please check your .env.local file.'
    };
  }
  
  // 初始化进度为0%
  onProgress?.(0);
  
  try {
    // 创建预测
    console.log('步骤1: 创建预测任务');
    const { id, error } = await createPrediction(params);
    
    if (error || !id) {
      console.error('创建预测失败', { error });
      return {
        success: false,
        error: error || 'Failed to create prediction'
      };
    }
    
    console.log('创建预测成功', { id });
    onProgress?.(10); // 创建预测成功，进度10%
    
    // 轮询获取结果
    let pollCount = 0;
    let status: string = 'starting';
    let output: string | null = null;
    
    console.log('步骤2: 开始轮询获取结果');
    
    while (pollCount < MAX_POLL_COUNT) {
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
      // 获取预测状态
      pollCount++;
      console.log(`轮询第 ${pollCount} 次，上一次状态: ${status}`);
      
      try {
        const prediction = await getPrediction(id);
        status = prediction.status;
        
        console.log(`轮询结果：状态=${status}`, {
          pollCount, 
          hasOutput: !!prediction.output
        });
        
        // 根据状态更新进度
        if (status === 'starting') {
          onProgress?.(Math.min(10 + (pollCount * 2), 20)); // 10-20%，确保不超过20%
        } else if (status === 'processing') {
          // 修复进度条不会下降的问题
          // 使用一个逐渐接近80%但不会超过80%的计算公式
          // 使用1-e^(-x)类型的函数，随着pollCount增加，进度会逐渐接近但不超过80%
          const progressMax = 60; // 最大增加60%，即总进度最高80%
          const rate = 0.05; // 控制进度增长速度的系数
          const progressIncrement = progressMax * (1 - Math.exp(-rate * pollCount));
          const processingProgress = 20 + progressIncrement;
          
          console.log(`计算进度: 基础20% + 增量${progressIncrement.toFixed(2)}% = ${processingProgress.toFixed(2)}%`);
          onProgress?.(Math.min(processingProgress, 80)); // 确保不超过80%
        } else if (status === 'succeeded') {
          output = prediction.output;
          onProgress?.(100); // 100%
          console.log('预测成功完成', { 
            hasOutput: !!output,
            outputUrl: output
              ? output.substring(0, 30) + '...' 
              : '无输出'
          });
          break;
        } else if (status === 'failed' || status === 'canceled') {
          console.error(`预测${status === 'failed' ? '失败' : '被取消'}`, { 
            error: prediction.error 
          });
          return {
            success: false,
            error: prediction.error || `Prediction ${status}`,
          };
        }
      } catch (pollError) {
        console.error(`轮询请求失败（第${pollCount}次）`, pollError);
        // 继续下一次轮询而不是立即失败
      }
      
      // 如果达到轮询上限仍未完成，返回超时错误
      if (pollCount >= MAX_POLL_COUNT) {
        console.error('预测超时', { 
          pollCount, 
          maxPollCount: MAX_POLL_COUNT,
          lastStatus: status 
        });
        return {
          success: false,
          error: 'Prediction timed out. Please try again.',
        };
      }
    }
    
    // 检查输出结果
    if (!output || typeof output !== 'string') {
      console.error('预测成功但没有有效输出', { output });
      return {
        success: false,
        error: 'No valid output image generated',
      };
    }
    
    // 成功返回结果
    console.log('图像转换成功', { 
      outputUrl: output.substring(0, 50) + '...'
    });
    return {
      success: true,
      outputUrl: output,
    };
  } catch (error: any) {
    console.error('Transform error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
} 