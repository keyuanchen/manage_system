<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input clearable @clear="getUsersList" v-model="queryInfo.query" placeholder="请输入搜索内容">
            <el-button @click="getUsersList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddUserDoalog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="usersList" style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="180"></el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-button
              @click="showEditUserDialog(scope.row)"
              type="primary"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              type="danger"
              @click="showDeleteMessageBox(scope.row)"
              size="mini"
              icon="el-icon-delete"
            ></el-button>
            <el-tooltip
              :enterable="false"
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                @click="showAllotRoleDialog(scope.row)"
                type="warning"
                size="mini"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      @close="addUserDialogClosed"
      :visible.sync="showAddUserDoalogVisible"
      width="60%"
    >
      <!-- 展示区域 -->
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddUserDoalogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      @close="editUserDialogClosed"
      :visible.sync="showEditUserDialogVisible"
      width="60%"
    >
      <!-- 表单区域 -->
      <el-form
        :model="userInfoBySlot"
        :rules="editUserFormRules"
        ref="editUserFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名">
          <el-input disabled v-model="userInfoBySlot.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfoBySlot.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userInfoBySlot.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      @close="allotRoleDialogClosed"
      title="分配角色"
      :visible.sync="showAllotRoleDialogVisible"
      width="60%"
    >
      <!-- 表单区域 -->
      <p>当前的用户：{{row.username}}</p>
      <p>当前的角色：{{row.role_name}}</p>
      <p>
        请选择：
        <el-select v-model="rolesData.id" placeholder="请选择" @change="changeSelectedValue">
          <el-option
            v-for="item in rolesData"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAllotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAllotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    // 自定义表单验证规则
    var checkEmail = (rule, value, callback) => {
      const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (!reg.test(value)) {
        return callback(new Error('请填写符合规则的邮箱'));
      } else {
        callback()
      }
    }
    var checkMobile = (rule, value, callback) => {
      const reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (!reg.test(value)) {
        return callback(new Error('请填写符合规则的手机号'));
      } else {
        callback()
      }
    }
    return {
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
        query: ''
      },
      // 用户列表总条数
      total: 0,
      // 用户列表数据
      usersList: [],
      // 添加用户对话框的显示与隐藏
      showAddUserDoalogVisible: false,
      // 添加用户表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 用户表单验证规则
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户信息对话框的显示与隐藏
      showEditUserDialogVisible: false,
      // 点击用户的信息
      userInfoBySlot: {},
      // 编辑用户信息表单数据
      editUserForm: {
        email: '',
        mobile: ''
      },
      // 编辑用户表单验证规则
      editUserFormRules: {
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框的显示与隐藏
      showAllotRoleDialogVisible: false,
      // 用户信息数据
      userInfo: {},
      // 角色列表数据
      rolesData: [],
      // 该行用户数据
      row: {},
      // 下拉框选中项的值
      rid: ''
    }
  },
  created () {
    this.getUsersList()
  },
  mounted () { },
  computed: {},
  methods: {
    // 获取用户列表数据
    async getUsersList () {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$msg.error('获取用户列表数据失败')
      // 获取用户列表数据成功
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 页面条数发生变化
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      // 获取用户列表数据
      this.getUsersList()
    },
    // 翻页
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      // 获取用户列表数据
      this.getUsersList()
    },
    // 显示添加用户对话框
    showAddUserDoalog () {
      // 显示添加用户的对话框
      this.showAddUserDoalogVisible = true
    },
    // 添加用户对话框关闭
    addUserDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 确认添加用户
    confirmAddUser () {
      // 进行表单的预校验
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写正确的表单信息')
        // 校验通过
        // 发送添加用户信息
        const { data: res } = await this.$axios.post('users', this.addUserForm)
        if (res.meta.status !== 201) return this.$msg.error('添加用户信息失败')
        // 添加用户信息成功
        this.$msg.success('添加用户信息成功')
        // 刷新用户列表数据
        this.getUsersList()
        // 隐藏添加用户对话框
        this.showAddUserDoalogVisible = false
      })
    },
    // 显示编辑用户信息的对话框
    showEditUserDialog (row) {
      // console.log(row)
      this.userInfoBySlot = row
      // 对话框显示
      this.showEditUserDialogVisible = true
    },
    // 编辑用户信息对话框关闭
    editUserDialogClosed () {
      this.$refs.editUserFormRef.resetFields()
    },
    // 确认修改用户信息
    confirmEditUser () {
      // 先进行表单的预校验
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写正确的邮箱或手机号')
        // 验证成功
        // 先获取最新的表单项数据
        this.editUserForm.email = this.userInfoBySlot.email
        this.editUserForm.mobile = this.userInfoBySlot.mobile
        // 发送请求
        const { data: res } = await this.$axios.put(`users/${this.userInfoBySlot.id}`, this.editUserForm)
        if (res.meta.status !== 200) return this.$msg.error('修改用户信息失败')
        // 修改成功
        this.$msg.success('修改用户信息成功')
        // 刷新用户列表数据
        this.getUsersList()
        // 对话框关闭
        this.showEditUserDialogVisible = false
      })
    },
    // 点击删除用户信息
    async showDeleteMessageBox (row) {
      const confirmRes = await this.$con('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 判断用户是否点击了确认
      // 用户点击了取消
      if (confirmRes !== 'confirm') return this.$msg.info('您点击了取消删除')
      // 点击了确认删除
      // 发送请求删除用户信息
      const { data: res } = await this.$axios.delete(`users/${row.id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除用户信息失败')
      // 删除成功
      this.$msg.success('删除用户信息成功')
      // 刷新用户列表
      this.getUsersList()
    },
    // 显示分配角色对话框
    async showAllotRoleDialog (row) {
      this.row = row
      // 根据id获取到用户的信息
      const { data: res } = await this.$axios.get(`users/${row.id}`)
      if (res.meta.status !== 200) return this.$msg.error('获取用户信息失败')
      // 获取用户信息成功
      // 保存信息
      this.userInfo = res.data
      // 获取角色列表
      const { data: result } = await this.$axios.get(`roles`)
      if (result.meta.status !== 200) return this.$msg.error('获取角色列表数据失败')
      this.rolesData = result.data
      // 显示对话框
      this.showAllotRoleDialogVisible = true
    },
    // 分配角色对话框关闭
    allotRoleDialogClosed () {
      this.rolesData.id = ''
    },
    // 下拉框选中
    changeSelectedValue (newValue) {
      this.userInfo.role_id = newValue
    },
    // 确认分配角色
    async confirmAllotRole () {
      // 发送请求
      const { data: res } = await this.$axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.userInfo.role_id
      })
      if (res.meta.status !== 200) return this.$msg.error('分配角色失败')
      // 分配成功
      // 刷新用户列表
      this.getUsersList()
      // 对话框关闭
      this.showAllotRoleDialogVisible = false
    }
  },
  watch: {}
}
</script>
<style scoped lang="less"></style>
