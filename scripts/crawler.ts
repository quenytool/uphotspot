/**
 * 爬虫主程序
 * 爬取各平台热榜数据
 */

import { crawlWeibo } from './sources/weibo.js'
import { crawlZhihu } from './sources/zhihu.js'
import { crawlBaidu } from './sources/baidu.js'
import { crawlDouyin } from './sources/douyin.js'
import { crawlWeixin } from './sources/weixin.js'
import { crawlToutiao } from './sources/toutiao.js'

const DATA_DIR = process.env.DATA_DIR || './data'

async function main() {
  console.log('🚀 开始爬取热榜数据...')
  console.log(`📁 数据存储目录: ${DATA_DIR}`)

  const startTime = Date.now()

  try {
    await crawlWeibo()
    await new Promise(r => setTimeout(r, 2000))

    await crawlZhihu()
    await new Promise(r => setTimeout(r, 2000))

    await crawlBaidu()
    await new Promise(r => setTimeout(r, 2000))

    await crawlDouyin()
    await new Promise(r => setTimeout(r, 2000))

    await crawlWeixin()
    await new Promise(r => setTimeout(r, 2000))

    await crawlToutiao()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n✅ 爬取完成! 耗时: ${duration}s`)
    console.log(`📁 数据保存在: ${DATA_DIR}/`)
  } catch (error) {
    console.error('\n❌ 爬取出错:', error)
    process.exit(1)
  }
}

main()
