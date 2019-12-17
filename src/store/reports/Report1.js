import L from 'leaflet'

const Report1 = {
  state: {
    mapReport: null,
    reportDocs: [],
    report: {
      sap: -1,
      date1: -1,
      date2: -1,
      track: [],
      stops: [],
      info: [],
      criticalspeed: -1
    },
    reportOnMap: {
      trackOnMap: [],
      stopsOnMap: []
    }
  },

  // ASYNC
  actions: {
    initMapReport (state) {
      let m = L.map('reportmap').setView([56.96105930170542, 60.57539042144521], 15)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      state.commit('mapReport', m)
    },
    searchReportDocs (state, data) {
      this._vm.$socket.emitPreloader('searchReportDocs', data)
    },
    loadReport1 (ctx) {
      this._vm.$socket.emitPreloader('loadReport1', ctx.state.report)
    },
    removeReportOnMap (state) {
      for (let i = 0; i < state.getters.reportTrackOnMap.length; i++) {
        state.getters.mapReport.removeLayer(state.getters.reportTrackOnMap[i])
      }
      state.commit('reportTrackOnMap', [])
      for (let j = 0; j < state.getters.reportStopsOnMap.length; j++) {
        state.getters.mapReport.removeLayer(state.getters.reportStopsOnMap[j])
      }
      state.commit('reportStopsOnMap', [])
    },
    drawReport (ctx) {
      const stops = ctx.state.report.stops
      const track = ctx.state.report.track
      ctx.dispatch('removeReportOnMap')
      for (let i = 0; i < track.length; i++) {
        // currentTrack[i] = { latlngs: [[x1, y1], [x2, y2]], color: red/blue }
        ctx.commit('reportTrackOnMapPush',
          L
            .polyline(track[i].latlngs, { color: track[i].color })
            .addTo(ctx.state.mapReport)
        )
      }
      for (let j = 0; j < stops.length; j++) {
        // currentStops[j] = { latitude, longitude, minT_lt, maxT_lt, minT_lg, maxT_lg }
        ctx.commit('reportStopsOnMapPush',
          L
            .marker([stops[j].latitude, stops[j].longitude], { title: stops[j].tmin + ' - ' + stops[j].tmax + '; Время стоянки: ' + stops[j].stopTime + ' с.' })
            .addTo(ctx.state.mapReport)
        )
      }
    }
  },

  // NOT ASYNC
  mutations: {
    mapReport (state, val) {
      state.mapReport = val
    },
    reportDocs (state, val) {
      state.reportDocs = val
    },
    report (state, val) {
      state.report = val
    },
    reportTrackOnMapPush (state, val) {
      state.reportOnMap.trackOnMap.push(val)
    },
    reportTrackOnMap (state, val) {
      state.reportOnMap.trackOnMap = val
    },
    reportStopsOnMapPush (state, val) {
      state.reportOnMap.stopsOnMap.push(val)
    },
    reportStopsOnMap (state, val) {
      state.reportOnMap.stopsOnMap = val
    }
  },

  getters: {
    reportDocs: state => {
      return state.reportDocs
    },
    report: state => {
      return state.report
    },
    reportTrackOnMap: state => {
      return state.reportOnMap.trackOnMap
    },
    reportStopsOnMap: state => {
      return state.reportOnMap.stopsOnMap
    },
    mapReport: state => {
      return state.mapReport
    }
  }
}
export default Report1
