import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory, RouterView } from 'vue-router'
import App from './App.vue'
import ProductList from './ProductList.vue'
import ProductDetail from './ProductDetail.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: ProductList },
    { path: '/cua-hang', component: { render: () => h(RouterView) }, children: [
      { path: '', name: 'catalog', component: ProductList },
      { path: ':id', name: 'product', component: ProductDetail, props: true },
    ] },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.path !== from.path) return { top: 0 }
  },
})

createApp(App).use(createPinia()).use(router).mount('#app')

