const Devices = {
  state: {
    devices: [],
    adding: { sapDocN: '', deviceN: '', road: '' }
  },

  mutations: {
    devices: (state, val) => {
      state.devices = val
    },
    addingSapDocN: (state, val) => { state.adding.sapDocN = val },
    addingDeviceN: (state, val) => { state.adding.deviceN = val },
    addingRoad: (state, val) => { state.adding.road = val },
    adding: (state, val) => { state.adding = val }
  },

  getters: {
    devices: state => { return state.devices },
    devicesOtherName: state => { return state.devices },
    adding: state => { return state.adding },
    addingRoad: state => { return state.adding.road }
  },

  actions: {
    loadAllDevices (state) {
      this._vm.$socket.emit('devices')
    },
    attachDeviceToSapDoc (ctx) {
      this._vm.$socket.emit('attach', ctx.state.adding)
    },
    devicesUseConnectTrackesStateBatteryLevelEmit (ctx, val) {
      // получение состояния батареек - зависит от другого модуля!!! нарушение условий модульности
      let devicesIds = []
      for (let i = 0; i < val.devicesFree.length; i++) {
        devicesIds.push(val.devicesFree[i].deviceid)
      }
      for (let i = 0; i < val.devicesInUse.length; i++) {
        devicesIds.push(val.devicesInUse[i].deviceid)
      }
      this._vm.$socket.emit('connect_trackesStateBatteryLevel', devicesIds)
    }
  }
}
export default Devices
