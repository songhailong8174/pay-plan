<template>
  <div>
    <router-view />
    <van-tabbar route>
      <van-tabbar-item replace to="/home/bill" icon="search">
        支出
      </van-tabbar-item>
      <van-tabbar-item replace to="/home/month" icon="search">
        月计划
      </van-tabbar-item>
      <van-tabbar-item replace to="/home/my" icon="home-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {

}
</script>
