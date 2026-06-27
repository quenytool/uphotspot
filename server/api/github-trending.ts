import { saveSnapshot, type SnapshotItem } from '../utils/snapshotStorage'
import { UapiClient } from 'uapi-sdk-typescript'

const UAPIS_API_KEY = process.env.UAPIS_API_KEY || ''
const uapiClient = UAPIS_API_KEY ? new UapiClient('https://uapis.cn', UAPIS_API_KEY) : null

/**
 * GitHub 热榜定时抓取接口
 * 由 Vercel Cron 每天自动调用 (vercel.json 配置)
 */
export default defineEventHandler(async (event): Promise<{
  success: boolean
  source: string
  updatedAt: string
  count: number
  error?: string
}> => {
  const source = 'github'

  console.log(`[Cron] Starting daily GitHub trending fetch...`)

  try {
    const srcData = await fetchFromUapis(source)
    const list = Array.isArray(srcData.list) ? srcData.list : []

    if (list.length === 0) {
      console.warn(`[Cron] No data fetched for ${source}`)
      return {
        success: false,
        source,
        updatedAt: new Date().toISOString(),
        count: 0,
        error: 'No data fetched'
      }
    }

    const items: SnapshotItem[] = list.map((item: any, idx: number) => ({
      id: String(item.index || idx + 1),
      title: item.title || '',
      url: item.url || '#',
      source,
      rank: Number(item.index || idx + 1),
      heat: (item.hot_value && !isNaN(Number(item.hot_value)))
        ? Number(item.hot_value).toLocaleString()
        : '',
      category: 'developer',
      createdAt: srcData.update_time || new Date().toISOString()
    }))

    await saveSnapshot(source, items)

    console.log(`[Cron] GitHub trending saved: ${items.length} items`)

    return {
      success: true,
      source,
      updatedAt: new Date().toISOString(),
      count: items.length
    }
  } catch (error) {
    console.error(`[Cron] Failed to fetch GitHub trending:`, error)
    return {
      success: false,
      source,
      updatedAt: new Date().toISOString(),
      count: 0,
      error: String(error)
    }
  }
})

async function fetchFromUapis(source: string): Promise<any> {
  if (!uapiClient) {
    console.warn('[Cron] UAPIS_API_KEY not configured')
    return { list: [] }
  }

  try {
    const response = await uapiClient.misc.getMiscHotboard({ type: source as any })
    return response
  } catch (error) {
    console.error(`[Cron] UAPIS fetch failed for ${source}:`, error)
    return { list: [] }
  }
}
