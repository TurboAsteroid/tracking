const axios = require('axios')
const M = require('moment')
const options = {
  auth: {
    username: 'admin',
    password: 'admin'
  }
}

// точки стоянки через api traccar
const stopPointsTraccarApi = async (deviceId, dateStart, dateEnd) => {
  let stops = (await axios.get(`http://10.1.255.208:9999/api/reports/stops?deviceId=${deviceId}&from=${dateStart}&to=${dateEnd}`, options)).data
  let ret = []
  stops.forEach(function (stop) {
    ret.push(
      {
        latitude: stop.latitude,
        longitude: stop.longitude,
        tmin: M(stop.startTime).format('YYYY-MM-DD HH:mm:ss').toString(),
        tmax: M(stop.endTime).format('YYYY-MM-DD HH:mm:ss').toString(),
        stopTime: stop.duration.toString()
      }
    )
  })
  return ret
}

// трек через api traccar
const trackPointsTraccarApi = async (deviceId, dateStart, dateEnd, criticalSpeed) => {
  let track = (await axios.get(`http://10.1.255.208:9999/api/reports/route?deviceId=${deviceId}&from=${dateStart}&to=${dateEnd}`, options)).data
  let ret = []
  for (let i = 1; i < track.length; i++) {
    var color = '#0074D9' // 'blue'
    if (track[i].speed > criticalSpeed) color = '#FF4136' // 'red'
    ret.push(
      {
        latlngs: [[track[i - 1].latitude, track[i - 1].longitude], [track[i].latitude, track[i].longitude]],
        color: color
      }
    )
  }
  return ret
}

// трек через api traccar
const trackPointsTraccarApi_ss = async (deviceId, dateStart, dateEnd, criticalSpeed) => {
  let track = (await axios.get(`http://10.1.255.208:9999/api/reports/route?deviceId=${deviceId}&from=${dateStart}&to=${dateEnd}`, options)).data
  let ret = []
  for (let i = 1; i < track.length; i++) {
    var color = '#0074D9' // 'blue'
    if (track[i].speed > criticalSpeed) color = '#FF4136' // 'red'
    ret.push(
      {
        latlngs: [[track[i - 1].latitude, track[i - 1].longitude], [track[i].latitude, track[i].longitude]],
        color: color
      }
    )
  }
  return ret
}

module.exports = {
  stopPointsTraccarApi: stopPointsTraccarApi,
  trackPointsTraccarApi: trackPointsTraccarApi
}
