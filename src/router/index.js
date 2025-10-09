import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/App.vue'),

      children: [
        {
          path: '/',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: '/precipitation',
          name: 'precipitation',
          component: () => import('@/views/PrecipitationMap.vue'),
        },
      ]
    },
  ],
})

export default router
