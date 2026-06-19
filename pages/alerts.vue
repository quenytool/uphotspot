<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '追踪 - 上升热点',
  description: '追踪指定热点关键词和话题。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">追踪</h1>
          <p class="page-desc">设置关键词，跟踪话题在不同平台的升温过程。</p>
        </div>
        <div class="card">
          <div class="empty-state">
            <strong>追踪功能正在准备中</strong>
            <span>后续可以支持关键词订阅、热度阈值和提醒通知。</span>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
