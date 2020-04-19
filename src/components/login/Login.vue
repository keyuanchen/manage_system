<template>
  <div class="login-container">
    <!-- 头像 -->
    <div class="avatar-container">
      <img src="~assets/img/avatar.png" alt />
    </div>
    <!-- 登录表单 -->
    <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
      <el-form-item prop="username">
        <el-input
          aria-placeholder="请输入用户名"
          prefix-icon="iconfont icon-yonghuming"
          v-model="loginForm.username"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          aria-placeholder="请输入登录密码"
          prefix-icon="iconfont icon-mima"
          v-model="loginForm.password"
        ></el-input>
      </el-form-item>
      <el-form-item class="btn-container">
        <el-button type="primary" @click="signIn">登录</el-button>
        <el-button type="primary" plain @click="signUp">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      // 登录表单
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户登录名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () { },
  mounted () { },
  computed: {},
  methods: {
    // 重置登录表单
    signUp () {
      this.$refs.loginFormRef.resetFields()
    },
    // 点击登录
    signIn () {
      // 先进行表单的预校验
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请填写符合要求的用户名或密码')
        // 验证通过
        // 发送请求进行登录验证
        const { data: res } = await this.$axios({
          url: 'login',
          method: 'post',
          data: this.loginForm
        })
        if (res.meta.status !== 200) return this.$msg.error('登录失败')
        // 登录成功获取到token
        const token = res.data.token
        console.log(token)
        // 将获取到的令牌保存在本地sessionStorage中
        window.sessionStorage.setItem('token', token)
        // 跳转到home页面
        this.$router.replace('/home')
      })
    }
  },
  watch: {}
}
</script>
<style scoped>
.login-container {
  width: 400px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: #3983ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-container img {
  width: 95%;
  height: 95%;
  border-radius: 50%;
}
.el-form {
  width: 90%;
}
.btn-container {
  text-align: right;
}
</style>
