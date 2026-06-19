<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '关于 - 上升热点',
  description: '了解上升热点的功能、数据来源和产品目标。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">关于上升热点</h1>
          <p class="page-desc">一个聚合全网热点的轻量入口。</p>
        </div>

        <article class="card" style="line-height: 1.9;">
          <h2 class="section-title">我们想解决什么</h2>
          <p class="page-desc" style="margin: 12px 0 24px;">
            热点分散在不同平台，来回切换会消耗大量注意力。上升热点希望把主要平台的公开热榜汇总到一起，让你快速判断哪些事正在被讨论，以及它们来自哪里。
          </p>

          <h2 class="section-title">主要功能</h2>
          <ul class="page-desc" style="padding-left: 20px; margin-top: 12px;">
            <li>聚合微博、知乎、抖音、微信、百度、头条等平台热榜。</li>
            <li>按来源和分类浏览热点。</li>
            <li>预留搜索、趋势、日报、话题聚合和历史日历能力。</li>
          </ul>
        </article>
      </div>
    </main>
    <Footer />
  </div>
</template>
