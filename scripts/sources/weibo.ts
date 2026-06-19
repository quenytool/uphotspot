/**
 * 微博热榜爬虫
 * 使用 fetch + cheerio
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
  const filePath = path.join(DATA_DIR, 'weibo.json')
  const payload = {
    source: 'weibo',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[weibo] 保存 ${data.length} 条数据`)
}

export async function crawlWeibo(): Promise<HotItem[]> {
  console.log('[weibo] 开始爬取...')

  try {
    // 微博热榜 API
    const response = await fetch('https://api.weibo.com/ajax/side/hotSearch', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://weibo.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const items: HotItem[] = []

    if (json.data && json.data.realtime) {
      json.data.realtime.forEach((item: any, i: number) => {
        items.push({
          id: `weibo-${Date.now()}-${i}`,
          title: item.word || item.topic_name,
          url: item.topic_url?.startsWith('http') ? item.topic_url : `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word)}`,
          source: 'weibo',
          rank: i + 1,
          heat: `${item.num}万`,
          category: 'social',
          createdAt: new Date().toISOString()
        })
      })
    }

    await saveToFile(items)
    console.log(`[weibo] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[weibo] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlWeibo().catch(console.error)
}
