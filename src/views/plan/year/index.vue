<template>
  <div>
    <van-nav-bar
      title="年度计划"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <van-form @submit="onSubmit">
      <van-field
        readonly
        v-model="plan.planName"
        name="planName"
        label="计划名称"
        placeholder="计划名称"
      />
      <van-field
        type="number"
        v-model="plan.planAmount"
        name="planAmount"
        label="计划支出金额"
        placeholder="计划支出金额"
      />
      <div style="margin: 16px;">
        <van-button round block :disabled="saved" type="info" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      plan: {
        planYear: new Date().getFullYear() + '',
        planName: `${new Date().getFullYear()} - 支出计划`,
        planAmount: 0.0,
        blanceAmount: 0.0,
        amount: 0.0
      },
      saved: false,
      planId: ''
    }
  },
  methods: {
    onClickLeft () {
      this.$router.back()
    },
    onSubmit () {
      this.$toast.loading()
      let YearPlan = AV.Object.extend('YearPlans')
      let _plan = new YearPlan()
      Object.keys(this.plan).forEach(key => {
        _plan.set(key, key === 'planAmount' ? Number(this.plan[key]) : this.plan[key])
      })
      let acl = new AV.ACL()
      acl.setWriteAccess(AV.User.current(), true)
      acl.setReadAccess('*', true)
      _plan.setACL(acl)
      _plan.save().then(_result => {
        this.$toast.success('保存成功')
        this.saved = true
        this.planId = _result.id
      })
    }
  }
}
</script>

<style>
.wrapper {
  height: 100%;
  text-align: left;
  background-color: #fff;
  /* display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; */
}

.block {
  width: 120px;
  height: 120px;
  background-color: #fff;
}
</style>
