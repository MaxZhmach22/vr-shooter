import { createApp } from 'vue'
import App from '@/App.vue'

export const IS_PROD = import.meta.env.VITE_PROD === 'true'

console.debug(`
IS_PROD: ${IS_PROD}
`)

createApp(App).mount('#app')
