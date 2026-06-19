<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '日历 - 上升热点',
  description: '按日期查看历史热榜。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">日历</h1>
          <p class="page-desc">回看历史热榜，观察话题如何出现、扩散和退场。</p>
        </div>
        <div class="card">
          <div class="empty-state">
            <strong>历史日历正在准备中</strong>
            <span>接入定时快照后，可以按日期查看每日热点。</span>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
