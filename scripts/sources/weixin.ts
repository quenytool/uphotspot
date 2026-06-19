/**
 * 微信热榜爬虫
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
  const filePath = path.join(DATA_DIR, 'weixin.json')
  const payload = {
    source: 'weixin',
    updatedAt: new Date().toISOString(),
    count: data.length,
    data
  }
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`[weixin] 保存 ${data.length} 条数据`)
}

export async function crawlWeixin(): Promise<HotItem[]> {
  console.log('[weixin] 开始爬取...')

  try {
    // 微信搜一搜热榜 API
    const response = await fetch('https://mp.weixin.qq.com/cgi-bin/searchbiz?action=search_biz&offset=0&count=10&query=%E5%BF%85%E8%AF%BB&scene=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mp.weixin.qq.com/',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const items: HotItem[] = []

    // 微信热榜需要特殊处理，这里用搜狗微信搜索代替
    // 简单返回空数据，实际可手动添加
    console.log('[weixin] 微信热榜需要特殊处理，暂时跳过')

    await saveToFile(items)
    console.log(`[weixin] 完成! 获取 ${items.length} 条数据`)
    return items
  } catch (error) {
    console.error('[weixin] 爬取失败:', error)
    return []
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlWeixin().catch(console.error)
}
