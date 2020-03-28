<template>
  <div>
    <van-nav-bar
      title="支出"
      right-text="添加"
      @click-right="openAdd"
    />
    <div></div>
    <van-overlay :show="isEdit" class-name="b-over">
      <div class="wrapper" @click.stop>
        <van-collapse accordion v-model="activeName">
          <van-collapse-item title="账单" size="large" name="01"></van-collapse-item>
        </van-collapse>
        <!--第二个折叠-->
      </div>
    </van-overlay>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isEdit: false,
      activeName: '01'
    }
  },
  methods: {
    openAdd () {
      this.isEdit = true
    }
  }
}
</script>

<style scoped>
.b-over {
  z-index: 2;
}
.wrapper {
  height: 100%;
  text-align: left;
  background-color: #fff;
}
</style>
