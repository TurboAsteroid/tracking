import L from 'leaflet'

const Report3Store = {
  state: {
    mapReport3: null,
    report3Table: null
  },
  getters: {
    report3Table: (state) => { return state.report3Table }
  },
  mutations: {
    report3Clear: (state, val) => {
      const keys = Object.keys(state)
      for (let i = 0; i < keys.length; i++) {
        state[keys[i]] = null
      }
    },
    mapReport3: (state, val) => { state.mapReport3 = val },
    report3Table: (state, val) => { state.report3Table = val }
  },
  actions: {
    initMapReport3 (ctx) {
      let m = L.map('report3map').setView([56.96105930170542, 60.57539042144521], 15)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href='"http://osm.org/copyright">OpenStreetMap</a> contributors`
      }).addTo(m)
      ctx.commit('mapReport3', m)
    }
  }
}

export default Report3Store
