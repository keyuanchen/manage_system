<template>
  <el-container class="home-wrapper">
    <el-header>
      <div class="avatar-title">
        <img src="~assets/img/avatar.png" alt />
        <span>电商后台管理</span>
      </div>
      <div class="signOut">
        <el-button type="primary" @click="signOut">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isMenuCollapse ? '64px' : '200px'">
        <div class="isCollapse">
          <i
            @click="isMenuCollapse = !isMenuCollapse"
            v-if="!isMenuCollapse"
            class="iconfont icon-zuojiantou"
          ></i>
          <i
            @click="isMenuCollapse = !isMenuCollapse"
            v-else
            class="iconfont icon-youjiantou"
          ></i>
        </div>
        <el-menu
          :collapse="isMenuCollapse"
          :collapse-transition="false"
          :default-active="activeIndex"
          unique-opened
          router
          background-color="#fff"
          active-text-color="#8ce050"
        >
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuData"
            :key="item.id"
          >
            <template slot="title">
              <i :class="'iconfont' + ' ' + icons[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index="'/' + iten.path"
              v-for="iten in item.children"
              :key="iten.id"
              @click="menuItemTap('/' + iten.path)"
            >
              <template slot="title">
                <i class="iconfont icon-caidan"></i>
                <span>{{ iten.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      // 左侧导航默认激活的菜单
      activeIndex: '',
      // 左侧菜单数据
      menuData: [],
      // 一级菜单的图标
      icons: {
        '101': 'icon-shangpin',
        '103': 'icon-quanxian',
        '125': 'icon-yonghu',
        '102': 'icon-dingdan',
        '145': 'icon-shujutongji'
      },
      // 左侧菜单栏是否向左折叠
      isMenuCollapse: false
    }
  },
  created() {},
  mounted() {
    this.getNavMenuData()
    // 获取本地保存的菜单激活项
    // console.log(window.sessionStorage.getItem('activeIndex'))
    this.activeIndex = window.sessionStorage.getItem('activeIndex')
  },
  computed: {},
  methods: {
    // 退出登录
    signOut() {
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.replace('/login')
    },
    // 获取左侧菜单数据
    async getNavMenuData() {
      const { data: res } = await this.$axios({
        url: 'menus'
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$msg.error('获取菜单数据失败')
      // 获取数据成功
      this.$msg.success('获取菜单数据成功')
      // 保存菜单数据
      this.menuData = res.data
    },
    // 二级菜单选中
    menuItemTap(path) {
      this.activeIndex = path
      // 保存到本地
      window.sessionStorage.setItem('activeIndex', path)
    }
  },
  watch: {}
}
</script>
<style scoped>
.el-header {
  background-color: #264a6b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}
.avatar-title {
  width: 200px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.avatar-title img {
  width: 40px;
  height: 40px;
}
.el-aside {
  background-color: #fff;
}
.el-main {
  background-color: #e0edf1;
  padding: 10px 20px;
}
.home-wrapper {
  width: 100%;
  height: 100%;
}
.iconfont {
  margin-right: 5px;
}
.isCollapse {
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
