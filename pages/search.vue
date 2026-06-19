<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SearchBar from '~/components/SearchBar.vue'

const route = useRoute()
const q = computed(() => String(route.query.q || '').trim())

interface SearchItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat: string
  category: string
  createdAt: string
  score: number
}

const results = ref<SearchItem[]>([])
const loading = ref(false)
const error = ref('')

async function doSearch(query: string) {
  if (!query || query.length < 2) {
    results.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ data: SearchItem[]; count: number }>(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
    results.value = data.data || []
  } catch (e) {
    error.value = '搜索服务暂不可用'
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  doSearch(String(newQ || '').trim())
}, { immediate: true })

useSeoMeta({
  title: q.value ? `${q.value} - 搜索 - 上升热点` : '搜索 - 上升热点',
  description: '搜索热点内容、话题或平台。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">搜索</h1>
          <p class="page-desc">查找热点内容、话题或平台。</p>
        </div>

        <div class="card">
          <SearchBar />
          <div v-if="loading" class="loading" style="margin-top: 16px;">搜索中...</div>
          <div v-else-if="error" class="error" style="margin-top: 16px;">{{ error }}</div>
          <div v-else-if="!q" class="empty-state" style="margin-top: 16px;">
            <span>输入关键词开始搜索</span>
          </div>
          <div v-else-if="results.length === 0" class="empty-state" style="margin-top: 16px;">
            <span>未找到与「{{ q }}」相关的结果</span>
          </div>
          <div v-else class="results" style="margin-top: 16px;">
            <div class="results-header">找到 {{ results.length }} 个结果</div>
            <ul class="result-list">
              <li v-for="item in results" :key="item.id" class="result-item">
                <a :href="item.url" target="_blank" class="result-link">
                  <span class="result-rank">[{{ item.source }}:{{ item.rank }}]</span>
                  <span class="result-title">{{ item.title }}</span>
                  <span class="result-heat">{{ item.heat }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
