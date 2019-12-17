const logStore = {
  namespaced: true,
  state: {
    logCurrentSpeed: null,
    logCurrentSpeedDate: null,
    logCardData: null,
    marker: null,
    logStops: null,
    logActiveTab: 'speed24'
  },
  mutations: {
    logStops: (state, val) => { state.logStops = val },
    logCardData: (state, val) => { state.logCardData = val },
    logCurrentSpeedDate: (state, val) => { state.logCurrentSpeedDate = val },
    logCurrentSpeed: (state, val) => { state.logCurrentSpeed = val },
    marker: (state, val) => { state.marker = val },
    logActiveTab: (state, val) => { state.logActiveTab = val }
  },
  getters: {
    logStops: state => { return state.logStops },
    logCardData: state => { return state.logCardData },
    logCurrentSpeedDate: state => { return state.logCurrentSpeedDate },
    logCurrentSpeed: state => { return state.logCurrentSpeed },
    marker: state => { return state.marker },
    logActiveTab: state => { return state.logActiveTab }
  },
  actions: { }
}
export default logStore
