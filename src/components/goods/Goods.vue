<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框及添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入商品名称" v-model="queryinfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="18">
          <el-button type="primary" @click="goToAddProduct">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品表格数据展示区域 -->
      <el-table :data="productData" style="width: 100%">
        <el-table-column type="index" width="40"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="520"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量(公斤)" width="120"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="200"></el-table-column>
        <el-table-column label="操作" width="200">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeProductById(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 查询信息对象
      queryinfo: {
        query: '',
        pagesize: 10,
        pagenum: 1
      },
      // 商品列表数据
      productData: [],
      // 商品总条数
      total: 0
    }
  },
  created () { },
  mounted () {
    this.getProductData()
  },
  computed: {},
  methods: {
    // 获取商品列表数据
    async getProductData () {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryinfo
      })
      if (res.meta.status !== 200) return this.$msg.error('获取商品列表数据失败')
      // 拿到了商品数据
      this.productData = res.data.goods
      this.total = res.data.total
    },
    // 页面条数改变
    handleSizeChange (newSize) {
      this.queryinfo.pagesize = newSize
      this.getProductData()
    },
    // 页码改变
    handleCurrentChange (newPage) {
      this.queryinfo.pagenum = newPage
      this.getProductData()
    },
    // 删除商品信息
    async removeProductById (row) {
      const resConfirm = await this.$con('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => console.log(err))

      if (resConfirm !== 'confirm') return this.$msg.info('您点击了取消删除')
      // 删除商品
      const { data: res } = await this.$axios.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除商品数据失败')
      // 删除成功
      this.$msg.success('删除商品成功')
      // 刷新商品列表数据
      this.getProductData()
    },
    // 点击添加商品按钮
    goToAddProduct () {
      this.$router.replace('/goods/add')
    }
  },
  watch: {}
}
</script>
<style scoped>
</style>
