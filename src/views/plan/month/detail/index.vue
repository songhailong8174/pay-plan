<template>
  <div>
    <van-panel>
      <template #header>
        <div style="padding: 20px;text-align:center;font-weight:bold;font-size:1.4rem;">
          {{ monthData.year }}年 - {{ monthData.month }}月
          <van-tag round type="danger" style="float:right;" v-if="monthData.overSpend">超支</van-tag>
          <div style="font-size:1rem;">预算：{{ monthData.planAmount }} 元</div>
          <div style="font-size:1rem;">实际：<span :class="{'m-red': monthData.overSpend}">{{ monthData.amount }} 元</span></div>
        </div>
      </template>
    </van-panel>
    <van-cell
      v-for="(child, idx) in details"
      :key="idx"
      :border="false"
      center
      :title="child.name"
      :label="child.used">
        <template #default><span style="color:#323232;">{{ child.planAmount }}元</span></template>
    </van-cell>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      monthData: {},
      details: []
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    loadData () {
      const now = new Date()
      let [year, month] = [now.getFullYear(), (now.getMonth() + 1) + '']
      if (month.length < 2) month = '0' + month
      let yearQuery = new AV.Query('MonthPlans')
      let monthQuery = new AV.Query('MonthPlans')
      yearQuery.equalTo('year', year + '')
      monthQuery.equalTo('month', month)
      let query = AV.Query.and(yearQuery, monthQuery)
      query.first().then(data => {
        this.monthData = {...data.attributes}
        this.loadDetail(data)
      })
    },
    loadDetail (monthPlan) {
      let query = new AV.Query('MonthPlanDetail')
      query.equalTo('monthPlanId', monthPlan)
      query.find().then(data => {
        data.forEach(item => {
          this.details.push({...item.attributes})
        })
      })
    }
  }
}
</script>

<style scoped>
.m-red {
  color: red;
}
</style>
