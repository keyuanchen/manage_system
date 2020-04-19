<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 文字提示的区域 -->
      <el-alert title="添加商品信息" show-icon center type="info"></el-alert>
      <!-- 进度条区域 -->
      <el-steps
        align-center
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品信息"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 大表单 -->
      <el-form
        label-position="top"
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <!-- 标签页区域 -->
        <el-tabs
          :before-leave="beforLeave"
          v-model="activeIndex"
          :tab-position="tabPosition"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input
                type="number"
                v-model="addGoodsForm.goods_price"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量(kg)" prop="goods_weight">
              <el-input
                type="number"
                v-model="addGoodsForm.goods_weight"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                type="number"
                v-model="addGoodsForm.goods_number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoriesData"
                :props="addGoodsProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(iten, index) in item.attr_vals"
                  :key="index"
                  :label="iten"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品信息" name="2">
            <el-form-item
              v-for="item in onlyData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(iten, index) in item.attr_vals"
                  :key="index"
                  :label="iten"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="configHeader"
              action="https://www.liulongbin.top:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleUploadPic"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传图片</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              v-model="addGoodsForm.goods_introduce"
              ref="myQuillEditor"
            >
            </quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框区域 -->
    <el-dialog
      title="图片预览"
      :visible.sync="showPicPreviewDialogVisible"
      width="60%"
    >
      <!-- 图片区域 -->
      <!-- 这里的图片是绝对路径地址 -->
      <img class="preview-pic" :src="absImgPath" alt />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  components: {},
  data() {
    return {
      // 步骤条激活索引值
      activeIndex: '0',
      // 标签页位置
      tabPosition: 'left',
      // 添加商品表单
      addGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的表单验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择三级分类商品', trigger: 'blur' }
        ]
      },
      // 配置级联选择器展示
      addGoodsProps: {
        label: 'cat_name',
        children: 'children',
        value: 'cat_id',
        expandTrigger: 'hover'
      },
      // 分类数据
      categoriesData: [],
      // 级联选择器选中项
      // selectedKeys: []
      // 动态参数数据
      manyData: [],
      //静态属性数据
      onlyData: [],
      // 配置图片上传的请求头信息
      configHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对话框的显示与隐藏
      showPicPreviewDialogVisible: false,
      // 预览图片的绝对路径
      absImgPath: ''
    }
  },
  created() {},
  mounted() {
    this.getAllCategoriesData()
  },
  computed: {
    // 商品分类id
    cateId() {
      if (this.addGoodsForm.goods_cat.length !== 3) return null
      return this.addGoodsForm.goods_cat[2]
    }
  },
  methods: {
    // 获取所有的分类数据
    async getAllCategoriesData() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) return this.$msg.error('获取分类数据失败')
      // 拿到了分类数据
      this.categoriesData = res.data
    },
    // 级联选择器选中项变化
    handleChange(newValue) {
      this.addGoodsForm.goods_cat = newValue
      console.log(this.addGoodsForm.goods_cat)
    },
    // 标签页切换触发
    async tabClick() {
      if (
        this.activeIndex === '1' &&
        this.addGoodsForm.goods_cat.length === 3
      ) {
        // 请求获取所有的动态参数数据
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) return this.$msg.error('获取动态参数失败')
        // 改造数据
        res.data.forEach(i => {
          i.attr_vals = i.attr_vals ? i.attr_vals.split(',') : []
        })
        // 获取参数成功
        this.manyData = res.data
        console.log(this.manyData)
      } else if (this.activeIndex === '2') {
        // 发送请求获取到静态属性的数据
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) return this.$msg.error('获取数据失败')
        // 获取静态属性成功
        this.$msg.success('获取静态属性成功')
        console.log(res.data)
        res.data.forEach(i => {
          i.attr_vals = i.attr_vals ? i.attr_vals.split(',') : []
        })
        this.onlyData = res.data
      }
    },
    // 离开当前标签页
    beforLeave(newName, old) {
      if (old === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$msg.info('请选择三级分类商品')
        // 不跳转
        return false
      }
    },
    // 图片预览的时候
    handlePreview(file) {
      console.log(file)
      this.absImgPath = file.absImgPath
      this.$nextTick(_ => {
        this.showPicPreviewDialogVisible = true
      })
    },
    // 图片点击删除
    handleRemove(file) {
      console.log(file.response.data.tmp_path)
      // 找到pics数组中有相同临时图片路径的索引值
      const index = this.addGoodsForm.pics.findIndex(
        i => file.response.data.tmp_path === i.pic
      )
      // 根据索引值调用数组方法删除元素
      this.addGoodsForm.pics.splice(index, index)
    },
    // 图片上传成功
    handleUploadPic(res, file) {
      // console.log(res)
      // 保存图片的绝对地址
      file.absImgPath = res.data.url
      // 组织符合要求的形式的对象，准备添加到addGoodsForm大表单对象中
      const picObj = {
        pic: res.data.tmp_path
      }
      // 将组织好的对象push到pics数组中
      this.addGoodsForm.pics.push(picObj)
    },
    // 添加商品
    addGoods() {
      // 进行表单预校验
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$msg.info('请填写必要项')
        // 校验通过
        // 对addGoodsForm中的goods_cat数组拼接成以,分隔的字符串
        // 这里有一个注意点，就是级联选择器和这个数组是双向数据绑定的，不能动原来数组
        // 这里使用了lodash深拷贝一个新的表单添加对象
        const newObj = _.cloneDeep(this.addGoodsForm)
        // 对新对象进行数据改造
        // 分类商品id以,分隔
        newObj.goods_cat = newObj.goods_cat.join(',')
        // 进行动态参数和静态属性的数据改造
        const attrs = []
        // 对动态参数和静态属性的数据进行改造
        this.manyData.forEach(i => {
          const obj = {}
          obj.attr_id = i.attr_id
          obj.attr_value = i.attr_vals.join(',')
          attrs.push(obj)
        })
        this.manyData.forEach(i => {
          const obj = {}
          obj.attr_id = i.attr_id
          obj.attr_value = i.attr_vals.join(',')
          attrs.push(obj)
        })
        newObj.attrs = attrs
        // 至此数据改造成功
        // 发送请求添加商品
        const { data: res } = await this.$axios.post('goods', newObj)
        if (res.meta.status !== 201) return this.$msg.error('添加商品失败')
        // 添加商品成功
        this.$msg.success('添加商品成功')
        // 跳转到goods页面
        this.$router.replace('/goods')
      })
    }
  },
  watch: {}
}
</script>
<style scoped>
.el-steps {
  margin: 10px;
}
.el-checkbox {
  margin: 10px;
}
.preview-pic {
  width: 100%;
}
.quill-editor {
  margin-bottom: 10px;
}
</style>
