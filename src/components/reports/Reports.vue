<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- echars图标区域 -->
      <div id="main" style="width: 1000px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'

export default {
  components: {},
  data() {
    return {
      // 报表数据
      reportData: {}
    }
  },
  created() {},
  async mounted() {
    // 发送请求拿到报表的数据
    const { data: res } = await this.$axios.get('reports/type/1')
    this.reportData = res.data
    // console.log(this.reportData)
    // 进行echarts的相关配置
    var myChart = echarts.init(document.getElementById('main'))
    // 指定图表的配置项和数据
    let options = {
      title: {
        text: '用户来源'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#E9EEF3'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          boundaryGap: false
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ]
    }
    //  使用lodash进行两个对象数据的合并
    options = _.merge(this.reportData, options)

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(options)
  },
  computed: {},
  methods: {},
  watch: {}
}
</script>
<style scoped lang="less"></style>
