<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SourceTag from '~/components/SourceTag.vue'
import { formatTime } from '~/assets/lib/utils'
import type { HotItem } from '~/assets/lib/sources'

useSeoMeta({
  title: '趋势 - 上升热点',
  description: '浏览热门文章和持续升温的话题。',
})

interface TrendItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat?: string
  category: string
  createdAt: string
  risingSpeed: number
  duration: number
  peakRank: number
  trendScore: number
  firstSeen: string
  lastSeen: string
}

const { data: trendData, pending } = await useFetch<{ data: TrendItem[]; count: number }>('/api/trending', {
  query: { days: 7 },
  default: () => ({ data: [], count: 0 })
})

const { data: hotData } = await useFetch<{ data: HotItem[]; count: number }>('/api/all', {
  default: () => ({ data: [], count: 0 })
})

const sortedByScore = computed(() =>
  [...(trendData.value?.data || [])].sort((a, b) => b.trendScore - a.trendScore)
)

const sortedBySpeed = computed(() =>
  [...(trendData.value?.data || [])].sort((a, b) => b.risingSpeed - a.risingSpeed)
)

const sortedByDuration = computed(() =>
  [...(trendData.value?.data || [])].sort((a, b) => b.duration - a.duration)
)

const activeTab = ref<'score' | 'speed' | 'duration'>('score')
const displayList = computed(() => {
  switch (activeTab.value) {
    case 'speed': return sortedBySpeed.value
    case 'duration': return sortedByDuration.value
    default: return sortedByScore.value
  }
})

const hasTrendData = computed(() => (trendData.value?.data?.length || 0) > 0)
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">趋势</h1>
          <p class="page-desc">关注持续升温的内容，而不只是瞬时排名。</p>
        </div>

        <div class="trend-stats">
          <div class="stat-card">
            <strong>{{ data?.count || 0 }}</strong>
            <span>追踪中的话题</span>
          </div>
          <div class="stat-card">
            <strong>7</strong>
            <span>天历史快照</span>
          </div>
        </div>

        <div class="card">
          <div v-if="pending" class="loading-state">正在分析趋势...</div>

          <template v-else-if="hasTrendData">
            <div class="trend-tabs">
              <button
                :class="['tab-btn', { active: activeTab === 'score' }]"
                @click="activeTab = 'score'"
              >
                综合热度
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'speed' }]"
                @click="activeTab = 'speed'"
              >
                上升速度
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'duration' }]"
                @click="activeTab = 'duration'"
              >
                在榜时长
              </button>
            </div>

            <div class="trend-list">
              <article
                v-for="(item, index) in displayList"
                :key="`${item.source}-${item.id}-${index}`"
                class="trend-item"
              >
                <div class="trend-rank">{{ index + 1 }}</div>

                <div class="trend-content">
                  <a :href="item.url" class="trend-title" target="_blank" rel="nofollow noopener">
                    {{ item.title }}
                  </a>

                  <div class="trend-meta">
                    <SourceTag :source="item.source" />
                    <span class="trend-stat">
                      <span class="trend-label">上升</span>
                      <span :class="['trend-value', item.risingSpeed > 0 ? 'positive' : '']">
                        {{ item.risingSpeed > 0 ? '+' : '' }}{{ item.risingSpeed }}/天
                      </span>
                    </span>
                    <span class="trend-stat">
                      <span class="trend-label">在榜</span>
                      <span class="trend-value">{{ item.duration }}天</span>
                    </span>
                    <span class="trend-stat">
                      <span class="trend-label">峰顶</span>
                      <span class="trend-value">#{{ item.peakRank }}</span>
                    </span>
                    <span class="trend-stat">
                      <span class="trend-label">首次</span>
                      <span class="trend-value">{{ formatTime(item.firstSeen) }}</span>
                    </span>
                  </div>
                </div>

                <div class="trend-score-wrap">
                  <span class="trend-score">{{ (item.trendScore * 100).toFixed(0) }}</span>
                  <span class="trend-score-label">热度</span>
                </div>
              </article>
            </div>
          </template>

          <template v-else>
            <div class="building-state">
              <div class="building-icon">📊</div>
              <strong>趋势分析正在积累数据</strong>
              <span>系统正在收集每日快照，趋势分析需要至少 2 天的历史数据才能计算上升速度和持续时间。</span>
              <p class="building-hint">以下是目前各平台的实时热榜：</p>
            </div>

            <div class="preview-list">
              <article
                v-for="(item, index) in (hotData?.data || []).slice(0, 20)"
                :key="`${item.source}-${item.id}-${index}`"
                class="preview-item"
              >
                <div class="preview-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="preview-content">
                  <a :href="item.url" class="preview-title" target="_blank" rel="nofollow noopener">
                    {{ item.title }}
                  </a>
                  <div class="preview-meta">
                    <SourceTag :source="item.source" />
                    <span v-if="item.heat">{{ item.heat }}</span>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </div>

        <div class="trend-info card">
          <h3>趋势计算说明</h3>
          <ul>
            <li><strong>上升速度</strong>：每日排名变化（正数表示排名上升，数字越大上升越快）</li>
            <li><strong>在榜时长</strong>：连续出现在热榜的天数</li>
            <li><strong>峰顶排名</strong>：历史最高排名位置</li>
            <li><strong>综合热度</strong>：结合上升速度、在榜时长和当前热度的加权得分</li>
          </ul>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.trend-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.stat-card strong {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary, #1890ff);
}

.stat-card span {
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.trend-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--hover-bg, #f5f5f5);
}

.tab-btn.active {
  background: var(--primary, #1890ff);
  color: white;
}

.trend-list {
  divide-y: 1px solid var(--border, #e5e5e5);
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.trend-item:last-child {
  border-bottom: none;
}

.trend-rank {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
  flex-shrink: 0;
}

.trend-content {
  flex: 1;
  min-width: 0;
}

.trend-title {
  display: block;
  font-weight: 500;
  color: var(--text, #333);
  text-decoration: none;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trend-title:hover {
  color: var(--primary, #1890ff);
}

.trend-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.trend-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trend-label {
  color: var(--text-tertiary, #999);
}

.trend-value {
  font-weight: 500;
}

.trend-value.positive {
  color: #52c41a;
}

.trend-score-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.trend-score {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary, #1890ff);
}

.trend-score-label {
  font-size: 0.625rem;
  color: var(--text-tertiary, #999);
  text-transform: uppercase;
}

.trend-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
}

.trend-info h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.trend-info ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.trend-info li {
  margin-bottom: 0.5rem;
}

.trend-info strong {
  color: var(--text, #333);
}

.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-state strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.empty-state span {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary, #666);
}

.building-state {
  padding: 2rem;
  text-align: center;
}

.building-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.building-state strong {
  display: block;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.building-state span {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.building-hint {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.preview-list {
  border-top: 1px solid var(--border, #e5e5e5);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-rank {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #666);
  flex-shrink: 0;
}

.preview-rank.top {
  background: var(--primary, #1890ff);
  color: white;
}

.preview-content {
  flex: 1;
  min-width: 0;
}

.preview-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text, #333);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-title:hover {
  color: var(--primary, #1890ff);
}

.preview-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  margin-top: 0.25rem;
}
</style>
