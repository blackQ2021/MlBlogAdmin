<template>
  <!-- 显示我们的内容 -->
  <div>
    <router-view></router-view>
  </div>

</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
  * {
    padding: 0;
    margin: 0;
  }

  .margin-bottom {
    margin-bottom: 20px;
  }
</style>
