import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { Buffer } from 'buffer'
window.Buffer = Buffer

window.global = globalThis


createApp(App).mount('#app')
