<template>
<div>
    <!-- 显示我们的内容 -->
    <div class="common-layout">
        <el-container>
        <el-header class="admin-header-box">
            <topHeader></topHeader>
        </el-header>
            <el-container class="main-container">
                <el-aside id="left-menu-list-box" width="200px">
                    <leftMenu></leftMenu>
                </el-aside>
                <el-container>
                  <el-main  class="main-container-right">
                      <router-view></router-view>
                  </el-main>
                  <!-- <el-footer class="base-footer">底部内容</el-footer> -->
                </el-container>
            </el-container>
        </el-container>
    </div>
</div>
</template>

<script>
export default {
    //动态设置侧边菜单的高度
    mounted() {
        // let leftMenuBox = document.getElementById('left-menu-list-box');
        // let adminHeaderBox = document.getElementById('admin-header-box');
        // if (leftMenuBox) {
        //     leftMenuBox.style.height = (window.innerHeight - adminHeaderBox.offsetHeight) + 'px';
        // }
    }
}
</script>
<style scoped>
  .main-container {
    position: absolute;
    width: 100%;
    top: 50px;
    bottom: 0;
  }
  
  .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 45px;
    height: 45px;
  }

  #left-menu-list-box .el-menu {
    border-right: none;
  }

  .el-header {
    background-color: #B3C0D1;
    height: 50px;
    color: #333;
    /* text-align: center; */
    line-height: 50px;
  }
  
  .el-aside {
    background-color: #9aa2ab;
    color: #333;
    border-right: solid 3px rgb(84, 173, 208);
    line-height: 200px;
    /* z-index: 200; */
  }
  
  .el-main{
    background-color: #E9EEF3;
    color: #333;
    --el-main-padding: 10px;
    /* text-align: center; */
    line-height: 50px;
  }
  
</style>