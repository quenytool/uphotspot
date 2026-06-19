<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '隐私政策 - 上升热点',
  description: '上升热点的隐私政策与数据使用说明。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">隐私政策</h1>
          <p class="page-desc">最后更新：2026 年 6 月 19 日</p>
        </div>

        <article class="card" style="line-height: 1.9;">
          <h2 class="section-title">数据收集</h2>
          <p class="page-desc" style="margin: 12px 0 24px;">
            上升热点主要展示公开平台的热榜信息。除非你主动提交反馈，我们不会要求你提供个人身份信息。
          </p>

          <h2 class="section-title">第三方服务</h2>
          <p class="page-desc" style="margin: 12px 0 24px;">
            网站可能使用统计、广告或接口服务。第三方服务会依据其自身政策处理必要数据。
          </p>

          <h2 class="section-title">联系我们</h2>
          <p class="page-desc">如对隐私政策有疑问，请联系 contact@newsnow.example.com。</p>
        </article>
      </div>
    </main>
    <Footer />
  </div>
</template>
