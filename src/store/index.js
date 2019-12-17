import Vue from 'vue'
import Vuex from 'vuex'
import L from 'leaflet'
import AllowedStops from './editor/AllowedStops'
import AllowedRoads from './editor/AllowedRoads'
import NotificationIfDenyStop from './notifications/NotificationIfDenyStop'
import NotificationIfDenyRoad from './notifications/NotificationIfDenyRoad'
import Report1 from './reports/Report1'
import Report2 from './reports/Report2'
import Report3Store from '../components/monitor/report3/report3Store'
import reportByName from '../components/monitor/reportByName/reportByName'
import SelectedDevice from './SelectedDevice'
import Elem from './Elem'
import SapDocs from './SapDocs'
import Devices from './Devices'
import CurrentInfo from './CurrentInfo'
import AttachRoadsList from './AttachRoadsList'
import connectStore from '../components/connect/connectStore'
import logStore from '../components/monitor/log/logStore'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    reportByName,
    AllowedStops,
    AllowedRoads,
    NotificationIfDenyStop,
    NotificationIfDenyRoad,
    Report1,
    SelectedDevice,
    Elem,
    SapDocs,
    Report2,
    Devices,
    CurrentInfo,
    AttachRoadsList,
    connectStore,
    Report3Store,
    logStore
  },
  state: {
    map: null,
    devicesOnMap: [],
    settings: {
      speedLimit: 20
    },
    iconChecked: L.icon({
      iconUrl: '/static/images/marker-icon-red.png',
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      iconAnchor: [12, 42]
    }),
    iconUnchecked: L.icon({
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    })
  },

  // ASYNC
  actions: {
    initMap (state) {
      var m = L.map('divmap').setView([56.96105930170542, 60.57539042144521], 15)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      state.commit('map', m)
    },
    drawDevices (ctx, params) {
      var devices = params.devices
      for (var i = 0; i < ctx.getters.devicesOnMap.length; i++) {
        ctx.getters.map.removeLayer(ctx.getters.devicesOnMap[i])
      }
      ctx.commit('devicesOnMap', [])
      for (i = 0; i < devices.length; i++) {
        if (ctx.state.SelectedDevice.pair.id === devices[i].deviceid && ctx.state.SelectedDevice.pair.sap === devices[i].sap) {
          ctx.commit('devicesOnMapPush',
            L.marker([devices[i].latitude, devices[i].longitude], devices[i])
              .addTo(ctx.getters.map)
              .bindTooltip('Водитель: ' + devices[i].driver + ' Скорость: ' + parseInt(devices[i].speed))
              .on('click', function (e) {
                ctx.commit('setPair', {id: e.target.options.deviceid, sap: e.target.options.sap})
              })
              .setIcon(ctx.getters.iconChecked)
          )
          // здесь описать добавление отрезка к треку
          ctx.dispatch('drawNextLineTrack', devices[i])
        } else {
          ctx.commit('devicesOnMapPush',
            L.marker([devices[i].latitude, devices[i].longitude], devices[i])
              .addTo(ctx.getters.map)
              .bindTooltip('Водитель: ' + devices[i].driver + ' Скорость: ' + parseInt(devices[i].speed))
              .on('click', function (e) {
                ctx.commit('setPair', {id: e.target.options.deviceid, sap: e.target.options.sap})
              })
              .setIcon(ctx.getters.iconUnchecked)
          )
        }
      }
    },
    unattachDeviceFromSapDoc (state, deviceid) {
      this._vm.$socket.emit('unattach', deviceid)
    }
  },

  // NOT ASYNC
  mutations: {
    map (state, val) {
      state.map = val
    },
    devicesOnMapPush (state, val) {
      state.devicesOnMap.push(val)
    },
    devicesOnMap (state, val) {
      state.devicesOnMap = val
    },
    currentTrackOnMapPush (state, val) {
      state.currentTrackOnMap.push(val)
    },
    currentTrackOnMap (state, val) {
      state.currentTrackOnMap = val
    },
    settings (state, val) {
      state.settings = val
    },
    settingsSpeedLimit (state, val) {
      state.settings.speedLimit = val
    }
  },

  getters: {
    logStore: state => {
      return state.logStore
    },
    connectStore: state => {
      return state.connectStore
    }, // экспортируем модуль для использования в сокетах с namespaced
    map: state => {
      return state.map
    },
    devicesOnMap: state => {
      return state.devicesOnMap
    },
    settings: state => {
      return state.settings
    },
    iconChecked: state => {
      return state.iconChecked
    },
    iconUnchecked: state => {
      return state.iconUnchecked
    }
  }
})
export default store
