<template>
    <div>
    <div class="content-title-box" v-text="$route.name"></div>
        <div class="content-container-box">
            <router-view></router-view>
        </div>
    </div>
</template>
<script>
export default {

}
</script>
<style>
    /* 右边主体内容 变换页面 下 */
    .content-container-box {
        padding: 5px;
    }
    /* 标题 上 */
    .content-title-box {
        line-height: 30px;
        margin-top: -7px;
        padding: 5px;
        font-weight: 600;
        border-bottom: solid 1px #da8181;
    }

</style>