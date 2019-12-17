const CurrentInfo = {
  state: {
    currentInfo: []
  },

  // ASYNC
  actions: {
    loadCurrentInfo (ctx, DOKNR) {
      var data = {}
      var i = 0
      for (; i < ctx.getters.devices.devicesInUse.length; i++) {
        if (ctx.getters.devices.devicesInUse[i].DOKNR === DOKNR) {
          data = ctx.getters.devices.devicesInUse[i]
          const ret = {
            'Номер трекера': data.deviceid,
            'Номер пропуска в SAP ERP': data.sap,
            'ФИО водителя': data.NAME_DRVR,
            'Время привязки трекера к пропуску': data.attach,
            'Время въезда': data.entry,
            'Время выезда': data.departure,
            'Документ удост. личность': data.DOCTYPE,
            'Марка автомобиля': data.AUTO_MARKA,
            'Гос. номер автомобиля': data.AUTO_NOMER,
            'Начало действия': data.VALID_DATE_FROM,
            'Окончание действия': data.VALID_DATE_TO,
            'Направляется к сотруднику': data.INIT_PNM + '; ' + data.INIT_SNM,
            'Направляется в подразделение': data.INIT_ONM,
            'Пропуск введен сотрудником':
            data.AUTHOR_PNM + '; ' + data.AUTHOR_SNM,
            'Подразделение': data.AUTHOR_ONM,
            'Дата и время создания': data.CREATED_ON_CREATED_TM
          }
          var dataTable = []
          for (var key in ret) {
            if (ret[key] !== null) {
              dataTable.push({ key: key, val: ret[key] })
            }
          }
          ctx.commit('currentInfo', dataTable)
          this._vm.$socket.emitPreloader('currentTrack', {
            sap: ctx.getters.devices.devicesInUse[i].sap,
            deviceid: ctx.getters.devices.devicesInUse[i].deviceid,
            entry: ctx.getters.devices.devicesInUse[i].entry,
            departure: ctx.getters.devices.devicesInUse[i].departure,
            speedLimit: ctx.getters.settings.speedLimit
          })
          this._vm.$socket.emitPreloader('currentInfo_devicesAllowedStops',
            ctx.getters.devices.devicesInUse[i].deviceid
          )
        }
      }
    }
  },
  mutations: {
    currentInfo (state, val) { state.currentInfo = val }
  },
  getters: {
    currentInfo: state => { return state.currentInfo }
  }
}
export default CurrentInfo
