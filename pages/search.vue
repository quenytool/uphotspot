<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SearchBar from '~/components/SearchBar.vue'

const route = useRoute()
const q = computed(() => String(route.query.q || '').trim())

useSeoMeta({
  title: '搜索 - 上升热点',
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
          <div class="empty-state" style="margin-top: 16px;">
            <strong>{{ q ? `已收到搜索：${q}` : '输入关键词开始搜索' }}</strong>
            <span>搜索索引功能预留中，下一步可以接入本地缓存或远程全文检索。</span>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
