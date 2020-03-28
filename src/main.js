// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import {
  Button,
  Form,
  Field,
  Toast,
  Tabbar,
  TabbarItem,
  Popup,
  Picker,
  Switch,
  Collapse,
  CollapseItem,
  SwipeCell,
  Overlay,
  Cell,
  NavBar,
  Loading,
  Icon,
  Panel,
  Tag
} from 'vant'
import global from './global'

Vue.use(Button)
Vue.use(Form)
Vue.use(Field)
Vue.use(Toast)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Popup)
Vue.use(Picker)
Vue.use(Switch)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(SwipeCell)
Vue.use(Overlay)
Vue.use(Cell)
Vue.use(NavBar)
Vue.use(Loading)
Vue.use(Icon)
Vue.use(Panel)
Vue.use(Tag)

Vue.use(global)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
