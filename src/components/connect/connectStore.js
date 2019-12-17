import { marker, map, tileLayer, polygon } from 'leaflet'

const connectStore = {
  namespaced: true,
  state: {
    // карта и все объекты на ней
    connectMap: {
      map: null,
      polygons: [],
      markers: []
    },
    connectSapdocs: [],
    connectSelectedItem: {
      currentStep: 1,
      step1: {
        doknr: ''
      },
      step2: {
        polygonsId: [],
        names: [],
        driver: null
      },
      step3: {
        trackerId: -1,
        connect_batteryLevel: -1
      }
    },
    connectTrackers: [],
    connectActiveInfo: [],
    connectEditTracker: {
      deviceid: '',
      info: {},
      marker: -1,
      editable: false,
      allowedStops: []
    },
    connectTrackersState: {
      devicesBatteryLevel: {}
    }
  },
  mutations: {
    connectSapdocs: (state, val) => { state.connectSapdocs = val },
    connectSelectedItem: (state, val) => { state.connectSelectedItem = val },
    connectTrackers: (state, val) => { state.connectTrackers = val },
    connectActiveInfo: (state, val) => { state.connectActiveInfo = val },
    connectChangeTab: (state) => {
      state.connectSelectedItem = {
        currentStep: 1,
        step1: {
          doknr: ''
        },
        step2: {
          polygonsId: [],
          names: [],
          driver: null
        },
        step3: {
          trackerId: -1,
          connect_batteryLevel: -1
        }
      }
      state.connectEditTracker = {
        deviceid: '',
        info: {},
        marker: -1,
        editable: false,
        allowedStops: []
      }
    },
    connectTrackersStateDevicesBatteryLevel: (state, val) => { state.connectTrackersState.devicesBatteryLevel = val }
  },
  getters: {
    connectSapdocs: state => { return state.connectSapdocs },
    connectSelectedItem: state => { return state.connectSelectedItem },
    connectTrackers: state => { return state.connectTrackers },
    connectEditTracker: state => { return state.connectEditTracker },
    connectActiveInfo: state => { return state.connectActiveInfo },
    connectMapPolygons: state => { return state.connectMap.polygons },
    connectTrackersStateDevicesBatteryLevel: state => { return state.connectTrackersState.devicesBatteryLevel }
  },
  actions: {
    initMapConnect (ctx) {
      const m = map('connectMap').setView([56.96105930170542, 60.57539042144521], 15)
      tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      ctx.state.connectMap.map = m
      this._vm.$socket.emitPreloader('connect_sapdocs')
      this._vm.$socket.emitPreloader('connect_activeInfo', '')
    },
    drawConnectAllowstops: (ctx, arr) => {
      ctx.dispatch('clearConnectMap')
      arr.forEach(element => {
        let currentColor = '#E71D36'
        for (let i = 0; i < ctx.state.connectSelectedItem.step2.polygonsId.length; i++) {
          if (ctx.state.connectSelectedItem.step2.polygonsId[i] === element.id) {
            currentColor = '#2ECC40'
            break
          }
        }
        const plg = polygon(JSON.parse(element.polygon_json), {
          id: element.id,
          name: element.name,
          color: currentColor
        })
          .on('click', (ev) => {
            if (ctx.state.connectSelectedItem.currentStep === 2) {
              let was = false
              for (let i = 0; i < ctx.state.connectSelectedItem.step2.polygonsId.length; i++) {
                if (ctx.state.connectSelectedItem.step2.polygonsId[i] === ev.target.options.id) {
                  ctx.state.connectSelectedItem.step2.polygonsId.splice(i, 1)
                  ctx.state.connectSelectedItem.step2.names.splice(i, 1)
                  ev.target.setStyle({ color: '#E71D36' })
                  was = true
                }
              }
              if (!was) {
                ctx.state.connectSelectedItem.step2.polygonsId.push(ev.target.options.id)
                ctx.state.connectSelectedItem.step2.names.push(ev.target.options.name)
                ev.target.setStyle({ color: '#2ECC40' })
              }
            }
          })
          .on('mouseover', (ev) => {
            if (ctx.state.connectSelectedItem.currentStep === 2) {
              ev.target.openPopup(ev.latlng)
            }
          })
          .on('mouseout', (ev) => {
            if (ctx.state.connectSelectedItem.currentStep === 2) {
              ev.target.closePopup()
            }
          })
          .bindPopup(element.name.toString())
          .addTo(ctx.state.connectMap.map)
        ctx.state.connectMap.polygons.push(plg)
      })
    },
    drawConnectEditAllowstops: (ctx, arr) => {
      ctx.dispatch('clearConnectMap')
      // заново добавляем уже существующий в хранилище маркер
      ctx.state.connectEditTracker.marker =
        marker(
          ctx.state.connectEditTracker.marker._latlng,
          { NAME_DRVR: ctx.state.connectEditTracker.marker.NAME_DRVR }
        )
          .bindPopup(ctx.state.connectEditTracker.marker.options.NAME_DRVR)
          .addTo(ctx.state.connectMap.map)
      ctx.state.connectMap.markers.push(ctx.state.connectEditTracker.marker)
      ctx.state.connectEditTracker.allowedStops = []
      arr.forEach(element => {
        element.polygon_json = JSON.parse(element.polygon_json)
        let currentColor = '#E71D36'
        if (element.active === 1) {
          currentColor = '#2ECC40'
        }
        ctx.state.connectEditTracker.allowedStops.push(element)
        const plg = polygon(element.polygon_json, {
          id: element.id,
          tracking_transport_id: element.tracking_transport_id,
          name: element.name,
          color: currentColor,
          active: element.active,
          polygon_json: element.polygon_json
        })
          .on('click', (ev) => {
            if (parseInt(ev.sourceTarget.options.active) === 0) {
              ev.target.setStyle({ color: '#2ECC40' })
            } else {
              ev.target.setStyle({ color: '#E71D36' })
            }
            for (let i = 0; i < ctx.state.connectEditTracker.allowedStops.length; i++) {
              if (ctx.state.connectEditTracker.allowedStops[i].id === ev.sourceTarget.options.id) {
                if (parseInt(ev.sourceTarget.options.active) === 0) {
                  ctx.state.connectEditTracker.allowedStops[i].active = 1
                  ev.sourceTarget.options.active = 1
                  break
                }
                ctx.state.connectEditTracker.allowedStops[i].active = 0
                ev.sourceTarget.options.active = 0
                break
              }
            }
          })
          .on('mouseover', (ev) => {
            if (ctx.state.connectSelectedItem.currentStep === 2) {
              ev.target.openPopup(ev.latlng)
            }
          })
          .on('mouseout', (ev) => {
            if (ctx.state.connectSelectedItem.currentStep === 2) {
              ev.target.closePopup()
            }
          })
          .bindPopup(element.name.toString())
          .addTo(ctx.state.connectMap.map)
        ctx.state.connectMap.polygons.push(plg)
      })
    },
    clearConnectMap: (ctx) => {
      for (let i = 0; i < ctx.state.connectMap.polygons.length; i++) {
        ctx.state.connectMap.map.removeLayer(ctx.state.connectMap.polygons[i])
      }
      ctx.state.connectMap.polygons = []
      for (let i = 0; i < ctx.state.connectMap.markers.length; i++) {
        ctx.state.connectMap.map.removeLayer(ctx.state.connectMap.markers[i])
      }
      ctx.state.connectMap.markers = []
      for (let i = 0; i < ctx.state.connectEditTracker.allowedStops.length; i++) {
        ctx.state.connectMap.map.removeLayer(ctx.state.connectEditTracker.allowedStops[i])
      }
      ctx.state.connectEditTracker.allowedStops = []
    },
    connectAttach: (ctx) => {
      ctx.dispatch('clearConnectMap')
      ctx.state.connectSelectedItem = {
        currentStep: 1,
        step1: {
          doknr: ''
        },
        step2: {
          polygonsId: []
        },
        step3: {
          trackerId: -1,
          connect_batteryLevel: -1
        }
      }
    },
    connectDrawMarker: (ctx, info) => {
      for (let i = 0; i < ctx.state.connectMap.markers.length; i++) {
        ctx.state.connectMap.map.removeLayer(ctx.state.connectMap.markers[i])
      }
      ctx.state.connectMap.markers = []
      ctx.state.connectEditTracker.info = info
      ctx.state.connectEditTracker.deviceid = info.deviceid
      ctx.state.connectEditTracker.marker = marker([
        info.latitude,
        info.longitude
      ], { NAME_DRVR: info.NAME_DRVR })
        .bindPopup(info.NAME_DRVR)
        .addTo(ctx.state.connectMap.map)
      ctx.state.connectMap.markers.push(ctx.state.connectEditTracker.marker)
      ctx.state.connectMap.map.setView(ctx.state.connectEditTracker.marker.getLatLng())
    }
  }
}
export default connectStore
