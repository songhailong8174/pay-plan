import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '../views/login'
import HomePage from '../views/home'
import YearPlanPage from '../views/plan/year'
import YearPlanList from '../views/plan/year/list'
import YearPlanDetail from '../views/plan/year/detail'
import MonthPlanPage from '../views/plan/month'
import MonthPlanDetail from '../views/plan/month/detail'
import MyPage from '../views/my'
import BillPage from '../views/bill'

Vue.use(Router)

export default new Router({
  routes: [
    {
      name: 'LoginPage',
      component: LoginPage,
      path: '/'
    },
    {
      name: 'HomePage',
      component: HomePage,
      path: '/home',
      children: [
        {
          name: 'BillPage',
          component: BillPage,
          path: '/home/bill'
        },
        {
          name: 'MonthPlanDetail',
          component: MonthPlanDetail,
          path: '/home/month'
        },
        {
          name: 'MyPage',
          component: MyPage,
          path: '/home/my'
        }
      ]
    },
    {
      name: 'YearPlanList',
      component: YearPlanList,
      path: '/plan/year/list'
    },
    {
      name: 'YearPlan',
      component: YearPlanPage,
      path: '/year'
    },
    {
      name: 'YearPlanDetail',
      component: YearPlanDetail,
      path: '/plan/year/detail'
    },
    {
      name: 'MonthPlan',
      component: MonthPlanPage,
      path: '/month'
    }
  ]
})
