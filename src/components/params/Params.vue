<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示消息区域 -->
      <el-alert show-icon title="注意：这里只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <!-- 选择商品分类区域 -->
      <p>
        选择商品分类：
        <el-cascader
          class="cascader-container"
          clearable
          v-model="selectedKeys"
          :options="allLastCategoriesData"
          :props="categoriesDataProps"
          @change="handleChange"
        ></el-cascader>
      </p>
      <!-- 选项卡区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            :disabled="isBtnDisable"
            size="small"
            type="primary"
            @click="showAddManyOrOnlyDialog"
          >添加参数</el-button>
          <!-- 表格区域 -->
          <el-table border stripe :data="manyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  @close="removeAttrVal(scope.row, index)"
                  class="tag-item"
                  type="success"
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item.attr_id"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" width="200"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="300"></el-table-column>
            <el-table-column label="操作" width="400">
              <template v-slot="scope">
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeMessageBox(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            :disabled="isBtnDisable"
            size="small"
            type="primary"
            @click="showAddManyOrOnlyDialog"
          >添加属性</el-button>
          <!-- 表格区域 -->
          <el-table border stripe :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  class="tag-item"
                  type="success"
                  closable
                  v-for="item in scope.row.attr_vals"
                  :key="item.attr_id"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" width="200"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="300"></el-table-column>
            <el-table-column label="操作" width="400">
              <template v-slot="scope">
                <el-button
                  @click="showEditParamsDialog(scope.row)"
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeMessageBox(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数或者添加属性对话框的区域 -->
    <el-dialog
      @close="addManyOrOnlyDialogClosed"
      :title="'添加'+ titleText"
      :visible.sync="showAddManyOrOnlyDialogVisible"
      width="60%"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddManyOrOnlyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数或者添加属性对话框的区域 -->
    <el-dialog
      @close="editManyOrOnlyDialogClosed"
      :title="'编辑'+ titleText"
      :visible.sync="showEditParamsDialogVisible"
      width="60%"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 分类商品数据
      allLastCategoriesData: [],
      // 级联选择器的展示配置项
      categoriesDataProps: {
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        value: 'cat_id'
      },
      // 级联选择器的选中项数组
      selectedKeys: [],
      // 选项卡激活name
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 添加参数或者添加属性对话框的显示与隐藏
      showAddManyOrOnlyDialogVisible: false,
      // 添加参数或者添加属性对话框表单数据
      addParamsForm: {
        attr_name: '',
        attr_sel: this.activeName
      },
      // 添加参数或者添加属性表单的验证规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入必填信息', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 编辑参数或者属性对话框的显示与隐藏
      showEditParamsDialogVisible: false,
      // 编辑参数或者属性对话框的表单
      editParamsForm: {
        attr_name: '',
        attr_sel: ''
      },
      // 编辑参数或者属性对话框的表单验证规则
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入必填信息', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 当前编辑的参数id
      attrId: ''
      // 动态编辑输入框内容
      // inputValue: '',
      // 输入框是否显示
      // inputVisible: false
    }
  },
  created () { },
  mounted () {
    this.getLastCategoriesData()
  },
  computed: {
    // 分类id
    cateId () {
      if (!this.selectedKeys) return null
      return this.selectedKeys[this.selectedKeys.length - 1]
    },
    // 动态参数或者静态属性按钮是否可用
    isBtnDisable () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 添加参数或者添加属性对话框的显示标题文本
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  },
  methods: {
    // 获取所有的分类数据
    async getLastCategoriesData () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
      // 获取分类数据成功
      this.$msg.success('获取分类数据成功')
      this.allLastCategoriesData = res.data
    },
    // 级联选择器选中项变化
    handleChange (newKey) {
      console.log(newKey)
      this.selectedKeys = newKey
      // 获取到对应的动态参数或者静态属性的数据
      this.getCategoriesParamsData(this.activeName)
    },
    // 切换tab标签
    handleClick () {
      if (this.selectedKeys.length === 0) return this.$msg.info('请选择三级分类商品')
      // 加载对应参数或者属性的数据
      // console.log(this.activeName)
      this.getCategoriesParamsData(this.activeName)
    },
    // 获取动态参数或者静态属性的数据
    async getCategoriesParamsData (activeName) {
      console.log(activeName)
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: activeName
        }
      })
      if (res.meta.status !== 200) return this.$msg.error('获取数据失败')
      // 获取动态参数成功
      this.$msg.success('获取数据成功')
      console.log(res.data)
      // 改造数据，attr_vals改造成数组
      res.data.forEach(i => {
        i.attr_vals = i.attr_vals ? i.attr_vals.split(',') : []
        i.inputValue = ''
        i.inputVisible = false
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 显示添加参数或者添加属性对话框
    showAddManyOrOnlyDialog () {
      // 显示对话框
      this.showAddManyOrOnlyDialogVisible = true
    },
    // 确认添加参数或者添加属性
    confirmAddParams () {
      // 表单预校验
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写必要项')
        // 验证通过
        // 确认添加
        const { data: res } = await this.$axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$msg.error('添加数据失败')
        // 添加成功
        this.$msg.success('添加数据成功')
        // 刷新参数或者属性列表
        this.getCategoriesParamsData(this.activeName)
        // 关闭对话框
        this.showAddManyOrOnlyDialogVisible = false
      })
    },
    // 添加参数或者添加属性对话框关闭
    addManyOrOnlyDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 显示编辑参数或者属性对话框
    async showEditParamsDialog (row) {
      // 获取参数
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$msg.error('获取失败')
      // 获取成功
      this.$msg.success('获取参数成功')
      this.editParamsForm.attr_name = res.data.attr_name
      this.attrId = res.data.attr_id
      this.showEditParamsDialogVisible = true
    },
    // 编辑对话框关闭
    editManyOrOnlyDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 确认修改参数
    confirmEditParams () {
      // 进行表单预校验
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写必要项')
        // 校验通过
        // 发送请求编辑
        // 发送请求编辑数据
        const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${this.attrId}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$msg.error('修改数据失败')
        // 编辑成功
        this.$msg.success('编辑成功')
        // 刷新参数列表
        this.getCategoriesParamsData(this.activeName)
        // 关闭对话框
        this.showEditParamsDialogVisible = false
      })
    },
    // 删除参数或者属性
    async removeMessageBox (row) {
      const resConfirm = await this.$con('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => console.log(err))
      if (resConfirm !== 'confirm') return this.$msg.info('您取消了删除')
      // 点击了确认删除
      // 发送请求删除数据
      const { data: res } = await this.$axios.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除失败')
      // 删除成功
      this.$msg.success('删除成功')
      // 刷新列表
      this.getCategoriesParamsData(this.activeName)
    },
    // 关闭tag
    async removeAttrVal (row, i) {
      this.attrId = row.attr_id
      // 删除该行数据中attr_vals数组中对应索引的值
      row.attr_vals.splice(i, 1)
      this.saveManyOrOnlyData(row)
    },
    // 保存修改删除的动态参数或者静态属性的数据
    async saveManyOrOnlyData (row) {
      const attr_vals = row.attr_vals
      // 拼接成字符串形式
      const attrValsStr = attr_vals.join(',')
      // 编辑修改参数
      // 发送请求编辑数据
      const { data: res } = await this.$axios.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: attrValsStr
      })
      if (res.meta.status !== 200) return this.$msg.error('修改数据失败')
      // 编辑成功
      this.$msg.success('编辑成功')
    },
    // 输入框失去焦点或者enter键抬起的时候
    handleInputConfirm (row) {
      // 输入框隐藏
      row.inputVisible = false
      if (row.inputValue.trim()) {
        row.attr_vals.push(row.inputValue.trim())
        // 保存数据
        this.saveManyOrOnlyData(row)
      }
      row.inputValue = ''
    },
    // 点击编辑按钮
    showInput (row) {
      // 修改输入框的显示与隐藏,改为显示
      row.inputVisible = true
      // this.$set(row, 'inputVisible', true)
      // 自动获取输入框焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      });
    }
  },
  watch: {}
}
</script>
<style scoped>
.cascader-container {
  margin: 20px 0;
}
.tag-item {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
