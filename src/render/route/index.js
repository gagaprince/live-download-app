import { createRouter, createWebHashHistory } from 'vue-router';

import Home from '@/render/views/Home.vue';
import Setting from '@/render/views/Setting.vue';
import LivingDownload from '@/render/views/LivingDownload.vue';
import LivingRoomInfo from '@/render/views/LivingRoomInfo.vue';
import BatchVideoDownload from '@/render/views/BatchVideoDownload.vue';
import ImageBatchCorp from '@/render/views/ImageBatchCorp.vue';
import Test from '@/render/views/Test.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        redirect: '/living-room-info',
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
                path: 'batch-download',
                name: 'batchDownload',
                component: BatchVideoDownload,
            },
            {
                path: 'image-batch-corp',
                name: 'imageBatchCorp',
                component: ImageBatchCorp,
            },
            {
                path: 'setting',
                name: 'setting',
                component: Setting,
            },

            {
                path: 'test',
                name: 'test',
                component: Test,
            },
        ],
    },
    // 其他路由配置
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
