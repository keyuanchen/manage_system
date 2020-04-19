<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 表格区域 -->
      <el-table :data="rightsList" style="width: 100%">
        <el-table-column type="index" index-text="#" width="100"></el-table-column>
        <el-table-column prop="authName" label="权限名称" width="300"></el-table-column>
        <el-table-column prop="path" label="路径" width="300"></el-table-column>
        <el-table-column prop="level" label="权限等级" width="300">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="info">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 权限列表数据
      rightsList: []
    }
  },
  created () {
    this.getAllRightsList()
  },
  mounted () { },
  computed: {},
  methods: {
    // 获取所有的权限列表数据
    async getAllRightsList () {
      const { data: res } = await this.$axios(`rights/list`)
      if (res.meta.status !== 200) return this.$msg.error('获取权限列表数据失败')
      // 获取数据成功
      this.$msg.success('获取权限列表数据成功')
      // 保存权限列表数据
      this.rightsList = res.data
    }
  },
  watch: {}
}
</script>
<style scoped lang='less'>
</style>
