<template>
  <div>
    <van-nav-bar
      title="历史数据"
      left-text="返回"
      right-text="保存"
      left-arrow
      fixed
      @click-left="onClickLeft"
      @click-right="onClickRight"
    ></van-nav-bar>
    <div style="margin-top:60px;">
      <van-card
        v-for="(item, index) in list"
        :key="index"
        :num="item.attributes.itemCount"
        :title="item.attributes.itemName"
        :price="item.attributes.price"
      >
        <template #tags>
          <van-tag plain type="danger">{{ item.attributes.cname1 }}</van-tag>
          <van-tag plain type="danger">{{ item.attributes.cname2 }}</van-tag>
          <van-tag plain type="danger">{{ item.attributes.cname3 }}</van-tag>
        </template>
        <template #footer>
          <van-button type="primary" size="small" @click="setCategory(index)">设置分类</van-button>
          金额：<span style="color:red;font-weight:bold;">{{ item.attributes.amount }}</span> 元
        </template>
      </van-card>
    </div>
    <van-popup v-model="showPicker" position="bottom">
      <van-picker
        show-toolbar title="标题"
        :columns="columns"
        @cancel="showPicker = false"
        @confirm="onCheck" />
    </van-popup>
  </div>
</template>

<script>
const AV = require('leancloud-storage')
export default {
  data () {
    return {
      showPicker: false,
      columns: [],
      list: [],
      currentIndex: -1
    }
  },
  created () {
    this.loadList()
    this.initCategories()
  },
  methods: {
    onClickRight () {
      this.$toast.loading('请稍后...')
      AV.Object.saveAll(this.list).then(result => {
        this.$toast.success('已更新' + result.length + '条')
      })
    },
    setCategory (index) {
      this.currentIndex = index
      this.showPicker = true
    },
    loadList () {
      let query = new AV.Query('Transaction')
      query.limit(10)
      query.equalTo('cid1', ' ')
      query.find().then(list => {
        this.list = list
      })
    },
    onCheck (value, ids) {
      let data = this.list[this.currentIndex]
      let item = this.columns[ids[0]]
      data.set('cid1', item.id)
      data.set('cname1', item.text)
      // this.itemData.cid1 = item.id
      let child = item.children[ids[1]]
      data.set('cid2', child.id)
      data.set('cname2', child.text)
      data.set('cname3', value[2])
      // this.itemData.cid2 = child.id
      if (child.children.length === 0) {
        data.set('cid3', '-1')
        // this.itemData.cid3 = '-1'
      } else {
        let _child = child.children[ids[2]]
        data.set('cid3', _child.id)
        // this.itemData.cid3 = _child.id
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
    },
    onClickLeft () {
      this.$router.back()
    }
  }
}
</script>
