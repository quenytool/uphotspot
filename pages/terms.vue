<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '使用条款 - 上升热点',
  description: '上升热点的使用条款与免责声明。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">使用条款</h1>
          <p class="page-desc">最后更新：2026 年 6 月 19 日</p>
        </div>

        <article class="card" style="line-height: 1.9;">
          <h2 class="section-title">服务说明</h2>
          <p class="page-desc" style="margin: 12px 0 24px;">
            上升热点是公开热榜信息聚合服务，用于帮助用户浏览不同平台的热点内容。
          </p>

          <h2 class="section-title">内容来源</h2>
          <p class="page-desc" style="margin: 12px 0 24px;">
            热榜内容来自第三方公开平台。我们不声明拥有这些内容的版权，也无法保证第三方内容的完整性与准确性。
          </p>

          <h2 class="section-title">合理使用</h2>
          <p class="page-desc">请勿利用本网站进行违法活动、恶意请求、批量抓取或干扰服务运行。</p>
        </article>
      </div>
    </main>
    <Footer />
  </div>
</template>
