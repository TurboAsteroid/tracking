import S from './index'
import L from 'leaflet'
const polygonAddEvents = function (polygon) {
  polygon.on('mouseover', function (ev) {
    ev.target.openPopup()
  })
  polygon.on('mouseout', function (ev) {
    ev.target.closePopup()
  })
  polygon.on('click', function (ev) {
    S.commit('Elem', [])
    L.DomEvent.stopPropagation(ev)
    ev.target.remove()
    // до правки 24.10.2019 был просто emit
    this._vm.$socket.emitPreloader('ElemRemove', {id: ev.target.options.id})
    const targetId = ev.target.options.id
    var ret = S.getters.ElemPolygons
    for (var i = 0; i < ret.length; i++) {
      var id = ret[i].options.id
      if (targetId === id) {
        ret.splice(i, 1)
        break
      }
    }
    S.commit('ElemPolygons', ret)
  })
  return polygon
}
const Elem = {
  state: {
    Elem: [],
    ElemPolygons: [],
    ElemMap: null
  },
  mutations: {
    Elem (state, val) {
      state.Elem = val
    },
    ElemMap (state, val) {
      state.ElemMap = val
    },
    ElemPolygons (state, val) {
      state.ElemPolygons = val
    },
    ElemPolygonsAdd (state, val) {
      state.ElemPolygons.push(val)
    },
    ElemPolygonCreateAndAdd (state, val) {
      var polygon = L
        .polygon(JSON.parse(val.polygon_json), { id: val.id, color: '#2ECC40' })
        .addTo(S.getters.ElemMap)
      polygon.enableEdit()
      polygonAddEvents(polygon)
      S.commit('ElemPolygonsAdd', polygon)
    },
    ElemClearMap (state, val) {
      state.ElemPolygons.forEach(it => {
        state.ElemMap.removeLayer(it)
      }, this)
    }
  },
  actions: {
    ElemLoad (state) {
      // до правки 24.10.2019 был просто emit
      this._vm.$socket.emitPreloader('Elem')
    },
    initElemMap (state) {
      var m = L.map('divElemMapTag', { editable: true, zoomControl: false }).setView([56.96105930170542, 60.57539042144521], 16)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      m.on('click', function (ev) {
        var nextId = 0
        for (var i = 0; i < state.getters.ElemPolygons.length; i++) {
          var it = state.getters.ElemPolygons[i]
          if (nextId < it.options.id) {
            nextId = it.options.id
          }
        }
        nextId++
        if (state.getters.Elem.length === 0) {
          var polygon = L
            .polygon([ev.latlng], { id: nextId, color: '#FF4136' })
            .addTo(state.getters.ElemMap)
          polygon.enableEdit()
          polygonAddEvents(polygon)
          state.commit('Elem', polygon)
        } else {
          state.getters.Elem.disableEdit()
          state.getters.Elem.addLatLng(ev.latlng)
          state.getters.Elem.enableEdit()
        }
      })
      state.commit('ElemMap', m)
    },
    ElemSave (state) {
      if (state.getters.Elem.length !== 0) {
        state.getters.Elem.setStyle({color: '#0074D9'})
        state.commit('ElemPolygonsAdd', state.getters.Elem)
        state.commit('Elem', [])
      }
      state.getters.ElemPolygons.forEach(it => {
        it.disableEdit()
        var ll = it.getLatLngs()
        // до правки 24.10.2019 был просто emit
        this._vm.$socket.emitPreloader('ElemSave', {id: it.options.id, polygon_json: ll[0]})
        it.setStyle({color: '#2ECC40'})
        it.enableEdit()
      }, this)
    },
    ElemRemove (state, id) {
      // до правки 24.10.2019 был просто emit
      this._vm.$socket.emitPreloader('ElemRemove', {id: id})
    },
    ElemBack (state) {
      S.commit('ElemClearMap')
      S.commit('ElemPolygons', [])
    }
  },
  getters: {
    Elem: state => {
      return state.Elem
    },
    ElemMap: state => {
      return state.ElemMap
    },
    ElemPolygons: state => {
      return state.ElemPolygons
    }
  }
}

export default Elem
