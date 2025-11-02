import { createApp } from 'vue'
import App from './App.vue'
import './css/main.css'

// 开发环境下引入vconsole用于移动端调试
if (import.meta.env.DEV) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
    console.log('VConsole 已加载，可用于移动端调试')
  })
}

// 创建Vue应用实例
const app = createApp(App)

// 挂载应用到DOM
app.mount('#app')