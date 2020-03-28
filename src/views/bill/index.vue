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
          <van-collapse-item title="账单" size="large" name="01">
            <van-cell title="消费日期" :value="billData.date" @click="showCalendar = true" is-link />
            <van-calendar
              title="消费日期"
              v-model="showCalendar"
              :show-confirm="false"
              :min-date="calendar.minDate"
              :max-date="calendar.maxDate"
              :default-date="calendar.maxDate"
              @confirm="calendarConfirm"
              color="#07c160" />
            <van-field
              readonly
              clickable
              label="消费类型"
              v-model="billData.type"
              placeholder="消费类型"
              input-align="right"
              @click="showTypePicker = true"
            />
            <van-popup v-model="showTypePicker" position="bottom">
              <van-picker
                show-toolbar
                :columns="typeList"
                @cancel="showTypePicker = false"
                @confirm="onTypeConfirm"
              />
            </van-popup>
            <van-field
              label="消费金额"
              :value="billData.amount"
              placeholder="消费金额"
              input-align="right"
            />
            <van-field
              title="number"
              label="消费数量"
              :value="billData.count"
              placeholder="消费数量"
              input-align="right"
            />
            <van-field
              label="消费场所"
              v-model="billData.addName"
              placeholder="消费场所"
              input-align="right"
            />
            <van-field
              readonly
              clickable
              label="支付方式"
              :value="billData.payType"
              placeholder="支付方式"
              @click="showPayPicker = true"
              input-align="right"
            />
            <van-popup v-model="showPayPicker" position="bottom">
              <van-picker
                show-toolbar
                :columns="payList"
                @cancel="showPayPicker = false"
                @confirm="onPayConfirm"
              />
            </van-popup>
            <van-field
              readonly
              clickable
              label="消费凭证"
              :value="billData.voucher"
              placeholder="消费凭证"
              @click="showVoucherPicker = true"
              input-align="right"
            />
            <van-popup v-model="showVoucherPicker" position="bottom">
              <van-picker
                show-toolbar
                :columns="voucherList"
                @cancel="showVoucherPicker = false"
                @confirm="onVoucherConfirm"
              />
            </van-popup>
            <van-field
            v-model="billData.remark"
            rows="1"
            autosize
            label="备注"
            type="textarea"
            placeholder="请输入备注"
            input-align="right"
          />
          </van-collapse-item>
          <!--第二个折叠-->
          <van-collapse-item title="明细" size="large" name="02">
            <!--表单-->
            <van-panel title="填写项">
              <van-field
                readonly
                v-model="used"
                name="used"
                label="用途"
                placeholder="用途"
                input-align="right"
                @click="showPicker = true"
              />
              <van-popup v-model="showPicker" position="bottom">
                <van-picker
                  show-toolbar title="标题"
                  :columns="columns"
                  @cancel="showPicker = false"
                  @confirm="onCheck" />
              </van-popup>
              <van-field
                v-model="itemData.itemName"
                label="名称"
                placeholder="名称"
                input-align="right"
              />
              <van-field
                type="number"
                v-model="itemData.quality"
                label="数量"
                placeholder="数量"
                input-align="right"
              />
              <van-field
                type="number"
                v-model="itemData.price"
                label="单价"
                placeholder="单价"
                input-align="right"
              />
              <van-field
                type="number"
                v-model="itemData.amount"
                label="金额"
                placeholder="金额"
                input-align="right"
              />
              <van-field
                v-model="itemData.remark"
                rows="1"
                autosize
                label="备注"
                type="textarea"
                placeholder="请输入备注"
                input-align="right"
              />
              <template #footer>
                <div style="text-align:right;">
                  <van-button size="small" type="primary" @click="onNext">下一个</van-button>
                </div>
              </template>
            </van-panel>
            <!--当前明细列表-->
          </van-collapse-item>
          <!--草稿-->
          <van-collapse-item size="large" name="03">
            <template #title>草稿 已添加 [{{ itemList.length }}] 项</template>
            <van-card
              v-for="(item, index) in itemList"
              :key="index"
              :num="item.quality"
              :title="item.itemName"
              :price="item.price"
              :desc="item.remark"
            >
              <template #tags>
                <van-tag plain type="danger">{{ item.cname1 }}</van-tag>
                <van-tag plain type="danger">{{ item.cname2 }}</van-tag>
                <van-tag plain type="danger">{{ item.cname3 }}</van-tag>
              </template>
              <template #footer>
                金额：<span style="color:red;font-weight:bold;">{{ item.amount }}</span> 元
              </template>
            </van-card>
          </van-collapse-item>
        </van-collapse>
        <van-button type="warning" block style="margin-top:60px;" @click="saveBill">保存账单(请填写完整)</van-button>
      </div>
    </van-overlay>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      isEdit: false,
      showPicker: false,
      showCalendar: false,
      showTypePicker: false,
      showPayPicker: false,
      showVoucherPicker: false,
      calendar: {
        minDate: new Date(2020, 0, 1),
        maxDate: new Date()
      },
      columns: [],
      typeList: ['购物', '餐饮', '娱乐', '日用', '社交'],
      payList: ['支付宝支付', '微信支付', '云闪付', '现金支付'],
      voucherList: ['小票', '账单', '实物', '无'],
      activeName: '01',
      used: '',
      billData: {
        date: this.formatDate(new Date()),
        type: '',
        amount: 0,
        count: 1,
        addName: '',
        payType: '',
        voucher: '',
        remark: ''
      },
      itemList: [],
      itemData: {
        itemName: '',
        quality: 1,
        price: 1,
        amount: 0,
        remark: '',
        cid1: '',
        cid2: '',
        cid3: '',
        cname1: '',
        cname2: '',
        cname3: ''
      }
    }
  },
  created () {
    this.initCategories()
  },
  methods: {
    saveBill () {
      this.$toast.loading('请稍后...')
      let Bill = new AV.Object('Bill')
      Object.keys(this.billData).forEach(key => {
        Bill.set(key, this.billData[key])
      })
      Bill.setACL(this.buildACL())
      Bill.set('userId', AV.User.current())
      AV.Object.saveAll(this.buildDetail(Bill)).then(list => {
        this.$toast.success('保存成功')
      })
    },
    buildDetail (Bill) {
      let list = []
      this.itemList.forEach(item => {
        let BillDetail = new AV.Object('BillDetail')
        Object.keys(item).forEach(key => {
          BillDetail.set(key, item[key])
        })
        BillDetail.set('userId', AV.User.current())
        BillDetail.set('billId', Bill)
        BillDetail.setACL(this.buildACL())
        list.push(BillDetail)
      })
      return list
    },
    buildACL () {
      let acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(false)
      return acl
    },
    onNext () {
      this.itemList.push({...this.itemData})
      this.resetItem()
    },
    reset () {
      this.isEdit = false
      Object.keys(this.billData).forEach(key => {
        if (key === 'date') {
          this.billData[key] = this.formatDate(new Date())
        } else if (key === 'count') {
          this.billData[key] = 1
        } else if (key === 'amount') {
          this.billData[key] = 0
        } else {
          this.billData[key] = ''
        }
      })
      this.resetItem()
      this.itemList = []
    },
    resetItem () {
      this.used = ''
      Object.keys(this.itemData).forEach(key => {
        if (['quality', 'price', 'amount'].includes(key)) {
          this.itemData[key] = key !== 'amount' ? 1 : 0
        } else {
          this.itemData[key] = ''
        }
      })
    },
    formatDate (date) {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    },
    calendarConfirm (date) {
      this.billData.date = this.formatDate(date)
      this.showCalendar = false
    },
    onTypeConfirm (value) {
      this.billData.type = value
      this.showTypePicker = false
    },
    onPayConfirm (value) {
      this.billData.payType = value
      this.showPayPicker = false
    },
    onVoucherConfirm (value) {
      this.billData.voucher = value
      this.showVoucherPicker = false
    },
    openAdd () {
      this.isEdit = true
    },
    onCheck (value, ids) {
      this.used = value.join(',')
      this.itemData.cname1 = value[0]
      this.itemData.cname2 = value[1]
      this.itemData.cname3 = value[2]
      let item = this.columns[ids[0]]
      this.itemData.cid1 = item.id
      let child = item.children[ids[1]]
      this.itemData.cid2 = child.id
      if (child.children.length === 0) {
        this.itemData.cid3 = '-1'
      } else {
        let _child = child.children[ids[2]]
        this.itemData.cid3 = _child.id
      }
      this.showPicker = false
    },
    initCategories () {
      let query = new AV.Query('category')
      query.find().then(data => {
        let list = []
        data.forEach(item => {
          list.push({
            id: item.id,
            text: item.attributes.c_name,
            parentId: item.attributes.c_parent
          })
        })
        this.columns = this.treeData(list)
      })
    },
    treeData (data) {
      let cloneData = JSON.parse(JSON.stringify(data))
      return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => father['id'] === child['parentId'])
        father['children'] = branchArr.length > 0 ? branchArr : [{id: '-1', text: '所有'}]
        return father['parentId'] === '0'
      })
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
