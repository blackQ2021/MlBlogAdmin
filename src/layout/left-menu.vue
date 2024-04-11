<template>
    <!-- 显示内容 -->
    <div>
        <el-menu
            active-text-color="#ffd04b"
            background-color="#545c64"
            class="el-menu-vertical"
            :default-active="$route.path"
            text-color="#fff"
            :unique-opened="true"
        >
            <!-- 遍历菜单内容 -->
            <!-- 有两种：第一种没有子菜单，另一种有子菜单 -->
            <template v-for="(item,index) in menuList">
                <router-link :to="item.path" v-if="!item.children&&!item.hidden" :key="index">
                    <el-menu-item :index="item.path" >
                        <el-icon>
                            <component class="icons" :is="item.icon"></component>
                        </el-icon>
                        <span>{{item.name}}</span>
                    </el-menu-item>
                </router-link>

                <el-sub-menu v-if="item.children&&!item.hidden" :key="index" :index="item.path">
                    <template #title>
                        <el-icon>
                            <component class="icons" :is="item.icon"></component>
                        </el-icon>
                        <span>{{item.name}}</span>
                    </template>
                    <router-link :to="item.path+'/'+subItem.path" v-for="(subItem,subIndex) in item.children" :key="subIndex">
                        <el-menu-item :index="item.path + '/' + subItem.path" v-if="!subItem.hidden">
                            <el-icon>
                                <component class="icons" :is="subItem.icon"></component>
                            </el-icon>
                            <span v-text="subItem.name"></span>
                        </el-menu-item>
                    </router-link>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
    import { Menu as IconMenu } from '@element-plus/icons-vue'; 
</script>
<script>
    import { routes } from '../router';

    export default {
        data() {
            return {
                menuList: []
            }
        },
        mounted() {
            let menuList = routes[0];
            this.menuList = menuList.children;
            console.log(this.menuList);
        }
    }
</script>

<style>
    .el-menu-vertical a{
        text-decoration: none;
    }
</style>