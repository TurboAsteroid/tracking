import 'leaflet/dist/leaflet.css'
import io from 'socket.io-client'
import M from 'moment'
import mainSocket from '@/mainSocket'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import lang from 'element-ui/lib/locale/lang/ru-RU'
import locale from 'element-ui/lib/locale'
import App from '@/App'
import router from '@/router'
import L from 'leaflet'
import store from '@/store'
import connectSocket from './components/connect/connectSocket'
import report3Socket from './components/monitor/report3/report3Socket'
import logSocket from './components/monitor/log/logSocket'
import LE from 'leaflet-editable'
// для новой версии
Vue.prototype.$l = L
Vue.prototype.$app_version = 0.1
//
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

Vue.use(LE)
locale.use(lang)
Vue.use(ElementUI)
Vue.config.productionTip = false

// eslint-disable-next-line
String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement)
}
// eslint-disable-next-line
Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length)
  this.length = from < 0 ? this.length + from : from
  return this.push.apply(this, rest)
}

const sockets = Object.assign({}, connectSocket, report3Socket, logSocket, mainSocket)
Vue.prototype.$socket = io('http://' + window.location.hostname + ':8888')
Vue.prototype.$socket.preloaderArray = []
Vue.prototype.$socket.emitPreloader = (emitName, data) => {
  Vue.prototype.$socket.loading = ElementUI.Loading.service({
    lock: true,
    text: 'Загрузка'
  })
  Vue.prototype.$socket.preloaderArray.push(emitName)
  Vue.prototype.$socket.emit(emitName, data)
  console.log(`${M().format('HH:mm:ss')} ОТПРАВЛЕНО ${emitName}`)
}
Vue.prototype.$config = {
  api: 'http://' + window.location.hostname + ':8888'
}


const keys = Object.keys(sockets)
for (let i = 0; i < keys.length; i++) {
  Vue.prototype.$socket.on(keys[i], async (res) => {
    await sockets[keys[i]](res)
    console.log(`${M().format('HH:mm:ss')} ПРИШЛО ${keys[i]}`)
    if (Vue.prototype.$socket.loading !== undefined &&
        Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > -1) {
      Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
      if (Vue.prototype.$socket.preloaderArray.length === 0) {
        Vue.prototype.$socket.loading.close()
      }
    }
  })
}

// Vue.prototype.$socket.byTimer = []
// const keys = Object.keys(sockets)
// for (let i = 0; i < keys.length; i++) {
//   Vue.prototype.$socket.on(keys[i], async (res) => {
//     await sockets[keys[i]](res)
//     console.log(`${M().format('HH:mm:ss')} ПРИШЛО ${keys[i]}`)
//     if (keys[i] === 'move' || keys[i] === 'devices' || keys[i] === 'sapDocs') {
//       while (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > -1) {
//         console.log(`del ${keys[i]}`)
//         Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//       }
//       console.warn(`${keys[i]} emit run ${Vue.prototype.$socket.preloaderArray.indexOf(keys[i])}`)
//       if (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) < 0 && Vue.prototype.$socket.byTimer.indexOf(keys[i]) < 0) {
//         Vue.prototype.$socket.byTimer.push(keys[i])
//       // if (Vue.prototype.$socket.preloaderArray.indexOf(keys[i])) {
//         setInterval(() => Vue.prototype.$socket.emit(`${keys[i]}`), 3000)
//       }
//     }
//     console.log(Vue.prototype.$socket.preloaderArray)
//     if (Vue.prototype.$socket.loading !== undefined) {
//       Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//       if (Vue.prototype.$socket.preloaderArray.length === 0) {
//         Vue.prototype.$socket.loading.close()
//       }
//     }
//   })
// }



// const keys = Object.keys(sockets)
// for (let i = 0; i < keys.length; i++) {
//   Vue.prototype.$socket.on(keys[i], async (res) => {
//     await sockets[keys[i]](res)
//     // if (keys[i] === 'move') {
//     //   console.warn('move emit run')
//     //   console.log(Vue.prototype.$socket.preloaderArray)
//     //   while (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > 0) {
//     //     Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//     //   }
//     //   if (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) < 0) {
//     //     setTimeout(() => Vue.prototype.$socket.emit('move'), 1000)
//     //   }
//     // }
//     // if (keys[i] === 'devices') {
//     //   console.warn('devices emit run')
//     //   console.log(Vue.prototype.$socket.preloaderArray)
//     //   while (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > 0) {
//     //     Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//     //   }
//     //   if (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) < 0) {
//     //     setTimeout(() => Vue.prototype.$socket.emit('devices'), 1000)
//     //   }
//     // }
//     // if (keys[i] === 'sapDocs') {
//     //   console.warn('sapDocs emit run')
//     //   console.log(Vue.prototype.$socket.preloaderArray)
//     //   while (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > 0) {
//     //     Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//     //   }
//     //   if (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) < 0) {
//     //     setTimeout(() => Vue.prototype.$socket.emit('sapDocs'), 1000)
//     //   }
//     // }
//     if (Vue.prototype.$socket.preloaderArray.length > 0) {
//       console.log(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]))
//       while (Vue.prototype.$socket.preloaderArray.indexOf(keys[i]) > 0) {
//         Vue.prototype.$socket.preloaderArray.splice(Vue.prototype.$socket.preloaderArray.indexOf(keys[i]), 1)
//       }
//       if (Vue.prototype.$socket.preloaderArray.length === 0) {
//         Vue.prototype.$socket.loading.close()
//       }
//     }
//     console.log(`${Date()} с сервера ПРИШЛО ${keys[i]}`)
//     console.log(Vue.prototype.$socket.preloaderArray)
//   })
// }

const initialStateCopy = Object.assign({}, store.state)
Vue.prototype.$resetState = function () {
  store.replaceState(initialStateCopy)
}

// Не удалять! для страницы логина!!!
// router.beforeEach((to, from, next) => {
//   let role = localStorage.getItem('role')
//   if (role === null) {
//     localStorage.setItem('role', '-1')
//   }
//   if (role === '-1' && to.fullPath === '/login') {
//     // это мы пришли в '/login'
//     next()
//   } else if (role === '-1') {
//     // это мы пришли хз куда и нам нет доступа никуда
//     next('/login')
//   } else {
//     // это мы пришли хз куда и нам куда-то есть доступ
//     next()
//   }
// })

/* eslint-disable */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
