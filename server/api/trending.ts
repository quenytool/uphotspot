import { calculateTrends, saveSnapshot, type TrendItem } from '../utils/snapshotStorage'
import { UapiClient } from 'uapi-sdk-typescript'

const validSources = ['weibo', 'zhihu', 'douyin', 'qq-news', 'baidu', 'toutiao', '52pojie', 'hellogithub', 'douban-group', 'douban-movie', 'github', 'bilibili', 'hupu', 'tieba', 'juejin', '36kr', 'sspai', 'jianshu']

const UAPIS_API_KEY = process.env.UAPIS_API_KEY || ''
const uapiClient = UAPIS_API_KEY ? new UapiClient('https://uapis.cn', UAPIS_API_KEY) : null

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
          heat: (item.hot_value && !isNaN(Number(item.hot_value))) ? Number(item.hot_value).toLocaleString() : '',
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
  if (['github', '52pojie', 'juejin', 'sspai'].includes(source)) return 'developer'
  if (['douyin', 'bilibili'].includes(source)) return 'ent'
  if (['zhihu', 'tieba', 'douban-group', 'jianshu'].includes(source)) return 'community'
  if (['hupu'].includes(source)) return 'sports'
  if (['36kr', 'qq-news', 'douban-movie'].includes(source)) return 'news'
  return 'news'
}

async function fetchFromMcp(source: string): Promise<any> {
  if (!uapiClient) {
    return { list: [] }
  }

  try {
    const response = await uapiClient.misc.getMiscHotboard({ type: source as any })
    return response
  } catch {
    return { list: [] }
  }
}
