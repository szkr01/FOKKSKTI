import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PracticeView from '../views/PracticeView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/practice',
    name: 'Practice',
    component: PracticeView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
  // 初期表示などで / 以外にアクセスされた場合のリダイレクト
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Viteの場合
  routes,
});

export default router;