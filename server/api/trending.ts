import { calculateTrends, saveSnapshot, type TrendItem } from '../utils/snapshotStorage'

const validSources = ['weibo', 'zhihu', 'douyin', 'weixin', 'baidu', 'toutiao', 'v2ex', 'douban', 'github', 'bilibili', 'hupu', 'tieba', 'juejin', '36kr']

const UAPIS_API_HOST = process.env.UAPIS_API_HOST || 'https://uapis.cn'
const UAPIS_API_KEY = process.env.UAPIS_API_KEY || ''

export default defineEventHandler(async (event): Promise<{
  source: string
  updatedAt: string
  count: number
  data: TrendItem[]
}> => {
  const query = getQuery(event)
  const source = query.source as string | undefined
  const days = Math.min(parseInt(query.days as string) || 7, 30)

  // 获取当前数据并保存快照
  const sourcesToFetch = source ? [source] : validSources

  for (const src of sourcesToFetch) {
    try {
      const srcData = await fetchFromMcp(src)
      const list = Array.isArray(srcData.list) ? srcData.list : []
      if (list.length > 0) {
        const items = list.map((item: any, idx: number) => ({
          id: String(item.index || idx + 1),
          title: item.title || '',
          url: item.url || '#',
          source: src,
          rank: Number(item.index || idx + 1),
          heat: item.hot_value ? Number(item.hot_value).toLocaleString() : '',
          category: inferCategory(src),
          createdAt: srcData.update_time || new Date().toISOString()
        }))
        await saveSnapshot(src, items)
      }
    } catch (error) {
      console.warn(`Failed to fetch snapshot for ${src}:`, error)
    }
  }

  // 计算趋势
  const trends = await calculateTrends(source, days)

  return {
    source: source || 'all',
    updatedAt: new Date().toISOString(),
    count: trends.length,
    data: trends
  }
})

function inferCategory(source: string) {
  if (['github', 'v2ex', 'juejin'].includes(source)) return 'developer'
  if (['douyin', 'bilibili'].includes(source)) return 'ent'
  if (['zhihu', 'tieba', 'douban'].includes(source)) return 'community'
  if (['hupu'].includes(source)) return 'sports'
  if (['36kr'].includes(source)) return 'news'
  return 'news'
}

async function fetchFromMcp(source: string): Promise<any> {
  if (!UAPIS_API_KEY) {
    return { list: [] }
  }

  try {
    const response = await fetch(`${UAPIS_API_HOST}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: UAPIS_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_misc_hotboard',
          arguments: { type: source },
        },
        id: Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status}`)
    }

    const result = await response.json()
    if (result.error || result.result?.isError) {
      throw new Error('MCP error')
    }

    const dataText = result.result?.content?.[0]?.text || '{}'
    return JSON.parse(dataText)
  } catch {
    return { list: [] }
  }
}
