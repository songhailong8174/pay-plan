<template>
  <div>
    <van-form @submit="onSubmit">
      <van-field
        v-model="username"
        name="username"
        label="用户名"
        placeholder="用户名"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <van-field
        v-model="password"
        type="password"
        name="password"
        label="密码"
        placeholder="密码"
        :rules="[{ required: true, message: '请填写密码' }]"
      />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>

var AV = require('leancloud-storage')
export default {
  name: 'LoginView',
  data () {
    return {
      username: '',
      password: ''
    }
  },
  created () {},
  methods: {
    onSubmit (values) {
      console.log('submit', values)
      AV.User.logInWithMobilePhone(values.username, values.password).then(user => {
        // console.log(user)
        if (user.username !== '') {
          this.$router.push({
            path: '/home'
          })
        }
      }).catch(err => {
        console.log(err)
        this.$toast.fail('登录失败,用户名或密码错误')
      })
    }
  }
}
</script>
