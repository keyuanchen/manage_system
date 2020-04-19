<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
      <!-- 角色列表表格 -->
      <el-table :data="rolesList" style="width: 100%">
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item, index) in scope.row.children"
              :class="'bdBottom' + ' ' + { bdTop: index === 0 }"
              :key="item.id"
            >
              <el-col :span="6">
                <el-tag
                  @close="deleteRightsById(item.id, scope.row)"
                  closable
                  type="primary"
                  >{{ item.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="18">
                <el-row
                  v-for="(iten, indey) in item.children"
                  :class="{ bdTop: indey !== 0 }"
                  :key="iten.id"
                >
                  <el-col :span="6">
                    <el-tag
                      @close="deleteRightsById(iten.id, scope.row)"
                      closable
                      type="info"
                      >{{ iten.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="i in iten.children"
                      :key="i.id"
                      @close="deleteRightsById(i.id, scope.row)"
                      >{{ i.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          width="300"
        ></el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          width="300"
        ></el-table-column>
        <el-table-column label="操作" width="450">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showAllotRightsDialog(scope.row)"
              >分配角色</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框区域 -->
    <el-dialog
      @close="allotRightsDialogClosed"
      title="分配权限"
      :visible.sync="showAllotRightsDialogVisible"
      width="60%"
    >
      <!-- 树形结构区域 -->
      <el-tree
        ref="treeRightsRef"
        :data="rightsData"
        show-checkbox
        node-key="id"
        highlight-current
        default-expand-all
        :default-checked-keys="selectedKeys"
        :props="allotRightsProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAllotRightsDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="confirmAllotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      @close="addRoleDialogClosed"
      title="添加角色"
      :visible.sync="showAddRoleDialogVisible"
      width="60%"
    >
      <!-- 添加角色表单 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 分配权限对话框的显示与隐藏
      showAllotRightsDialogVisible: false,
      // 所有的权限数据
      rightsData: [],
      // 默认展开的节点id数组
      selectedKeys: [],
      // 结构展示的配置项
      allotRightsProps: {
        label: 'authName',
        children: 'children'
      },
      // 角色id
      rid: '',
      // 添加角色对话框的显示与隐藏
      showAddRoleDialogVisible: false,
      // 添加角色表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  mounted() {},
  computed: {},
  methods: {
    // 获取角色列表
    async getRolesList() {
      // 发送请求获取角色列表数据
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200)
        return this.$msg.error('获取角色列表数据失败')
      // 获取数据成功
      this.$msg.success('获取角色列表数据成功')
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 根据权限id删除对应的权限
    async deleteRightsById(id, row) {
      const resultConfirm = await this.$con(
        '此操作将永久删除该角色下的权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => console.log(err))
      if (resultConfirm !== 'confirm') return this.$msg.info('您取消了删除权限')
      // 点击了确认删除
      // 发送请求删除数据库中的角色下的对应的权限
      const { data: res } = await this.$axios.delete(
        `roles/${row.id}/rights/${id}`
      )
      if (res.meta.status !== 200) return this.$msg.error('删除权限失败')
      // 删除成功
      this.$msg.success('删除权限成功')
      // 刷新权限数据(这里不推荐使用刷新权限列表,会导致展开列闭合，这不友好于用户体验)
      // this.getRolesList()
      row.children = res.data
    },
    // 点击显示分配权限对话框
    async showAllotRightsDialog(row) {
      this.rid = row.id
      // 先发送请求获取所有的权限树数据
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) return this.$msg.error('获取权限数据失败')
      // 获取数据成功
      this.$msg.success('获取权限数据成功')
      // 保存到实例中
      this.rightsData = res.data
      // 获取点击行的所有最后一级节点的id值，保存到selectedKeys中
      this.getLastNodeIds(row, this.selectedKeys)
      // console.log(this.selectedKeys)
      // 显示对话框
      this.showAllotRightsDialogVisible = true
    },
    // 获取树结构最后一级节点的id
    getLastNodeIds(node, arr) {
      if (!node.children) return arr.push(node.id)
      // 如果不是最后一级节点
      node.children.forEach(i => {
        this.getLastNodeIds(i, arr)
      })
    },
    // 确认分配权限
    async confirmAllotRights() {
      // 获取选中的所有选中项的id值
      const halfCheckedKeys = this.$refs.treeRightsRef.getHalfCheckedKeys()
      const checkedKeys = this.$refs.treeRightsRef.getCheckedKeys()
      const selectedKeys = [...halfCheckedKeys, ...checkedKeys].join(',')
      // console.log(selectedKeys)
      const { data: res } = await this.$axios.post(`roles/${this.rid}/rights`, {
        rids: selectedKeys
      })
      if (res.meta.status !== 200) return this.$msg.error('分配权限失败')
      // 分配权限成功
      this.$msg.success('分配权限成功')
      // 刷新角色列表
      this.getRolesList()
      // 分配权限对话框关闭
      this.showAllotRightsDialogVisible = false
    },
    // 分配权限对话框关闭
    allotRightsDialogClosed() {
      // 树形数据之前的选中项数据清空
      this.selectedKeys.length = 0
    },
    // 添加角色
    showAddRoleDialog() {
      // 对话框显示
      this.showAddRoleDialogVisible = true
    },
    // 添加角色
    confirmAddRole() {
      // 先进行表单的预校验
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写必要的信息')
        // 验证通过
        // 发送请求添加角色
        const { data: res } = await this.$axios.post(`roles`, this.addRoleForm)
        if (res.meta.status !== 201) return this.$msg.error('添加角色失败')
        // 添加角色成功
        this.$msg.success('添加角色成功')
        // 刷新角色列表
        this.getRolesList()
        // 对话框关闭
        this.showAddRoleDialogVisible = false
      })
    },
    // 添加角色对话框关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    }
  },
  watch: {}
}
</script>
<style scoped>
.el-tag {
  margin: 20px 10px;
}
.bdTop {
  border: 1px solid #eee;
}
.bdBottom {
  border: 1px solid #eee;
}

.el-row {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
