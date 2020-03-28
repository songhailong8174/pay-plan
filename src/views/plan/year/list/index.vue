<template>
  <div>
    <van-nav-bar
      title="年度计划"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <div>
      <template v-if="planList.length > 0">
        <van-swipe-cell v-for="(item, index) in planList" :key="index">
          <van-cell :title="item.planName" :value="item.planAmount" @click="itemClick(item.id, item.planName, item.planAmount)"></van-cell>
        </van-swipe-cell>
      </template>
      <template v-else>
        <div>
          <span>暂无计划,请先<a href="javascript:void(0)" @click="toAdd">添加</a>计划</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      planList: []
    }
  },
  created () {
    this.loadPlanList()
  },
  methods: {
    toAdd () {
      this.$router.push({
        path: '/year'
      })
    },
    loadPlanList () {
      let query = new AV.Query('YearPlans')
      query.find().then(list => {
        list.forEach(item => {
          let data = {}
          for (let key in item.attributes) {
            data[key] = item.attributes[key]
          }
          data.id = item.id
          this.planList.push(data)
        })
      })
    },
    itemClick (planId, planName, planAmount) {
      this.$router.push({
        path: '/plan/year/detail',
        query: {
          planId,
          planName,
          planAmount
        }
      })
    },
    onClickLeft () {
      this.$router.back()
    }
  }
}
</script>
