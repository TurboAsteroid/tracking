const reportByName = {
  state: {
    sapDeviceidList: []
  },

  // ASYNC
  actions: {
    initMapReport (state) {
    }
  },

  // NOT ASYNC
  mutations: {
    setSapDeviceidList (state, val) {
      state.sapDeviceidList = val
    }
  },

  getters: {
    getSapDeviceidList: state => {
      return state.sapDeviceidList
    }
  }
}
export default reportByName
