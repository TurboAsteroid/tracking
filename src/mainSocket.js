import ElementUI from 'element-ui'
import store from '@/store'
import router from '@/router'

const mainSocket = {
  connect: () => {
    console.log(`${Date()} socket connected`)
  },
  disconnect: () => {
    console.log(`${Date()}  socket disconnected. we are so sorry. reconnecting...`)
  },
  reportbyname: res => {
    // TODO: надо загнать данные в хранилище и передать геттер в модуль reportByName
    // там данныне подтянуть и вывести кнопками
    // при клике на кнопку будет строиться маршрут
    store.commit('setSapDeviceidList', res.sapDeviceidList)
  },
  isInAllowedStop: res => {
    if (router.history.current.fullPath !== '/cu') {
      store.commit('NotificationIfDenyStop', res)
    }
  },
  isInAllowedRoad: res => {
    if (router.history.current.fullPath !== '/cu') {
      store.commit('NotificationIfDenyRoad', res)
    }
  },
  move: res => {
    // рисуем устройства на карте только если мы на той странице
    if (router.history.current.fullPath === '/monitor') {
      store.dispatch('drawDevices', { devices: res.devices })
    }
  },
  currentTrack: res => {
    if (router.history.current.fullPath === '/monitor') {
      store.dispatch('drawCurrentTrack', res.currentTrack)
    }
  },
  currentAllowedRoad: res => {
    // store.dispatch('drawCurrentAllowedRoad', res)
  },
  devices: res => {
    store.commit('devices', res)
    store.dispatch('devicesUseConnectTrackesStateBatteryLevelEmit', res)
  },
  sapDocs: res => {
    if (router.history.current.fullPath !== '/cu') {
      store.commit('sapDocs', res.sapDocs)
    }
  },
  allowedStopsSaved: res => {
    ElementUI.Message({
      type: 'success',
      message: 'Сохранение выполнено успешно'
    })
  },
  allowedStopsRemove: res => {
    if (res.errno === 1451) {
      ElementUI.MessageBox.alert('Удаление невозможно, вероятно место стоянки используется одним из пропусков. ' + res.message, 'Ошибка', {
        confirmButtonText: 'OK',
        type: 'warning'
      })
    } else {
      ElementUI.Message({
        type: 'success',
        message: 'Удаление выполнено успешно'
      })
    }
  },
  allowedStops: res => {
    store.commit('allowedStopsPolygons', [])
    for (let i = 0; i < res.length; i++) {
      store.commit('allowedStopsPolygonCreateAndAdd', res[i])
    }
  },
  allowedRoadsSaved: res => {
    ElementUI.Message({
      type: 'success',
      message: 'Сохранение выполнено успешно'
    })
  },
  allowedRoadsRemove: res => {
    if (res.errno === 1451) {
      ElementUI.MessageBox.alert('Удаление невозможно, вероятно маршрут используется одним из пропусков. ' + res.message, 'Ошибка', {
        confirmButtonText: 'OK',
        type: 'warning'
      })
    } else {
      ElementUI.Message({
        type: 'success',
        message: 'Удаление выполнено успешно'
      })
    }
  },
  allowedRoads: res => {
    for (let i = 0; i < res.length; i++) {
      store.commit('allowedRoadsPolylineCreateAndAdd', res[i])
    }
  },
  allowedRoadsList: res => {
    store.commit('allowedRoadsJustList', res)
  },
  searchReportDocs: res => {
    store.commit('reportDocs', res.reportDocs)
  },
  loadReport1: res => {
    store.commit('report', res)
    const data = res.info
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
    const dataTable = []
    for (const key in ret) {
      if (ret[key] !== null) {
        dataTable.push({ key: key, val: ret[key] })
      }
    }
    store.commit('currentInfo', dataTable)
    store.dispatch('drawReport', res.track)
  },
  Elem: res => {
    store.commit('ElemPolygons', [])
    for (let i = 0; i < res.length; i++) {
      store.commit('ElemPolygonCreateAndAdd', res[i])
    }
  },
  report2searchDriverLike: res => {
    store.commit('report2Driver', res)
  },
  report2searchDriverDate: res => {
    store.commit('report2Data', res)
  },
  report2DriverTime: driver => {
    router.push('/report2/' + driver.NAME_DRVR + '/' + driver.tmine + '/' + driver.tmaxd)
  },
  currentInfo_devicesAllowedStops: res => {
    store.dispatch('drawCurrentAllowedStops', res)
  }
}

export default mainSocket
