import { search, refreshIndex } from '../utils/searchIndex'

export default defineEventHandler(async (event): Promise<{
  query: string
  count: number
  data: Array<{
    id: string
    title: string
    url: string
    source: string
    rank: number
    heat: string
    category: string
    createdAt: string
    score: number
  }>
} | { error: string }> => {
  const query = getQuery(event)
  const q = (query.q as string | undefined)?.trim() || ''
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)

  if (!q) {
    return { query: q, count: 0, data: [] }
  }

  if (q === '__refresh__') {
    try {
      await refreshIndex()
    } catch {}
    return { query: q, count: 0, data: [] }
  }

  try {
    const results = await search(q, limit)
    return {
      query: q,
      count: results.length,
      data: results,
    }
  } catch (e) {
    console.error('Search error:', e)
    return { query: q, count: 0, data: [], error: 'Search temporarily unavailable' }
  }
})
