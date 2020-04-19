<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row>
        <el-col :span="10">
          <el-input
            clearable
            @clear="inputEmpty"
            placeholder="请输入搜索内容"
            v-model="queryinfo.query"
            class="input-with-select"
          >
            <el-button
              @click="searchOrder"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格区域 -->
      <el-table :data="ordersListData" style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="180">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="180">
        </el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="180">
          <template v-slot="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger"
              >未付款</el-tag
            >
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="180">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template>
            <el-tooltip
              :enterable="false"
              class="item"
              effect="dark"
              content="添加收货地址"
              placement="top"
            >
              <el-button
                @click="addAddress"
                size="mini"
                type="primary"
                icon="el-icon-edit"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              :enterable="false"
              class="item"
              effect="dark"
              content="查询物流信息"
              placement="top"
            >
              <el-button
                @click="viewLogisticsInformation"
                size="mini"
                type="warning"
                icon="el-icon-location-information"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加收货地址对话框的区域 -->
    <el-dialog
      @close="addAddressDialogClosed"
      title="添加地址"
      :visible.sync="showAddressDialogVisible"
      width="60%"
    >
      <el-form
        :model="addAddressForm"
        :rules="addAddressFormRules"
        ref="addAddressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="pAddress">
          <el-cascader
            v-model="addAddressForm.pAddress"
            :options="cityData"
            :props="addAddressProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="addAddressForm.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="showAddressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框的区域 -->
    <el-dialog
      title="查看物流信息"
      :visible.sync="showLogisticsDialogVisible"
      width="60%"
    >
      <!-- 物流信息区域 -->
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in logisticsInformation"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  components: {},
  data() {
    return {
      // 查询信息对象
      queryinfo: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      // 订单列表数据
      ordersListData: [],
      // 订单总条数
      total: 0,
      // 添加地址对话框的显示与隐藏
      showAddressDialogVisible: false,
      // 添加地址表单数据
      addAddressForm: {
        pAddress: [],
        address: ''
      },
      // 添加地址表单的验证规则
      addAddressFormRules: {
        pAddress: [
          { required: true, message: '请选择省市区县地址', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请填写您的详细收货地址', trigger: 'blur' }
        ]
      },
      // 城市数据信息
      cityData,
      // 级联选择器的显示配置
      addAddressProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        expandTrigger: true
      },
      // 物流信息对话框的显示与隐藏
      showLogisticsDialogVisible: false,
      // 物流信息
      logisticsInformation: [],
      // timeline是否反向展示
      reverse: true
    }
  },
  created() {},
  mounted() {
    this.getOrdersListData()
  },
  computed: {},
  methods: {
    // 获取订单数据
    async getOrdersListData() {
      // 请求拿订单数据
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryinfo
      })
      if (res.meta.status !== 200) return this.$msg.error('订单数据获取失败')
      // 拿到订单数据
      this.$msg.success('订单数据获取成功')
      // 保存到data中
      this.ordersListData = res.data.goods
      this.total = res.data.total
    },
    // 页面订单条数变化
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getOrdersListData()
    },
    // 页码变化
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getOrdersListData()
    },
    // 搜索框清空
    inputEmpty() {
      this.getOrdersListData()
    },
    // 点击获取订单
    searchOrder() {
      this.getOrdersListData()
    },
    // 添加收货地址
    addAddress() {
      // 显示对话框
      this.showAddressDialogVisible = true
    },
    // 级联选择器选中
    handleChange(value) {
      this.addAddressForm.pAddress = value
    },
    // 添加收货地址对话框关闭
    addAddressDialogClosed() {
      // 表单数据清空
      this.$refs.addAddressFormRef.resetFields()
      // 将省市区/县级联选择器中的选中项数组置为空数组
      this.addAddressForm.pAddress.length = 0
    },
    // 查看物流信息
    async viewLogisticsInformation() {
      // 发送请求获取物流信息
      const { data: res } = await this.$axios.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
      // 拿到了物流信息数据
      this.$msg.success('获取到了物流信息')
      this.logisticsInformation = res.data
      // 展示对话框
      this.showLogisticsDialogVisible = true
    }
  },
  watch: {}
}
</script>
<style scoped>
.el-cascader {
  width: 100%;
}
</style>
