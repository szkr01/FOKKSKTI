<template>
  <div class="app-container">
    <!-- main-content が BottomNav と重ならないように -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" class="router-component-wrapper" />
        </keep-alive>
      </router-view>
    </main>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import BottomNav from './components/BottomNav.vue';
// BottomNav の高さを変数で持つ (SCSS変数などが使えるとより良い)
</script>

<style scoped>
.app-container {
  display: flex; /* Use flex for main-content + BottomNav layout */
  flex-direction: column;
  height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #eee; /* For visibility */
  overflow: hidden; /* Prevent all scrolling at the app level */
}

.main-content {
  flex-grow: 1; /* Take up available space */
  position: relative; /* Needed for child absolute/fixed positioning */
  overflow: hidden; /* Prevent scrolling within main content area */
  /* BottomNav の高さ分だけ表示領域を確保 (padding-bottom ではなく、flex で管理) */
  /* min-height: 0; を追加して縮小に対応 */
  min-height: 0;
  display: flex; /* router-view-wrapper を伸縮させるため */
}

.router-component-wrapper {
  flex-grow: 1; /* Take full height of main-content */
  overflow: hidden; /* Prevent scrolling within the routed component */
}

/* BottomNav is now outside main-content in the flex layout, */
/* or use position:fixed as done in BottomNav.vue itself */
</style>