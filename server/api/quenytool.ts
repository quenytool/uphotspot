interface Repo {
  name: string
  url: string
  desc: string
  lang: string
  stars_today: string
  total_stars: string
  forks: string
}

interface DailyData {
  date: string
  repos: Repo[]
}

interface IndexItem {
  date: string
  count: number
  top_repo: string
  top_stars: string
}

const QUENYTOOL_BASE = 'https://raw.githubusercontent.com/quenytool/quenytool.github.io/main/site/posts'

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NewsNow/1.0'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

export default defineEventHandler(async (event): Promise<{
  source: string
  updatedAt: string
  count: number
  data: Array<{
    id: string
    title: string
    url: string
    source: string
    rank: number
    heat: string
    category: string
    tags: string[]
    createdAt: string
  }>
}> => {
  // 获取最新日期的索引
  const indexData = await fetchWithRetry(`${QUENYTOOL_BASE}/index.json`) as IndexItem[]
  const latestEntry = indexData[indexData.length - 1]
  const latestDate = latestEntry?.date || new Date().toISOString().split('T')[0]

  // 获取当日数据
  const dailyData = await fetchWithRetry(`${QUENYTOOL_BASE}/${latestDate}.json`) as DailyData

  const items = dailyData.repos.slice(0, 20).map((repo, idx) => ({
    id: `quenytool-${idx + 1}`,
    title: `${repo.name.split('/')[1]} - ${repo.desc.slice(0, 50)}${repo.desc.length > 50 ? '...' : ''}`,
    url: repo.url,
    source: 'quenytool',
    rank: idx + 1,
    heat: repo.stars_today,
    category: inferCategory(repo.lang, repo.desc),
    tags: [repo.lang].filter(Boolean),
    createdAt: new Date(latestDate).toISOString(),
  }))

  return {
    source: 'quenytool',
    updatedAt: new Date(latestDate).toISOString(),
    count: items.length,
    data: items,
  }
})

function inferCategory(lang: string, desc: string): string {
  const lowerLang = (lang || '').toLowerCase()
  const lowerDesc = desc.toLowerCase()

  if (['python', 'javascript', 'typescript', 'rust', 'go', 'java', 'cpp', 'c++'].includes(lowerLang)) {
    return 'developer'
  }
  if (lowerDesc.includes('ai') || lowerDesc.includes('llm') || lowerDesc.includes('gpt') || lowerDesc.includes('model')) {
    return 'ai'
  }
  return 'developer'
}
