<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" active-class="active">
      <span class="icon">🏠</span>
      <span class="label">ホーム</span>
    </router-link>
    <router-link to="/practice" class="nav-item" active-class="active">
      <span class="icon">📝</span>
      <span class="label">問題練習</span>
    </router-link>
    <router-link to="/settings" class="nav-item" active-class="active">
      <span class="icon">⚙️</span>
      <span class="label">設定</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
// No logic needed here
</script>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed; /* 画面下部に固定 */
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px; /* Fixed height */
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  max-width: 600px; /* Match app container width */
  margin: 0 auto; /* Center horizontally */
  z-index: 100; /* Ensure it's above other content */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 5px 0;
  text-decoration: none;
  color: #666;
  font-size: 0.8rem;
}

.nav-item .icon {
  font-size: 1.4rem;
  margin-bottom: 2px;
}

.nav-item.active {
  color: #007bff; /* Active tab color */
}
</style>