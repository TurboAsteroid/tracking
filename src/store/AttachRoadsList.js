const AttachRoadsList = {
  state: {
    allowedRoadsJustList: []
  },
  mutations: {
    allowedRoadsJustList (state, val) {
      state.allowedRoadsJustList = val
    }
  },
  getters: {
    allowedRoadsJustList: state => { return state.allowedRoadsJustList }
  }
}

export default AttachRoadsList
