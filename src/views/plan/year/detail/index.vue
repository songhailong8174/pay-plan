<template>
  <div>
    <van-nav-bar
      :title="planName"
      left-text="返回"
      right-text="添加"
      left-arrow
      fixed
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right v-if="!$isAdmin() || yearPlan2MonthPlan"></template>
    </van-nav-bar>
    <div style="margin-top:60px;">
      <template v-if="dataList.length === 0">
        暂无计划明细,请添加
      </template>
      <div style="padding: 10px;">
        <van-button v-if="!yearPlan2MonthPlan" type="warning" block @click="genMonthPlans">生成月度计划</van-button>
        <van-button v-if="yearPlan2MonthPlan" type="primary" block @click="toDetail">月度计划已生成</van-button>
      </div>
      <van-collapse v-model="activePanel" accordion>
        <van-collapse-item
          v-for="(item, index) in dataList"
          :key="index"
          :name="index">
          <template #title>
            {{ item.cname }} - 共 [<b>{{ item.children.length }}</b>] 项
            <span style="padding-left:20px;">合计：<span><b>{{ item.total }} 元</b></span></span>
          </template>
          <van-cell
            v-for="(child, idx) in item.children"
            :key="'child' + idx"
            :border="false"
            center
            :title="child.name"
            :label="child.remark">
              <template #default><span style="color:#323232;">{{ child.planAmount }}</span></template>
            </van-cell>
        </van-collapse-item>
      </van-collapse>
    </div>
     <van-overlay :show="isEdit" style="background-color:#fff;">
      <div class="wrapper" @click.stop>
        <van-form @submit="onSubmit">
          <van-field
            readonly
            v-model="detailData.used"
            name="used"
            label="用途"
            placeholder="用途"
            @click="showPicker = true"
          />
          <van-field
            readonly
            v-model="detailData.name"
            name="name"
            label="项目名称"
            placeholder="支出项名称"
          />
          <van-popup v-model="showPicker" position="bottom">
            <van-picker
              show-toolbar title="标题"
              :columns="columns"
              @cancel="showPicker = false"
              @confirm="onCheck" />
          </van-popup>
          <van-field
            type="number"
            v-model="detailData.planAmount"
            name="planAmount"
            label="计划支出金额"
            placeholder="计划支出金额"
          />
          <van-cell title="固定支出">
            <template #right-icon>
              <van-switch v-model="detailData.fixed" size="24" />
            </template>
          </van-cell>
          <van-cell title="拆分到月">
            <template #right-icon>
              <van-switch v-model="detailData.splitMonth" size="24" />
            </template>
          </van-cell>
          <van-field
            v-model="detailData.remark"
            rows="1"
            autosize
            label="备注"
            type="textarea"
            placeholder="请输入备注"
          />
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit">
              添加
            </van-button>
          </div>
          <div style="margin: 16px;">
            <van-button round block @click="isEdit = false" native-type="reset">
              取消
            </van-button>
          </div>
        </van-form>
      </div>
    </van-overlay>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      planId: this.$route.query.planId,
      planName: this.$route.query.planName,
      planAmount: this.$route.query.planAmount,
      yearPlan2MonthPlan: false,
      YearPlan: {},
      dataList: [],
      isEdit: false,
      showPicker: false,
      activePanel: '0',
      detailData: {
        name: '',
        cid: '',
        planAmount: 0,
        fixed: true,
        splitMonth: true,
        used: '',
        subId: '',
        remark: ''
      },
      columns: []
    }
  },
  created () {
    this.loadYearPlan()
    this.initCategories()
    this.loadList()
  },
  methods: {
    toDetail () {
      this.$router.push({
        path: '/month',
        query: {yearId: this.planId, year: this.YearPlan.attributes.planYear}
      })
    },
    loadYearPlan () {
      let query = new AV.Query('YearPlans')
      query.get(this.planId).then(data => {
        this.YearPlan = data
        this.yearPlan2MonthPlan = data.attributes.monthPlan
      })
    },
    genMonthPlans () {
      let planList = []
      Object.values(this.dataList).forEach(item => {
        planList.push.apply(planList, item.children.filter(child => child.splitMonth))
      })
      let totalAmount = 0
      let detailList = []
      planList.forEach(item => {
        const amount = (Number(item.planAmount) / 12).toFixed(2)
        totalAmount += Number(amount)
        const itemData = AV.Object.createWithoutData('YearPlanDetail', item.id)
        let detail = {
          cid: item.cid,
          used: item.used,
          subId: item.subId,
          name: item.name,
          fixed: item.fixed,
          planAmount: amount,
          yearDetailId: itemData
        }
        detailList.push(detail)
      })
      this.createPlan(totalAmount, detailList)
    },
    createPlan (amount, detailList) {
      let dataQueue = []
      let planSource = {
        year: this.planName.replace(' ', '').split('-')[0],
        planAmount: amount,
        amount: 0,
        blanceAmount: 0,
        initAmount: 0,
        overSpend: false
      }
      // const yearPlan = AV.Object.createWithoutData('YearPlans', this.planId)
      let acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setPublicWriteAccess(false)
      for (let month = 1; month <= 12; month++) {
        let Plan = {...planSource, month: (month + '').padStart(2, '0')}
        let _monthPlans = AV.Object('MonthPlans')
        for (let key in Plan) {
          _monthPlans.set(key, Plan[key])
        }
        _monthPlans.set('yearPlanId', this.YearPlan)
        _monthPlans.setACL(acl)
        // 构建月度明细
        this.buildMonthPlanDetail(dataQueue, _monthPlans, detailList, acl)
      }
      this.$toast.loading()
      AV.Object.saveAll(dataQueue).then(data => {
        this.updateYearStatus()
        this.$toast.success('生成成功')
      })
    },
    updateYearStatus () {
      this.YearPlan.set('monthPlan', true)
      this.YearPlan.save().then(data => {
        this.YearPlan.fetch().then(() => {
          console.log('更新成功')
          this.yearPlan2MonthPlan = this.YearPlan.attributes.monthPlan
        })
      })
      // let Plan = AV.Object.createWithoutData('YearPlans', )
    },
    buildMonthPlanDetail (dataQueue, MonthPlan, detailList, acl) {
      detailList.forEach(item => {
        let detailItem = {...item, monthPlanId: MonthPlan, yearPlanId: this.YearPlan}
        let _monthDetail = new AV.Object('MonthPlanDetail')
        for (let key in detailItem) {
          _monthDetail.set(key, detailItem[key])
        }
        _monthDetail.setACL(acl)
        dataQueue.push(_monthDetail)
      })
    },
    onClickLeft () {
      this.$router.back()
    },
    onClickRight () {
      this.isEdit = true
    },
    onCheck (value, ids) {
      const item = this.columns[ids[0]]
      const child = item.children[ids[1]]
      this.detailData.cid = item.id
      this.detailData.subId = child.id
      this.detailData.name = value[1]
      this.detailData.used = value[0]
      this.showPicker = false
    },
    loadList () {
      let query = new AV.Query('YearPlanDetail')
      query.find().then(data => {
        this.dataList = {}
        let totalObj = {}
        data.forEach(item => {
          const attributes = item.attributes
          const cid = attributes.cid
          let obj = {id: item.id}
          Object.keys(attributes).forEach(key => {
            obj[key] = attributes[key]
          })
          if (totalObj[cid] !== undefined) {
            let children = totalObj[cid].children
            totalObj[cid].total = totalObj[cid].total + Number(obj.planAmount)
            children.push(obj)
          } else {
            totalObj[cid] = {
              cid: cid,
              total: Number(obj.planAmount),
              cname: attributes.used,
              children: [obj]
            }
          }
          this.dataList = totalObj
        })
      })
    },
    onSubmit () {
      let _detail = {
        planId: this.YearPlan
      }
      Object.keys(this.detailData).forEach(key => {
        _detail[key] = this.detailData[key]
      })
      let YearPlanDetail = AV.Object.extend('YearPlanDetail')
      let _planDetail = new YearPlanDetail()
      Object.keys(_detail).forEach(key => {
        _planDetail.set(key, _detail[key])
      })
      let acl = new AV.ACL()
      acl.setPublicReadAccess(true)
      acl.setWriteAccess(AV.User.current(), true)
      _planDetail.setACL(acl)
      _planDetail.save().then(_result => {
        this.$toast.success('保存成功')
        this.isEdit = false
        this.resetForm()
        this.loadList()
      })
    },
    resetForm () {
      this.detailData.fixed = true
      this.detailData.splitMonth = true
      this.detailData.planAmount = 0
      const keys = ['name', 'cid', 'used', 'subId', 'remark']
      keys.forEach(key => {
        this.detailData[key] = ''
      })
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
        // eslint-disable-next-line no-unused-expressions
        branchArr.length > 0 ? father['children'] = branchArr : ''
        return father['parentId'] === '0'
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
}
</style>
