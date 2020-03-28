<template>
  <div>
    <van-nav-bar
      :title="title"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    >
    </van-nav-bar>
    <van-collapse v-model="activePanel" accordion style="margin-top:50px;">
      <van-collapse-item
        v-for="(item, index) in dataList"
        :key="index"
        :name="index">
        <template #title>
          {{ item.month }}月
          <span style="padding-left:5px;">预算：<span><b>{{ item.planAmount }} 元</b></span></span>
          <span style="padding-left:5px;">实际：<span :class="{'p-red': item.overSpend}"><b>{{ item.amount }} 元</b></span></span>
        </template>
        <van-cell
          v-for="(child, idx) in item.children"
          :key="'child' + idx"
          :border="false"
          center
          :title="child.name"
          :label="child.used">
            <template #default><span style="color:#323232;">{{ child.planAmount }}元</span></template>
          </van-cell>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      year: this.$route.query.year,
      yearId: this.$route.query.yearId,
      title: `${this.$route.query.year}年月度计划`,
      activePanel: '',
      dataList: []
    }
  },
  created () {
    this.loadDetail()
  },
  methods: {
    loadList (detailObj) {
      let query = new AV.Query('MonthPlans')
      const yearPlan = AV.Object.createWithoutData('YearPlans', this.yearId)
      query.equalTo('yearPlanId', yearPlan)
      query.find().then(data => {
        data.forEach(item => {
          if (this.activePanel === '') {
            this.activePanel = item.id
          }
          const attributes = item.attributes
          let detail = {...attributes, children: detailObj[item.id].children || []}
          this.dataList.push(detail)
        })
      })
    },
    loadDetail () {
      const yearPlan = AV.Object.createWithoutData('YearPlans', this.yearId)
      let query = new AV.Query('MonthPlanDetail')
      query.equalTo('yearPlanId', yearPlan)
      query.find().then(data => {
        let detailObj = {}
        data.forEach(item => {
          const attributes = item.attributes
          const mId = attributes.monthPlanId.id
          let obj = {id: item.id}
          Object.keys(attributes).forEach(key => {
            obj[key] = attributes[key]
          })
          if (detailObj[mId] !== undefined) {
            let children = detailObj[mId].children
            children.push(obj)
          } else {
            detailObj[mId] = {
              children: [obj]
            }
          }
        })
        this.loadList(detailObj)
      })
    },
    onClickLeft () {
      this.$router.back()
    }
  }
}
</script>

<style>
.p-red {
  color: red;
}
</style>
