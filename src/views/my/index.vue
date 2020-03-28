<template>
  <div>
    <div class="info" style="margin-top:60px;">
      <ul style="padding-left:20px;">
        <li>当前用户：{{ mobile }}</li>
      </ul>
    </div>
    <ul style="margin-top:30px;padding-left:20px;">
      <van-cell title="年度计划" size="large" @click="itemClick('/plan/year/list')">
      </van-cell>
      <!-- <li @click="itemClick('/plan/year/list')">年度计划</li> -->
    </ul>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      mobile: '',
      userName: ''
    }
  },
  created () {
    this.initUser()
  },
  methods: {
    initUser () {
      const user = AV.User.current()
      this.mobile = user.getMobilePhoneNumber()
      this.userName = user.getUsername()
    },
    itemClick (url) {
      this.$router.push({
        path: url
      })
    }
  }
}
</script>
