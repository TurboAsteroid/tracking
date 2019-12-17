import S from '@/store'
import M from 'moment'
import {MessageBox} from 'element-ui'

const connectSocket = {
  connect_sapdocs: res => {
    S.commit('connectStore/connectSapdocs', res)
  },
  connect_allowstops: res => {
    S.dispatch('connectStore/drawConnectAllowstops', res)
  },
  connect_trackers: res => {
    S.commit('connectStore/connectTrackers', res)
  },
  connect_activeInfo: res => {
    S.commit('connectStore/connectActiveInfo', res)
  },
  connect_editAllowstops: res => {
    S.dispatch('connectStore/drawConnectEditAllowstops', res)
  },
  connect_editSave: res => {
    if (res.status === 200) {
      MessageBox.alert('Сохранение выполнено успешно', 'Успех', {
        type: 'success',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    } else if (res.status === 500) {
      MessageBox.alert(`Сохранение не выполнено. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    } else {
      MessageBox.alert(`Сохранение не выполнено. Неизвестная ошибка. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    }
  },
  connect_attach: res => {
    if (res.status === 200) {
      MessageBox.alert('Выдача выполнена успешно', 'Успех', {
        type: 'success',
        confirmButtonText: 'OK',
        callback: action => {
          S.dispatch('connectStore/connectAttach')
        }
      })
    } else if (res.status === 500) {
      MessageBox.alert(`Выдача не выполнена. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    } else {
      MessageBox.alert(`Выдача не выполнена. Неизвестная ошибка. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    }
  },
  connect_unattach: res => {
    if (res.status === 200) {
      MessageBox.alert('Изъятие выполнено успешно', 'Успех', {
        type: 'success',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    } else if (res.status === 500) {
      MessageBox.alert(`Изъятие не выполнено. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    } else {
      MessageBox.alert(`Изъятие не выполнено. Неизвестная ошибка. Причина: ${res.error.message}`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    }
  },
  connect_batteryLevel: res => {
    if (res > 20) {
      try {
        S.commit('connectStore/connectSelectedItem', {
          currentStep: 1,
          step1: {
            doknr: S.getters.connectStore.connectSelectedItem.step1.doknr
          },
          step2: {
            polygonsId: S.getters.connectStore.connectSelectedItem.step2.polygonsId,
            names: S.getters.connectStore.connectSelectedItem.step2.names,
            driver: S.getters.connectStore.connectSelectedItem.step2.driver
          },
          step3: {
            trackerId: S.getters.connectStore.connectSelectedItem.step3.trackerId,
            connect_batteryLevel: res
          }
        })
        S._vm.$socket.emitPreloader('connect_attach', S.getters.connectStore.connectSelectedItem)
      } catch (e) {
        MessageBox.alert(e.message, 'Ошибка', {
          type: 'error',
          confirmButtonText: 'OK',
          callback: action => {
          }
        })
      }
    } else {
      MessageBox.alert(`Выдача не выполнена. Причина: батарея разряжена`, 'Ошибка', {
        type: 'error',
        confirmButtonText: 'OK',
        callback: action => {
        }
      })
    }
  },
  connect_trackesStateBatteryLevel: res => {
    let ret = []
    let devicesIds = []
    for (let i = 0; i < S.getters.devices.devicesFree.length; i++) {
      devicesIds.push(S.getters.devices.devicesFree[i].deviceid)
    }
    for (let i = 0; i < S.getters.devices.devicesInUse.length; i++) {
      devicesIds.push(S.getters.devices.devicesInUse[i].deviceid)
    }
    for (let i = 0; i < devicesIds.length; i++) {
      let current = devicesIds[i]
      if (res.length === 0) {
        ret.push({deviceid: current, batteryLevel: 0, fixtime: M().format('HH:mm:ss DD.MM.YYYY')})
      } else {
        let flag = false
        for (let j = 0; j < res.length; j++) {
          if (res[j].deviceid === current) {
            ret.push({
              deviceid: res[j].deviceid,
              batteryLevel: res[j].batteryLevel,
              fixtime: M(res[j].fixtime).format('HH:mm:ss DD.MM.YYYY')
            })
            flag = !flag
            break
          }
        }
        if (!flag) {
          ret.push({deviceid: current, batteryLevel: 0, fixtime: M().format('HH:mm:ss DD.MM.YYYY')})
        }
      }
    }

    S.commit('connectStore/connectTrackersStateDevicesBatteryLevel', ret)
  }
}

export default connectSocket
