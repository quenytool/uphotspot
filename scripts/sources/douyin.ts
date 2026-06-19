/**
 * 抖音热榜爬虫
 * 使用 fetch
 */

import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || './data'

interface HotItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat?: string
  category: string
  createdAt: string
}

async function saveToFile(data: HotItem[]) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {}
  const filePath = path.join(DATA_DIR, 'douyin.json')
  const payload = {
    source: 'douyin',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[douyin] 保存 ${data.length} 条数据`)
}

export async function crawlDouyin(): Promise<HotItem[]> {
  console.log('[douyin] 开始爬取...')

  try {
    // 抖音热榜 API
    const response = await fetch('https://www.douyin.com/aweme/v1/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.douyin.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const items: HotItem[] = []

    if (json.data && json.data.word_list) {
      json.data.word_list.forEach((item: any, i: number) => {
        items.push({
          id: `douyin-${Date.now()}-${i}`,
          title: item.word || item.sentence || item.query,
          url: `https://www.douyin.com/search/${encodeURIComponent(item.word || item.query)}`,
          source: 'douyin',
          rank: i + 1,
          heat: `${item.hot_value || 0}`,
          category: 'video',
          createdAt: new Date().toISOString()
        })
      })
    }

    await saveToFile(items)
    console.log(`[douyin] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[douyin] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlDouyin().catch(console.error)
}
