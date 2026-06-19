/**
 * 知乎热榜爬虫
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
  const filePath = path.join(DATA_DIR, 'zhihu.json')
  const payload = {
    source: 'zhihu',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[zhihu] 保存 ${data.length} 条数据`)
}

export async function crawlZhihu(): Promise<HotItem[]> {
  console.log('[zhihu] 开始爬取...')

  try {
    const response = await fetch('https://www.zhihu.com/api/v4/featured-text-hot/total-hosts', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.zhihu.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const items: HotItem[] = []

    if (json.data) {
      json.data.forEach((item: any, i: number) => {
        items.push({
          id: `zhihu-${Date.now()}-${i}`,
          title: item.target.title || item.title,
          url: item.target.url || item.url || '#',
          source: 'zhihu',
          rank: i + 1,
          heat: item.detail_text || item.metrics || '',
          category: 'community',
          createdAt: new Date().toISOString()
        })
      })
    }

    await saveToFile(items)
    console.log(`[zhihu] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[zhihu] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlZhihu().catch(console.error)
}
