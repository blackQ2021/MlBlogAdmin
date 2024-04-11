import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import leftMenu from './layout/left-menu.vue'
import topHeader from './layout/top-header.vue'
import constants from './utils/constants'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

const app = createApp(App)
app.config.globalProperties.blog_constant = constants
app.component('leftMenu', leftMenu)
app.component('topHeader', topHeader)
app.use(mavonEditor)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
import { checkToken, success_code } from './api/api';
router.beforeEach((to, from, next) => {
    //如果是登录界面，则需要放行
    if (to.path === '/login') {
        //如果要做得更好一点，如果用户要跳转到登录页面
        //当前已经登录了，则没必要再到登录界面了、除非用户点击退出登录
        //如果已经登录,根据角色判断页面跳转。
        next();
    } else {
        //否则检查用户角色
        checkToken().then(result => {
            console.log(result);
            if (result.code === success_code) {
                // 成功 判断用户角色
                //如果是管理员,放行
                //如果是普通用户，跳转到门户首页
                if (result.data.roles === 'role_admin') {
                    next();
                } else {            
                    location.href = 'https://www.bilibili.com/';
                }
            } else {
                next({
                    path: '/login'
                });
            }
        });
    }
})

app.use(router)
app.mount('#app')
