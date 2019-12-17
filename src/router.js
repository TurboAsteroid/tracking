import Vue from 'vue'
import Router from 'vue-router'
import monitor from './components/monitor/index'
import Report1 from './components/monitor/report1/Index'
import Page404 from './components/Page404'
import reportByName from './components/monitor/reportByName/reportByName.vue' // существует два файла с таким именем, поэтому надо точно указать имя и расширение
import DateTime from './components/monitor/report1/DateTime'
import AllowedStops from './components/editor/AllowedStops'
import Elem from './components/Elem'
import Report2 from './components/monitor/report2/Index'
import DriverDT from './components/monitor/report2/DriverDT'
import connect from './components/connect/index'
import index from './components/index'
import login from './components/login'
import Report3 from './components/monitor/report3/index'
import log from './components/monitor/log/index'
import logCard from './components/monitor/log/logCard'
import pathfinder from './components/pathfinder/pathfinder'
import pathfinderEditor from './components/pathfinder/pathfinderEditor'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/monitor',
      name: 'monitor',
      component: monitor,
      children: [
        {
          path: 'log',
          name: 'log',
          component: log,
          children: [
            {
              path: ':logCardNumber',
              name: 'logCard',
              component: logCard
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/cu',
      name: 'connect',
      component: connect
    },
    {
      path: '/report3',
      name: 'Report3',
      component: Report3
    },
    {
      path: '/report1',
      name: 'Report1',
      component: Report1,
      children: [
        {
          path: ':DOKNR/:date1/:date2',
          component: DateTime
        }
      ]
    },
    {
      path: '/AllowedStops',
      name: 'AllowedStops',
      component: AllowedStops
    },
    {
      path: '/elem',
      name: 'Elem',
      component: Elem
    },
    {
      path: '/Report2',
      name: 'Report2',
      component: Report2,
      children: [
        {
          path: ':NAME_DRVR/:date1/:date2',
          component: DriverDT
        }
      ]
    },
    {
      path: '/reportByName',
      name: 'reportByName',
      component: reportByName
    },
    {
      path: '/pathfinder/',
      name: 'pathfinder',
      component: pathfinder
    },
    {
      path: '/pathfinder/pathfinderEditor',
      name: 'pathfinderEditor',
      component: pathfinderEditor
    },
    {
      path: '*',
      name: 'Page404',
      component: Page404
    }
  ]
})
