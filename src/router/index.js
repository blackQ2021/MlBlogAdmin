import { createRouter, createWebHashHistory} from "vue-router"
// 导入的内容

// 登录页面
import login from "../page/login/login.vue"
// 内容部分
import postArticle from "../page/content/post-article.vue"
import articleManage from "../page/content/manage-article.vue"
import imageManage from "../page/content/manage-image.vue"
import commentManage from "../page/content/manage-comment.vue"
// 首页
import index from "../page/dashboard/index.vue"
// 运营
import categoryMange from "../page/operation/manage-category.vue"
import loopMange from "../page/operation/manage-loop.vue"
// 设置
import friendLink from "../page/settings/friend-link.vue"
import webSiteInfo from "../page/settings/website-info.vue"
import email from "../page/settings/email.vue"
import info from "../page/settings/info.vue"
// 用户
import list from "../page/user/list-users.vue"
// 布局
import baseView from "../layout/base-view.vue"
import rightView from "../layout/right-content.vue"
// 陆游器
export const routes = [
    { 
        path: '', 
        component: baseView,
        redirect: '/index',
        children: [
            {
                path: '/index',
                name: '首页',
                icon: 'home-filled',
                hidden:false,
                component: index
            },
            {
                path: '/content',
                name: '内容',
                icon: 'reading',
                hidden:false,
                component: rightView,
                children: [
                    {
                        path: 'post-article',
                        name: '发表文章',
                        icon: 'edit',
                        hidden:false,
                        component: postArticle
                    },
                    {
                        path: 'manage-article',
                        name: '文章管理',
                        icon: 'management',
                        hidden:false,
                        component: articleManage
                    },
                    {
                        path: 'manage-comment',
                        name: '评论管理',
                        icon: 'comment',
                        hidden:false,
                        component: commentManage
                    },
                    {
                        path: 'manage-image',
                        name: '图片管理',
                        icon: 'picture-filled',
                        hidden:false,
                        component: imageManage
                    }
                ]
            },
            {
                path: '/user',
                name: '用户',
                icon: 'user-filled',
                hidden:false,
                component: rightView,
                children: [
                    {
                        path: 'list',
                        name: '用户列表',
                        icon: 'list',
                        hidden:false,
                        component: list
                    }
                ]
            },
            {
                path: '/operation',
                name: '运营',
                icon: 'operation',
                hidden:false,
                component: rightView,
                children: [
                    {
                        path: 'category',
                        name: '分类管理',
                        icon: 'ticket',
                        hidden:false,
                        component: categoryMange
                    },
                    {
                        path: 'loop',
                        name: '轮播图管理',
                        icon: 'film',
                        hidden:false,
                        component: loopMange
                    },
                ]
            },
            {
                path: '/settings',
                name: '设置',
                icon: 'setting',
                hidden:false,
                component: rightView,
                children: [
                    {
                        path: 'info',
                        name: '用户信息',
                        icon: 'avatar',
                        hidden:false,
                        component: info
                    },
                    {
                        path: 'friend-link',
                        name: '友情链接',
                        icon: 'connection',
                        hidden:false,
                        component: friendLink
                    },
                    {
                        path: 'website-info',
                        name: '网站信息',
                        icon: 'platform',
                        hidden:false,
                        component: webSiteInfo
                    },
                    {
                        path: 'email',
                        name: '邮箱设置',
                        icon: 'promotion',
                        hidden:false,
                        component: email
                    }
                ]
            }
        ]
    },
    {
        path: '/login',
        icon: 'user-filled',
        component: login
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
})

export default router