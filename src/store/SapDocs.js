const SapDocs = {
  state: {
    sapDocs: []
  },
  mutations: {
    sapDocs (state, val) {
      state.sapDocs = val
    }
  },
  actions: {
    loadSapDocs (state) {
      this._vm.$socket.emitPreloader('sapDocs')
    }
  },
  getters: {
    sapDocs: state => {
      return state.sapDocs
    }
  }
}

export default SapDocs
