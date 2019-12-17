import L from 'leaflet'
import S from './index'
const SelectedDevice = {
  state: {
    currentTrackOnMap: [],
    currentAllowedRoad: [],
    currentAllowedStops: [],
    pair: {
      id: -1,
      sap: -1
    }
  },
  actions: {
    drawCurrentTrack (state, currentTrack) {
      for (var i = 0; i < state.getters.currentTrackOnMap.length; i++) {
        state.getters.map.removeLayer(state.getters.currentTrackOnMap[i])
      }
      state.commit('currentTrackOnMap', [])
      for (i = 0; i < currentTrack.length; i++) {
        // currentTrack[i] = { latlngs: [[x1, y1], [x2, y2]], color: red/blue }
        state.commit('currentTrackOnMapPush',
          L
            .polyline(currentTrack[i].latlngs, { color: currentTrack[i].color, weight: 2 })
            .addTo(state.getters.map)
        )
      }
    },
    drawCurrentAllowedRoad: (ctx, currentAllowedRoad) => {
      S.getters.map.removeLayer(ctx.state.currentAllowedRoad)
      ctx.commit('currentAllowedRoad',
        L
          .polyline(JSON.parse(currentAllowedRoad.polyline_json), {
            id: currentAllowedRoad.id,
            color: currentAllowedRoad.color,
            weight: 20,
            opacity: 1,
            smoothFactor: 1 })
          .addTo(S.getters.map)
      )
    },
    drawCurrentAllowedStops: (ctx, currentAllowedStops) => {
      let currentAllowedStopsOnMap = []
      for (let i = 0; i < currentAllowedStops.length; i++) {
        currentAllowedStopsOnMap.push(L
          .polygon(JSON.parse(currentAllowedStops[i].polygon_json), {
            id: currentAllowedStops[i].id,
            deviceid: currentAllowedStops[i].deviceid,
            color: '#2ECC40',
            weight: 1,
            opacity: 1,
            smoothFactor: 1 })
          .bindPopup(currentAllowedStops[i].name)
          .addTo(S.getters.map)
        )
      }
      ctx.commit('currentAllowedStops', currentAllowedStopsOnMap)
    },
    clearCurrentTrack (ctx) {
      for (let i = 0; i < ctx.state.currentTrackOnMap.length; i++) {
        S.getters.map.removeLayer(ctx.state.currentTrackOnMap[i])
      }
      for (let i = 0; i < ctx.state.currentAllowedStops.length; i++) {
        S.getters.map.removeLayer(ctx.state.currentAllowedStops[i])
      }
      // S.getters.map.removeLayer(ctx.state.currentAllowedRoad)
      ctx.commit('currentTrackOnMap', [])
      ctx.commit('currentAllowedRoad', [])
      ctx.commit('currentAllowedStops', [])
    },
    drawNextLineTrack (ctx, val) {
      // val = { latitude, longitude, speed}
      if (val.speed > 0) {
        const startPoint = ctx.state.currentTrackOnMap[ctx.state.currentTrackOnMap.length - 1]
        if (typeof startPoint === 'object' && startPoint !== null) {
          var color = 'green'
          if (S.getters.settings.speedLimit > val.speed) {
            color = '#0074D9' // 'blue'
          } else {
            color = '#FF4136' // 'red'
          }

          ctx.commit('currentTrackOnMapPush',
            L
              .polyline([startPoint._latlngs[1], [val.latitude, val.longitude]], { color: color })
              .addTo(ctx.getters.map)
          )
        }
      }
    }
  },
  mutations: {
    setPair (state, val) { state.pair = val },
    currentTrackOnMapPush (state, val) { state.currentTrackOnMap.push(val) },
    currentTrackOnMap (state, val) { state.currentTrackOnMap = val },
    currentAllowedRoad (state, val) { state.currentAllowedRoad = val },
    currentAllowedStops (state, val) { state.currentAllowedStops = val }
  },
  getters: {
    currentTrackOnMap: state => state.currentTrackOnMap,
    pair: state => state.pair,
    pairid: state => state.pair.id
  }
}

export default SelectedDevice
