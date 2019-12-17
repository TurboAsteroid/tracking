import S from '@/store'
import M from 'moment'
const report3Socket = {
  report3_getTable: res => {
    let ret = []
    for (let i = 0; i < res.length; i++) {
      if (res[i].entry !== null) {
        res[i].entryD = M(i.entry).format('HH:mm YYYY.MM.DD')
      } else {
        res[i].entryD = 'нет въезда'
      }
      if (res[i].departure !== null) {
        res[i].departureD = M(i.departure).format('HH:mm YYYY.MM.DD')
      } else {
        res[i].departureD = 'нет выезда'
      }
      ret.push(res[i])
    }
    S.commit('report3Table', ret)
  }
}

export default report3Socket
