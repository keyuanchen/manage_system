<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
      <!-- 分类数据表格区域 -->
      <zk-table
        class="zk-table-content"
        border
        stripe
        show-index
        :expand-type="false"
        :selection-type="false"
        :data="categoriesTreeData"
        empty-text="暂无商品分类数据"
        sum-text="sum"
        index-text="#"
        :columns="categoriesColumns"
      >
        <template slot="cat_name"></template>
        <template slot="cat_deleted" slot-scope="scope">
          <i v-if="!scope.row.cat_deleted" class="iconfont icon-duihao cat_deleted"></i>
          <i v-else class="iconfont icon-duihao"></i>
        </template>
        <template slot="cat_level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button
            size="small"
            @click="editCategory(scope.row)"
            type="primary"
            icon="el-icon-edit"
          >编辑</el-button>
          <el-button
            size="small"
            @click="deleteCategory(scope.row)"
            type="warning"
            icon="el-icon-delete"
          >删除</el-button>
        </template>
      </zk-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 3, 5, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框区域 -->
    <el-dialog
      @close="addCategoryDialogClosed"
      title="添加分类"
      :visible.sync="showAddCategoryDialogVisible"
      width="60%"
    >
      <!-- 添加分类表单区域 -->
      <el-form
        :model="addCategoryForm"
        :rules="addCategoryFormRules"
        ref="addCategoryFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            clearable
            v-model="selectedPids"
            :options="pCategoriesData"
            :props="addCategoryProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddCategory">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类商品的对话框区域 -->
    <el-dialog title="编辑分类" :visible.sync="showEditCategoryDialogVisible" width="60%">
      <!-- 表单区域 -->

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="showEditCategoryDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 查询分类信息对象
      queryinfo: {
        type: '',
        pagenum: 1,
        pagesize: 5
      },
      // 分类数据树
      categoriesTreeData: [],
      // 分类表格配置模板项
      categoriesColumns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '200px',
          type: 'template',
          template: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'cat_deleted',
          width: '100px'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'cat_level',
          width: '100px'
        },
        {
          label: '操作',
          prop: 'operation',
          type: 'template',
          template: 'operation',
          width: '150px'
        }
      ],
      // 分类商品总数
      total: 0,
      // 添加商品分类对话框的显示与隐藏
      showAddCategoryDialogVisible: false,
      // 添加分类表单
      addCategoryForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单的验证规则
      addCategoryFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类的数据
      pCategoriesData: [],
      // 父级分类级联选择器的配置信息
      addCategoryProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中项的值
      selectedPids: [],
      // 编辑分类对话框的显示与隐藏
      showEditCategoryDialogVisible: false
    }
  },
  created () {
    this.getCategoriesTreeData()
  },
  mounted () { },
  computed: {},
  methods: {
    // 获取所有的分类数据
    async getCategoriesTreeData () {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryinfo
      })
      if (res.meta.status !== 200)
        return this.$msg.error('获取商品分类数据失败')
      // 获取数据成功
      this.$msg.success('获取商品分类数据成功')
      // console.log(res.data)
      this.categoriesTreeData = res.data.result
      this.total = res.data.total
    },
    // 编辑商品分类
    editCategory (row) {
      // 显示编辑的对话框
      this.showEditCategoryDialogVisible = true
    },
    // 删除分类
    async deleteCategory (row) {
      // console.log(row)
      const resultConfirm = await this.$con('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultConfirm !== 'confirm') return this.$msg.info('您取消了删除')
      // 点击了确认删除
      // 发送请求删除该分类
      const { data: res } = await this.$axios.delete(`categories/${row.cat_id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除该分类失败')
      // 删除成功
      this.$msg.success('删除该分类成功')
      // 刷新分类树的数据
      this.getCategoriesTreeData()
    },
    // 页面分类数据条数改变
    handleSizeChange (newSize) {
      this.queryinfo.pagesize = newSize
      this.getCategoriesTreeData()
    },
    // 页码改变
    handleCurrentChange (newPage) {
      this.queryinfo.pagenum = newPage
      this.getCategoriesTreeData()
    },
    // 点击添加分类按钮
    async showAddCategoryDialog () {
      // 获取所有的一级和二级商品分类数据
      const { data: res } = await this.$axios.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$msg.error('获取分类数据失败')
      // 获取数据成功
      // 保存到vue实例data中
      // console.log(res.data)
      this.pCategoriesData = res.data
      console.log(this.pCategoriesData)
      // 显示对话框
      this.showAddCategoryDialogVisible = true
    },
    // 级联选择器选中项变化
    handleChange (newValue) {
      this.selectedPids = newValue
      // console.log(newValue[newValue.length - 1])
      // 将添加分类表单数据中的父级id赋值
      this.addCategoryForm.cat_pid = newValue[newValue.length - 1]
      // 分类层级和这个newValue数组的长度相等
      this.addCategoryForm.cat_level = newValue.length - 1
    },
    // 对话框关闭
    addCategoryDialogClosed () {
      this.selectedPids.length = 0
      this.$refs.addCategoryFormRef.resetFields()
    },
    // 确认添加分类数据
    confirmAddCategory () {
      // 先进行表单的预校验
      this.$refs.addCategoryFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请您填写必要项')
        // 验证通过
        // 发送请求添加商品分类
        const { data: res } = await this.$axios.post('categories', this.addCategoryForm)
        if (res.meta.status !== 201) return this.$msg.error('添加分类数据失败')
        // 添加分类数据成功
        this.$msg.success('分类数据添加成功')
        // 刷新分类树表
        this.getCategoriesTreeData()
        // 关闭对话框
        this.showAddCategoryDialogVisible = false
      })
    }
  },
  watch: {}
}
</script>
<style scoped>
.cat_deleted {
  color: #86db49;
}
.zk-table-content {
  margin: 20px 0;
}
.el-cascader {
  width: 100%;
}
</style>
