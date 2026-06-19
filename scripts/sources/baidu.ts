/**
 * 百度热榜爬虫
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
  const filePath = path.join(DATA_DIR, 'baidu.json')
  const payload = {
    source: 'baidu',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[baidu] 保存 ${data.length} 条数据`)
}

export async function crawlBaidu(): Promise<HotItem[]> {
  console.log('[baidu] 开始爬取...')

  try {
    // 百度热搜榜 API
    const response = await fetch('https://top.baidu.com/api/bdbase/getHotList/queryId=&category=realtime&platform=wise&tag=0&srcFrom=homepage', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://top.baidu.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const items: HotItem[] = []

    if (json.data && json.data.content) {
      json.data.content.forEach((item: any, i: number) => {
        items.push({
          id: `baidu-${Date.now()}-${i}`,
          title: item.query || item.word,
          url: item.url || '#',
          source: 'baidu',
          rank: i + 1,
          heat: item.hotScore?.toString() || item.score || '',
          category: 'search',
          createdAt: new Date().toISOString()
        })
      })
    }

    await saveToFile(items)
    console.log(`[baidu] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[baidu] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlBaidu().catch(console.error)
}
