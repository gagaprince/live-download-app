import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/render/views/Home.vue';
import Setting from '@/render/views/Setting.vue';
import LivingDownload from '@/render/views/LivingDownload.vue';
import LivingRoomInfo from '@/render/views/LivingRoomInfo.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'living-room-info',
        name: 'living-room-info',
        component: LivingRoomInfo,
      },
      {
        path: 'living-download',
        name: 'LivingDownload',
        component: LivingDownload,
      },
      {
        path: 'setting',
        name: 'setting',
        component: Setting,
      },
    ],
  },
  // 其他路由配置
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
