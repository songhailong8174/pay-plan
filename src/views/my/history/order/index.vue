<template>
  <div>
    <van-nav-bar
      title="历史订单"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    ></van-nav-bar>
    <div style="margin-top:60px;">
      <van-cell
        :value="curText"
        title="选择订单"
        size="large"
        is-link
        arrow-direction="down"
        @click="showPicker = true"
       />
      <van-popup v-model="showPicker" position="bottom">
        <van-picker
          show-toolbar title="订单"
          :columns="columns"
          @cancel="showPicker = false"
          @confirm="onConfirm">
          </van-picker>
      </van-popup>
    </div>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      showPicker: false,
      columns: [],
      orders: {},
      curId: '',
      curText: '',
      curOrder: {}
    }
  },
  created () {
    this.loadOrders()
  },
  methods: {
    loadOrders () {
      let query = new AV.Query('Orders')
      query.equalTo('sync', '0')
      query.ascending('orderDate')
      query.find().then(list => {
        this.buildList(list)
      })
    },
    buildList (list) {
      list.forEach(item => {
        this.orders[item.id] = item
        const attributes = item.attributes
        let obj = {
          id: item.id,
          text: `${attributes.orderDate} - ${attributes.marketName}`
        }
        this.columns.push(obj)
      })
    },
    onConfirm (value) {
      this.curId = value.id
      this.curText = value.text
      this.showPicker = false
      this.loadTrans(value.id)
    },
    loadTrans (orderId) {
      let query = new AV.Query('Transaction')
      query.equalTo('orderId', this.orders[orderId])
      query.find().then(list => {
        this.saveData(list)
      })
    },
    saveData (list) {
      this.$toast.loading('请稍后...')
      const dataList = this.buildDetails(list)
      AV.Object.saveAll(dataList).then(result => {
        this.updateOrder(result.length)
      })
    },
    updateOrder (len) {
      let Order = this.orders[this.curId]
      Order.set('sync', '1')
      Order.save().then(data => {
        this.$toast.success(`共同步${len}条数据`)
        this.reset()
      })
    },
    reset () {
      this.curId = ''
      this.loadOrders()
    },
    buildACL () {
      let acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(false)
      return acl
    },
    buildBill () {
      const orderAttr = this.orders[this.curId].attributes
      let Bill = new AV.Object('Bill')
      Bill.set('userId', AV.User.current())
      Bill.setACL(this.buildACL())
      Bill.set('date', orderAttr.orderDate)
      Bill.set('addrName', orderAttr.marketName)
      Bill.set('payType', orderAttr.paymentType)
      Bill.set('voucher', '小票')
      Bill.set('amount', orderAttr.amount)
      Bill.set('count', orderAttr.itemCount)
      Bill.set('remark', '')
      let _type = '购物'
      if (orderAttr.marketName.indexOf('燃气') > -1 || orderAttr.marketName.indexOf('物业') > -1) {
        _type = '日用'
      }
      Bill.set('type', _type)
      return Bill
    },
    buildDetails (transList) {
      const Bill = this.buildBill()
      const ACL = this.buildACL()
      const currentUser = AV.User.current()
      let detailList = []
      transList.forEach(trans => {
        const attributes = trans.attributes
        let BillDetail = new AV.Object('BillDetail')
        BillDetail.setACL(ACL)
        BillDetail.set('userId', currentUser)
        BillDetail.set('billId', Bill)
        BillDetail.set('itemName', attributes.itemName)
        BillDetail.set('quality', attributes.itemCount)
        BillDetail.set('price', attributes.price)
        BillDetail.set('amount', attributes.amount)
        BillDetail.set('cid1', attributes.cid1)
        BillDetail.set('cid2', attributes.cid2)
        BillDetail.set('cid3', attributes.cid3)
        BillDetail.set('cname1', attributes.cname1)
        BillDetail.set('cname2', attributes.cname2)
        BillDetail.set('cname3', attributes.cname3)
        detailList.push(BillDetail)
      })
      return detailList
    },
    onClickLeft () {
      this.$router.back()
    }
  }
}
</script>
