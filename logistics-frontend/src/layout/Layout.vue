<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">

      <el-aside width="200px" style="background-color: #304156;">
        <div style="color: white; text-align: center; line-height: 60px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #1f2d3d;">
          物流协同平台
        </div>
        <el-menu
          active-text-color="#409eff"
          background-color="#304156"
          text-color="#bfcbd9"
          :default-active="$route.path"
          router
          style="border-right: none;"
        >
          <el-menu-item index="/customer">
            <el-icon><ShoppingCart /></el-icon>
            <span>客户下单 (4S店)</span>
          </el-menu-item>
          <el-menu-item index="/shipper">
            <el-icon><Van /></el-icon>
            <span>发运调度 (物流)</span>
          </el-menu-item>
          <el-menu-item index="/carrier">
            <el-icon><Location /></el-icon>
            <span>在途承运 (司机)</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 16px; color: #606266;">
            <el-icon style="vertical-align: middle; margin-right: 5px;"><Monitor /></el-icon>
            <span style="vertical-align: middle;">工作台</span>
          </div>
          <el-dropdown>
            <span class="el-dropdown-link" style="cursor: pointer; display: flex; align-items: center;">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span style="margin-left: 8px; color: #606266;">当前用户</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-header>

        <el-main style="background-color: #f0f2f5; padding: 20px;">
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<script setup>
// 目前骨架不需要太多复杂逻辑，图标已经在 main.js 全局注册了
</script>

<style scoped>
/* 去除默认的内外边距，让布局完全贴合屏幕 */
:global(body) {
  margin: 0;
  padding: 0;
}
</style>