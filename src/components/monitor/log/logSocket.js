import S from '@/store'
// import M from 'moment'
const logSocket = {
  // приходит постоянно
  log_get_speed: res => {
    S.commit('logStore/logCurrentSpeed', res)
  },
  // приходит по запросу
  log_get_speed_date: res => {
    S.commit('logStore/logCurrentSpeedDate', res)
  },
  log_get_cardData_id: res => {
    S.commit('logStore/logCardData', res)
  },
  log_get_stops: res => {
    S.commit('logStore/logStops', res)
  }
}

export default logSocket
