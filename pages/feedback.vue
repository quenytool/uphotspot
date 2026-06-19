<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

useSeoMeta({
  title: '反馈 - 上升热点',
  description: '提交对上升热点的建议或问题反馈。',
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">反馈</h1>
          <p class="page-desc">发现问题或有新想法，都可以从这里开始记录。</p>
        </div>

        <div class="card">
          <form @submit.prevent>
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 700;">反馈类型</label>
              <select style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 7px; background: #fff;">
                <option value="suggestion">功能建议</option>
                <option value="bug">问题反馈</option>
                <option value="content">内容问题</option>
                <option value="business">商务合作</option>
              </select>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 700;">联系邮箱</label>
              <input type="email" placeholder="example@email.com" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 7px;">
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 700;">反馈内容</label>
              <textarea rows="6" placeholder="请描述你的问题或建议..." style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 7px; resize: vertical;" />
            </div>

            <button type="submit" class="btn">提交反馈</button>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
