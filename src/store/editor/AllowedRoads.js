import { MessageBox, Message } from 'element-ui'
import S from '../index'
import L from 'leaflet'
import colors from '../../colors'
var randomer = require('../../randomer.js')
randomer = randomer.default.create()
const polylineAddEvents = function (polyline) {
  polyline.on('mouseover', function (ev) {
    ev.target.openPopup()
  })
  polyline.on('mouseout', function (ev) {
    ev.target.closePopup()
  })
  polyline.on('click', function (ev) {
    MessageBox.confirm('Маршрут будет безвозвратно удален. Продолжить?', 'Внимание', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      S.commit('allowedRoads', [])
      L.DomEvent.stopPropagation(ev)
      ev.target.remove()
      S._vm.$socket.emit('allowedRoadsRemove', { id: ev.target.options.id })
      const targetId = ev.target.options.id
      var ret = S.getters.allowedRoadsPolylines
      for (var i = 0; i < ret.length; i++) {
        var id = ret[i].options.id
        if (targetId === id) {
          ret.splice(i, 1)
          break
        }
      }
      S.commit('allowedRoadsPolylines', ret)
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Удаление отменено'
      })
    })
  })
  return polyline
}
const AllowedRoads = {
  state: {
    allowedRoads: [],
    allowedRoadsPolylines: [],
    allowedRoadsMap: null,
    allowedRoadsAllowNew: false
  },
  mutations: {
    allowedRoadsAllowNew (state, val) { state.allowedRoadsAllowNew = val },
    allowedRoads (state, val) { state.allowedRoads = val },
    allowedRoadsMap (state, val) { state.allowedRoadsMap = val },
    allowedRoadsPolylines (state, val) { state.allowedRoadsPolylines = val },
    allowedRoadsPolylinesAdd (state, val) { state.allowedRoadsPolylines.push(val) },
    allowedRoadsPolylineCreateAndAdd (state, val) {
      var polyline = L
        .polyline(JSON.parse(val.polyline_json), {
          id: val.id,
          color: val.color,
          weight: 20,
          opacity: 1,
          smoothFactor: 1
        })
        .addTo(S.getters.allowedRoadsMap)
      polylineAddEvents(polyline)
      S.commit('allowedRoadsPolylinesAdd', polyline)
    }
  },
  actions: {
    RoadEnableEdit (ctx, targetid) { ctx.state.allowedRoadsPolylines.forEach(it => { if (targetid === it.options.id) { it.enableEdit() } else { it.disableEdit() } }) },
    RoadsDisableEdit (ctx) { ctx.state.allowedRoadsPolylines.forEach(it => { it.disableEdit() }) },
    AllowedRoadsLoad (ctx, val) { this._vm.$socket.emit('allowedRoads', val) },
    initAllowedRoadsMap (ctx) {
      var m = L.map('divAllowedRoadsMapTag', { editable: true, zoomControl: false }).setView([56.96105930170542, 60.57539042144521], 16)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      m.on('click', function (ev) {
        if (ctx.state.allowedRoadsAllowNew) {
          var nextId = 0
          for (var i = 0; i < ctx.state.allowedRoadsPolylines.length; i++) {
            var it = ctx.state.allowedRoadsPolylines[i]
            if (nextId < it.options.id) {
              nextId = it.options.id
            }
          }
          nextId++
          if (ctx.state.allowedRoads.length === 0) {
            randomer.seed(nextId)
            var colorid = randomer(45)
            var polyline = L
              .polyline([ev.latlng], {
                id: nextId,
                color: colors[colorid],
                weight: 20,
                opacity: 1,
                smoothFactor: 1
              })
              .addTo(ctx.state.allowedRoadsMap)
            polyline.enableEdit()
            polylineAddEvents(polyline)
            ctx.commit('allowedRoads', polyline)
          } else {
            ctx.state.allowedRoads.disableEdit()
            ctx.state.allowedRoads.addLatLng(ev.latlng)
            ctx.state.allowedRoads.enableEdit()
          }
        }
      })
      m.on('editable:vertex:click', ev => {
        L.DomEvent.stopPropagation(ev)
        if (ctx.state.allowedRoads._latlngs !== undefined) {
          if (ctx.state.allowedRoads._latlngs.length !== 1) {
            ev.sourceTarget.editor.deleteShapeAt(ev.latlng)
          } else {
            ev.sourceTarget.delete()
          }
        } else {
          ev.sourceTarget.editor.deleteShapeAt(ev.latlng)
        }
        S._vm.$socket.emit('allowedRoadsRemove', { id: ev.sourceTarget.editor.feature.options.id })
        const targetId = ev.sourceTarget.editor.feature.options.id
        var ret = S.getters.allowedRoadsPolylines
        for (var i = 0; i < ret.length; i++) {
          var id = ret[i].options.id
          if (targetId === id) {
            ret.splice(i, 1)
            break
          }
        }
        ctx.commit('allowedRoadsPolylines', ret)
      })
      ctx.commit('allowedRoadsMap', m)
    },
    AllowedRoadsSave (ctx) {
      if (typeof ctx.state.allowedRoads === 'object') {
        if (Object.getPrototypeOf(ctx.state.allowedRoads).toString() !== '') {
          if (ctx.state.allowedRoads._latlngs.length > 1) {
            ctx.state.allowedRoads.disableEdit()
            ctx.commit('allowedRoadsPolylinesAdd', ctx.state.allowedRoads)
            ctx.commit('allowedRoads', [])
          }
        }
      }
      ctx.getters.allowedRoadsPolylines.forEach(it => {
        var ll = it.getLatLngs()
        this._vm.$socket.emit('allowedRoadsSave', { id: it.options.id, polyline_json: ll, color: it.options.color }) // здесь отличие дороги от полигона!
      }, this)
    },
    AllowedRoadsRemove (state, id) { this._vm.$socket.emit('allowedRoadsRemove', { id: id }) }
  },
  getters: {
    allowedRoads: state => { return state.allowedRoads },
    allowedRoadsMap: state => { return state.allowedRoadsMap },
    allowedRoadsPolylines: state => { return state.allowedRoadsPolylines },
    allowedRoadsAllowNew: state => { return state.allowedRoadsAllowNew }
  }
}

export default AllowedRoads
