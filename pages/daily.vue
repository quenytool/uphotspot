<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SourceTag from '~/components/SourceTag.vue'

useSeoMeta({
  title: '日报 - 上升热点',
  description: '每日热点回顾与摘要。',
})

interface KeywordInfo {
  word: string
  count: number
  sources: string[]
  trend: 'rising' | 'stable' | 'falling'
}

interface PlatformInfo {
  source: string
  count: number
  totalHeat: number
  topItem?: any
  percentage: number
}

interface TopicSummary {
  title: string
  sources: string[]
  totalHeat: number
  rank: number
}

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

interface DailyReport {
  date: string
  generatedAt: string
  summary: string
  topTopics: TopicSummary[]
  keywords: KeywordInfo[]
  platformDistribution: PlatformInfo[]
  hotItems: HotItem[]
  stats: {
    totalItems: number
    totalHeat: number
    avgHeat: number
    peakHour: string
    peakTopics: string[]
  }
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const dateInput = ref(new Date().toISOString().split('T')[0])

const { data: report, pending, error, refresh } = await useFetch<DailyReport>('/api/daily', {
  query: computed(() => ({ date: selectedDate.value })),
  default: () => null as DailyReport | null
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatHeat(heat: number): string {
  if (heat >= 100000000) return `${(heat / 100000000).toFixed(1)}亿`
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}万`
  return heat.toLocaleString()
}

function changeDate(days: number) {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  selectedDate.value = date.toISOString().split('T')[0]
}

function submitDate() {
  selectedDate.value = dateInput.value
}
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">日报</h1>
          <p class="page-desc">把一天的热点整理成更容易复盘的摘要。</p>
        </div>

        <!-- 日期选择器 -->
        <div class="date-picker card">
          <button class="date-nav" @click="changeDate(-1)">← 前一天</button>
          <div class="date-display">
            <input
              v-model="dateInput"
              type="date"
              class="date-input"
              @change="submitDate"
            />
            <span class="date-label">{{ formatDate(selectedDate) }}</span>
          </div>
          <button class="date-nav" @click="changeDate(1)">后一天 →</button>
        </div>

        <div v-if="pending" class="loading-state card">
          <div class="spinner"></div>
          <span>正在生成日报...</span>
        </div>

        <template v-else-if="report">
          <!-- 摘要 -->
          <div class="summary-card card">
            <h2 class="summary-title">{{ formatDate(report.date) }} 热榜摘要</h2>
            <p class="summary-text">{{ report.summary }}</p>
          </div>

          <!-- 统计概览 -->
          <div class="stats-grid">
            <div class="stat-card">
              <strong>{{ report.stats.totalItems }}</strong>
              <span>条热点</span>
            </div>
            <div class="stat-card">
              <strong>{{ formatHeat(report.stats.totalHeat) }}</strong>
              <span>总热度</span>
            </div>
            <div class="stat-card">
              <strong>{{ formatHeat(report.stats.avgHeat) }}</strong>
              <span>平均热度</span>
            </div>
            <div class="stat-card">
              <strong>{{ report.keywords.length }}</strong>
              <span>个关键词</span>
            </div>
          </div>

          <div class="main-grid">
            <!-- 左侧：话题和关键词 -->
            <div class="left-column">
              <!-- 热点话题 -->
              <section class="card topics-section">
                <h3 class="section-title">🔥 热点话题</h3>
                <div class="topic-list">
                  <article
                    v-for="topic in report.topTopics"
                    :key="topic.rank"
                    class="topic-item"
                  >
                    <div class="topic-rank">{{ topic.rank }}</div>
                    <div class="topic-content">
                      <h4 class="topic-title">{{ topic.title }}</h4>
                      <div class="topic-meta">
                        <SourceTag
                          v-for="src in topic.sources"
                          :key="src"
                          :source="src"
                        />
                        <span class="topic-heat">{{ formatHeat(topic.totalHeat) }}</span>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              <!-- 关键词 -->
              <section class="card keywords-section">
                <h3 class="section-title">📊 关键词分布</h3>
                <div class="keyword-bars">
                  <div
                    v-for="kw in report.keywords.slice(0, 15)"
                    :key="kw.word"
                    class="keyword-bar-item"
                  >
                    <div class="kw-info">
                      <span class="kw-word">{{ kw.word }}</span>
                      <span class="kw-count">{{ kw.count }}次</span>
                    </div>
                    <div class="kw-bar">
                      <div
                        class="kw-bar-fill"
                        :style="{
                          width: `${(kw.count / (report.keywords[0]?.count || 1)) * 100}%`
                        }"
                      ></div>
                    </div>
                    <div class="kw-sources">
                      <SourceTag
                        v-for="src in kw.sources.slice(0, 2)"
                        :key="src"
                        :source="src"
                        class="mini-tag"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- 右侧：平台分布和热榜 -->
            <div class="right-column">
              <!-- 平台分布 -->
              <section class="card platform-section">
                <h3 class="section-title">📱 平台分布</h3>
                <div class="platform-list">
                  <div
                    v-for="platform in report.platformDistribution"
                    :key="platform.source"
                    class="platform-item"
                  >
                    <div class="platform-header">
                      <SourceTag :source="platform.source" />
                      <span class="platform-heat">{{ formatHeat(platform.totalHeat) }}</span>
                    </div>
                    <div class="platform-bar-wrap">
                      <div
                        class="platform-bar"
                        :style="{ width: `${platform.percentage}%` }"
                      ></div>
                    </div>
                    <div class="platform-stats">
                      <span>{{ platform.count }}条</span>
                      <span>{{ platform.percentage.toFixed(1) }}%</span>
                    </div>
                    <div v-if="platform.topItem" class="platform-top">
                      <span class="top-label">最热：</span>
                      <a
                        :href="platform.topItem.url"
                        class="top-title"
                        target="_blank"
                        rel="nofollow noopener"
                      >
                        {{ platform.topItem.title?.slice(0, 20) }}
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 热榜 -->
              <section class="card hotlist-section">
                <h3 class="section-title">📋 完整热榜</h3>
                <div class="hotlist">
                  <a
                    v-for="(item, idx) in report.hotItems"
                    :key="`${item.source}-${item.id}`"
                    :href="item.url"
                    class="hotlist-item"
                    target="_blank"
                    rel="nofollow noopener"
                  >
                    <span class="hl-rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
                    <span class="hl-title">{{ item.title }}</span>
                    <SourceTag :source="item.source" class="mini-tag" />
                  </a>
                </div>
              </section>
            </div>
          </div>
        </template>

        <div v-else-if="error" class="error-state card">
          <strong>无法生成日报</strong>
          <span>{{ error.message || '请选择其他日期或稍后再试。' }}</span>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.date-nav {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border, #e5e5e5);
  background: var(--card-bg, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.date-nav:hover {
  background: var(--hover-bg, #f5f5f5);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 6px;
  font-size: 0.875rem;
}

.date-label {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--text, #333);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border, #e5e5e5);
  border-top-color: var(--primary, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.summary-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary, #1890ff) 0%, #6db3ff 100%);
  color: white;
}

.summary-title {
  font-size: 1.25rem;
  margin: 0 0 1rem;
  font-weight: 600;
}

.summary-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.95;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-card strong {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary, #1890ff);
  margin-bottom: 0.25rem;
}

.stat-card span {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.topic-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 8px;
}

.topic-rank {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary, #1890ff);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--text, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.topic-heat {
  font-size: 0.75rem;
  color: var(--primary, #1890ff);
  font-weight: 600;
  margin-left: auto;
}

.keyword-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.keyword-bar-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.5rem;
  align-items: center;
}

.kw-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.kw-word {
  font-weight: 500;
  color: var(--text, #333);
}

.kw-count {
  color: var(--text-secondary, #666);
}

.kw-bar {
  height: 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
}

.kw-bar-fill {
  height: 100%;
  background: var(--primary, #1890ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.kw-sources {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.mini-tag {
  transform: scale(0.8);
  transform-origin: left;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.platform-item {
  padding: 0.75rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 8px;
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.platform-heat {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary, #1890ff);
}

.platform-bar-wrap {
  height: 0.5rem;
  background: var(--border, #e5e5e5);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.platform-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary, #1890ff), #6db3ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.platform-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.platform-top {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border, #e5e5e5);
  font-size: 0.75rem;
  display: flex;
  gap: 0.25rem;
}

.top-label {
  color: var(--text-tertiary, #999);
}

.top-title {
  color: var(--text, #333);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-title:hover {
  color: var(--primary, #1890ff);
}

.hotlist {
  max-height: 400px;
  overflow-y: auto;
}

.hotlist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;
}

.hotlist-item:hover {
  background: var(--hover-bg, #f5f5f5);
}

.hl-rank {
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

.hl-rank.top {
  background: var(--primary, #1890ff);
  color: white;
}

.hl-title {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-state {
  padding: 3rem;
  text-align: center;
}

.error-state strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.error-state span {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
