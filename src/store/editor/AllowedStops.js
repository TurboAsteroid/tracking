import { MessageBox, Message } from 'element-ui'
import S from '../index'
import L from 'leaflet'
import colors from '../../colors'
let randomer = require('../../randomer.js')
randomer = randomer.default.create()
const polygonAddEvents = function (polygon) {
  polygon.on('mouseover', function (ev) {
    ev.target.openPopup()
  })
  polygon.on('mouseout', function (ev) {
    ev.target.closePopup()
  })
  polygon.on('click', function (ev) {
    MessageBox.confirm('Место стоянки будет безвозвратно удалено. Продолжить?', 'Внимание', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      S.commit('allowedStops', [])
      L.DomEvent.stopPropagation(ev)
      ev.target.remove()
      S._vm.$socket.emit('allowedStopsRemove', { id: ev.target.options.id })
      const targetId = ev.target.options.id
      let ret = S.getters.allowedStopsPolygons
      for (let i = 0; i < ret.length; i++) {
        let id = ret[i].options.id
        if (targetId === id) {
          ret.splice(i, 1)
          break
        }
      }
      S.commit('allowedStopsPolygons', ret)
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Удаление отменено'
      })
    })
  })
  return polygon
}
const AllowedStops = {
  state: {
    allowedStops: [],
    allowedStopsPolygons: [],
    allowedStopsMap: null,
    allowedStopsAllowNew: false,
    allowedStopsNewName: ''
  },
  mutations: {
    allowedStopsNewName (state, val) { state.allowedStopsNewName = val },
    allowedStopsAllowNew (state, val) { state.allowedStopsAllowNew = val },
    allowedStops (state, val) { state.allowedStops = val },
    allowedStopsMap (state, val) { state.allowedStopsMap = val },
    allowedStopsPolygons (state, val) { state.allowedStopsPolygons = val },
    allowedStopsPolygonsAdd (state, val) { state.allowedStopsPolygons.push(val) },
    allowedStopsPolygonCreateAndAdd (state, val) {
      let polygon = L
        .polygon(JSON.parse(val.polygon_json), {
          id: val.id,
          color: val.color,
          name: val.name
        })
        .addTo(S.getters.allowedStopsMap)
      // polygon.enableEdit()
      polygonAddEvents(polygon)
      S.commit('allowedStopsPolygonsAdd', polygon)
    }
    // allowedStopsClearMap (state, val) { state.allowedStopsPolygons.forEach(it => { state.allowedStopsMap.removeLayer(it) }, this) }
  },
  actions: {
    StopsEnableEdit (ctx, targetid) { ctx.state.allowedStopsPolygons.forEach(it => { if (targetid === it.options.id) { it.enableEdit() } else { it.disableEdit() } }) },
    StopsDisableEdit (ctx) { ctx.state.allowedStopsPolygons.forEach(it => { it.disableEdit() }) },
    AllowedStopsLoad () { this._vm.$socket.emit('allowedStops') },
    initAllowedStopsMap (ctx) {
      let m = L.map('divAllowedStopsMapTag', { editable: true, zoomControl: false }).setView([56.96105930170542, 60.57539042144521], 16)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      m.on('click', function (ev) {
        if (ctx.state.allowedStopsAllowNew) {
          let nextId = 0
          for (let i = 0; i < ctx.state.allowedStopsPolygons.length; i++) {
            let it = ctx.state.allowedStopsPolygons[i]
            if (nextId < it.options.id) {
              nextId = it.options.id
            }
          }
          nextId++
          if (ctx.state.allowedStops.length === 0) {
            randomer.seed(nextId)
            let colorid = randomer(45)
            let polygon = L
              .polygon([ev.latlng], {
                id: nextId,
                color: colors[colorid],
                name: ctx.state.allowedStopsNewName
              })
              .addTo(ctx.state.allowedStopsMap)
            polygon.enableEdit()
            polygonAddEvents(polygon)
            ctx.commit('allowedStops', polygon)
          } else {
            ctx.state.allowedStops.disableEdit()
            ctx.state.allowedStops.addLatLng(ev.latlng)
            ctx.state.allowedStops.enableEdit()
          }
        }
      })
      ctx.commit('allowedStopsMap', m)
    },
    AllowedStopsSave (ctx) {
      if (typeof ctx.state.allowedStops === 'object') {
        if (Object.getPrototypeOf(ctx.state.allowedStops).toString() !== '') {
          if (ctx.state.allowedStops.getLatLngs()[0].length > 1) {
            ctx.state.allowedStops.disableEdit()
            ctx.commit('allowedStopsPolygonsAdd', ctx.state.allowedStops)
            ctx.commit('allowedStops', [])
            ctx.commit('allowedStopsNewName', '')
          }
        }
      }
      ctx.getters.allowedStopsPolygons.forEach(it => {
        let ll = it.getLatLngs()
        this._vm.$socket.emit('allowedStopsSave', { id: it.options.id, polygon_json: ll[0], color: it.options.color, name: it.options.name }) // здесь отличие дороги от полигона!
      }, this)
    }
    // AllowedStopsRemove (state, id) {
    //   this._vm.$socket.emit('allowedStopsRemove', { id: id })
    // },
    // AllowedStopsBack (state) {
    //   S.commit('allowedStopsClearMap')
    //   S.commit('allowedStopsPolygons', [])
    // }
  },
  getters: {
    allowedStops: state => { return state.allowedStops },
    allowedStopsMap: state => { return state.allowedStopsMap },
    allowedStopsPolygons: state => { return state.allowedStopsPolygons },
    allowedStopsAllowNew: state => { return state.allowedStopsAllowNew },
    allowedStopsNewName: state => { return state.allowedStopsNewName }
  }
}

export default AllowedStops
