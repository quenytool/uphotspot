/**
 * 今日头条热榜爬虫
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
  const filePath = path.join(DATA_DIR, 'toutiao.json')
  const payload = {
    source: 'toutiao',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[toutiao] 保存 ${data.length} 条数据`)
}

export async function crawlToutiao(): Promise<HotItem[]> {
  console.log('[toutiao] 开始爬取...')

  try {
    // 头条热榜 API
    const response = await fetch('https://www.toutiao.com/api/pc/feed/?tab_name=hot_board&category=news_hot&max_behot_time=0&source=input&request_source=pc_homepage&as=A1D5BB7E5AE6C9C&cp=61E7BBEE5E1B7E1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.toutiao.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const items: HotItem[] = []

    if (json.data) {
      json.data.forEach((item: any, i: number) => {
        if (item.title) {
          items.push({
            id: `toutiao-${Date.now()}-${i}`,
            title: item.title,
            url: item.url || item.article_url || '#',
            source: 'toutiao',
            rank: i + 1,
            heat: item.read_count || item.impression_count || '',
            category: 'news',
            createdAt: new Date().toISOString()
          })
        }
      })
    }

    await saveToFile(items)
    console.log(`[toutiao] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[toutiao] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlToutiao().catch(console.error)
}
