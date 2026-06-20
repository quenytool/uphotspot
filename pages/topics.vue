<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SourceTag from '~/components/SourceTag.vue'

useSeoMeta({
  title: '话题 - 上升热点',
  description: '把相似热点归并成话题，减少重复阅读。',
})

interface TopicCluster {
  id: string
  topic: string
  keywords: string[]
  sources: string[]
  items: TopicSourceItem[]
  totalHeat: number
  sourceCount: number
  sourceHeat: Record<string, number>
}

interface TopicSourceItem {
  title: string
  url: string
  source: string
  rank: number
  heat: string
}

interface ApiResponse {
  source: string
  updatedAt: string
  count: number
  clusters: TopicCluster[]
  crossPlatform: TopicCluster[]
  keywords: { word: string; count: number }[]
}

const { data, pending, refresh } = await useFetch<ApiResponse>('/api/topics', {
  default: () => ({
    source: 'all',
    updatedAt: '',
    count: 0,
    clusters: [],
    crossPlatform: [],
    keywords: []
  })
})

const activeTab = ref<'clusters' | 'cross' | 'keywords'>('clusters')
const hasData = computed(() => (data.value?.clusters?.length || 0) > 0)

function formatHeat(heat: number): string {
  if (heat >= 100000000) return `${(heat / 100000000).toFixed(1)}亿`
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}万`
  return heat.toLocaleString()
}
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">话题</h1>
          <p class="page-desc">把相似热点归并成话题，减少重复阅读。</p>
        </div>

        <div class="topic-tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'clusters' }]"
            @click="activeTab = 'clusters'"
          >
            话题聚合
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'cross' }]"
            @click="activeTab = 'cross'"
          >
            跨平台关联
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'keywords' }]"
            @click="activeTab = 'keywords'"
          >
            关键词
          </button>
        </div>

        <div v-if="pending" class="loading-state">
          <div class="spinner"></div>
          <span>正在分析话题...</span>
        </div>

        <template v-else-if="hasData">
          <!-- 话题聚合 -->
          <div v-if="activeTab === 'clusters'" class="cluster-grid">
            <article
              v-for="cluster in data?.clusters"
              :key="cluster.id"
              class="cluster-card card"
            >
              <div class="cluster-header">
                <div class="cluster-sources">
                  <SourceTag
                    v-for="src in cluster.sources"
                    :key="src"
                    :source="src"
                  />
                </div>
                <span class="cluster-heat">{{ formatHeat(cluster.totalHeat) }}</span>
              </div>

              <h3 class="cluster-topic">{{ cluster.topic }}</h3>

              <div class="cluster-keywords">
                <span
                  v-for="kw in cluster.keywords.slice(0, 4)"
                  :key="kw"
                  class="keyword-tag"
                >
                  {{ kw }}
                </span>
              </div>

              <div class="cluster-items">
                <a
                  v-for="item in cluster.items.slice(0, 3)"
                  :key="`${item.source}-${item.title}`"
                  :href="item.url"
                  class="cluster-item"
                  target="_blank"
                  rel="nofollow noopener"
                >
                  <span class="item-rank">#{{ item.rank }}</span>
                  <span class="item-title">{{ item.title }}</span>
                  <SourceTag :source="item.source" class="item-source" />
                </a>
              </div>

              <div v-if="cluster.items.length > 3" class="cluster-more">
                +{{ cluster.items.length - 3 }} 条相似内容
              </div>
            </article>
          </div>

          <!-- 跨平台关联 -->
          <div v-else-if="activeTab === 'cross'" class="cross-section">
            <div v-if="(data?.crossPlatform?.length || 0) === 0" class="empty-state">
              <strong>暂无跨平台关联话题</strong>
              <span>当同一话题在多个平台出现时会显示在这里。</span>
            </div>

            <div v-else class="cross-grid">
              <article
                v-for="cross in data?.crossPlatform"
                :key="cross.id"
                class="cross-card card"
              >
                <div class="cross-header">
                  <div class="cross-platforms">
                    <span
                      v-for="src in cross.sources"
                      :key="src"
                      class="platform-badge"
                      :class="`platform-${src}`"
                    >
                      {{ src }}
                    </span>
                  </div>
                  <span class="cross-heat">{{ formatHeat(cross.totalHeat) }}</span>
                </div>

                <h3 class="cross-topic">{{ cross.topic }}</h3>

                <div class="cross-keywords">
                  <span
                    v-for="kw in cross.keywords.slice(0, 3)"
                    :key="kw"
                    class="keyword-tag"
                  >
                    {{ kw }}
                  </span>
                </div>

                <div class="cross-items">
                  <a
                    v-for="item in cross.items"
                    :key="`${item.source}-${item.title}`"
                    :href="item.url"
                    class="cross-item"
                    target="_blank"
                    rel="nofollow noopener"
                  >
                    <SourceTag :source="item.source" />
                    <span class="cross-item-title">{{ item.title }}</span>
                  </a>
                </div>
              </article>
            </div>
          </div>

          <!-- 关键词 -->
          <div v-else-if="activeTab === 'keywords'" class="keywords-section card">
            <div class="keywords-cloud">
              <span
                v-for="kw in data?.keywords"
                :key="kw.word"
                class="keyword-item"
                :style="{ '--size': Math.min(1 + kw.count * 0.1, 2) }"
              >
                {{ kw.word }}
                <sub class="keyword-count">{{ kw.count }}</sub>
              </span>
            </div>

            <div class="keywords-list">
              <div
                v-for="(kw, idx) in data?.keywords"
                :key="kw.word"
                class="keyword-list-item"
              >
                <span class="kw-rank">{{ idx + 1 }}</span>
                <span class="kw-word">{{ kw.word }}</span>
                <span class="kw-count">{{ kw.count }} 次出现</span>
                <div class="kw-bar">
                  <div
                    class="kw-bar-fill"
                    :style="{ width: `${Math.min(kw.count / (data?.keywords?.[0]?.count || 1) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-state">
          <strong>暂无话题数据</strong>
          <span>正在等待热榜数据加载。</span>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.topic-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: var(--card-bg, #fff);
  border-radius: 8px;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-secondary, #666);
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

.cluster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.cluster-card {
  padding: 1.25rem;
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.cluster-sources {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cluster-heat {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary, #1890ff);
}

.cluster-topic {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text, #333);
  line-height: 1.4;
}

.cluster-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.keyword-tag {
  padding: 0.25rem 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.cluster-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cluster-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s;
}

.cluster-item:hover {
  background: var(--border, #e5e5e5);
}

.item-rank {
  font-size: 0.75rem;
  color: var(--text-tertiary, #999);
  min-width: 2rem;
}

.item-title {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-source {
  flex-shrink: 0;
}

.cluster-more {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary, #999);
  text-align: center;
}

.cross-section {
  padding: 0;
}

.cross-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.cross-card {
  padding: 1.25rem;
  border-left: 4px solid var(--primary, #1890ff);
}

.cross-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.cross-platforms {
  display: flex;
  gap: 0.5rem;
}

.platform-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  background: var(--primary, #1890ff);
  color: white;
}

.platform-weibo { background: #e6162d; }
.platform-zhihu { background: #0066cc; }
.platform-douyin { background: #161823; }
.platform-qq-news { background: #ff4d4f; }
.platform-baidu { background: #2932e1; }
.platform-toutiao { background: #ff4d4f; }
.platform-douban-group { background: #007722; }
.platform-douban-movie { background: #ff4f00; }

.cross-heat {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary, #1890ff);
}

.cross-topic {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text, #333);
}

.cross-keywords {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cross-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cross-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
  text-decoration: none;
}

.cross-item:hover {
  background: var(--border, #e5e5e5);
}

.cross-item-title {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.keywords-section {
  padding: 1.5rem;
}

.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 8px;
  justify-content: center;
  align-items: center;
}

.keyword-item {
  font-size: calc(0.875rem * var(--size, 1));
  font-weight: 500;
  color: var(--text, #333);
  transition: color 0.2s;
}

.keyword-item:hover {
  color: var(--primary, #1890ff);
}

.keyword-count {
  font-size: 0.625rem;
  color: var(--text-tertiary, #999);
  margin-left: 0.25rem;
}

.keywords-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.keyword-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kw-rank {
  width: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-tertiary, #999);
}

.kw-word {
  min-width: 4rem;
  font-weight: 500;
  color: var(--text, #333);
}

.kw-count {
  min-width: 5rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.kw-bar {
  flex: 1;
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

.empty-state {
  padding: 3rem;
  text-align: center;
  background: var(--card-bg, #fff);
  border-radius: 8px;
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
</style>
