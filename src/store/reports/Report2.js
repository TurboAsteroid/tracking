import L from 'leaflet'

const Report2 = {
  state: {
    mapReport2: null,
    report2Driver: [],
    report2Data: null,
    report2: { track: null },
    report2OnMap: {
      trackOnMap: [],
      stopsOnMap: []
    }
  },
  getters: {
    report2Driver: state => { return state.report2Driver },
    report2Data: state => { return state.report2Data }
  },
  mutations: {
    report2Driver: (state, val) => { state.report2Driver = val },
    mapReport2: (state, val) => { state.mapReport2 = val },
    report2Data: (state, val) => {
      state.report2Data = val
    },
    report2OnMap: (state, val) => { state.report2OnMap = val },
    report2TrackOnMapPush: (state, val) => { state.report2OnMap.trackOnMap.push(val) }
  },
  actions: {
    initMapReport2 (ctx) {
      let m = L.map('report2map').setView([56.96105930170542, 60.57539042144521], 15)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      ctx.commit('mapReport2', m)
    },
    report2searchDriverLike (ctx, data) {
      this._vm.$socket.emitPreloader('report2searchDriverLike', data)
    },
    report2DriverTime (ctx, data) {
      this._vm.$socket.emitPreloader('report2DriverTime', data)
    },
    report2searchDriverDate (ctx, data) {
      this._vm.$socket.emitPreloader('report2searchDriverDate', data)
    },
    removeReport2OnMap (ctx) {
      for (let i = 0; i < ctx.state.report2OnMap.trackOnMap.length; i++) {
        ctx.state.mapReport2.removeLayer(ctx.state.report2OnMap.trackOnMap[i])
      }
      for (let j = 0; j < ctx.state.report2OnMap.stopsOnMap.length; j++) {
        ctx.state.mapReport2.removeLayer(ctx.state.report2OnMap.stopsOnMap[j])
      }
      ctx.commit('report2OnMap', {
        trackOnMap: [],
        stopsOnMap: []
      })
    },
    report2DrawReport (ctx, data) {
      ctx.dispatch('removeReport2OnMap')
      let keys = Object.keys(data.track)
      for (let i = 0; i < keys.length; i++) {
        let oneTrack = data.track[keys[i]]
        for (let i = 0; i < oneTrack.length; i++) {
          ctx.commit('report2TrackOnMapPush',
            L
              .polyline(oneTrack[i].latlngs, {color: oneTrack[i].color, sap: oneTrack[i].sap})
              .addTo(ctx.state.mapReport2)
          )
        }
      }
      for (let i = 0; i < data.stops.length; i++) {
        ctx.commit('report2TrackOnMapPush',
          L
            .marker([data.stops[i].latitude, data.stops[i].longitude],
              { title: data.stops[i].tmin + ' - ' + data.stops[i].tmax + '; Время стоянки: ' + data.stops[i].stopTime + ' с.' })
            .addTo(ctx.state.mapReport2)
        )
      }
    }
  }
}

export default Report2
