const M = require('moment')
const currentInfoDevicesAllowedStops = async (socket, mysqlConnection, deviceId) => {
  try {
    const s = `SELECT traccar.tracking_allowedStops.id,
                traccar.tracking_allowedStops.polygon_json,
                traccar.tracking_allowedStops.color,
                traccar.tracking_allowedStops.name,
                traccar.tracking_transport.sap,
                traccar.tracking_transport.deviceid
              FROM traccar.tracking_allowedStops
              JOIN traccar.tracking_transport_stops on traccar.tracking_transport_stops.tracking_allowedStops_id = traccar.tracking_allowedStops.id
              JOIN traccar.tracking_transport on traccar.tracking_transport.id = traccar.tracking_transport_stops.tracking_transport_id and traccar.tracking_transport.active = 1
              JOIN traccar.tracking_sapDocs ON traccar.tracking_sapDocs.DOKNR = traccar.tracking_transport.sap
              where traccar.tracking_transport.deviceid = ` + deviceId + ';'
    console.error(`${Date()} начало выполнения SQL currentInfo_devicesAllowedStops для ${deviceId}`)
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const rows = await mysqlConnection.query(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    socket.emit('currentInfo_devicesAllowedStops', rows[0])
    console.error(`${Date()} клиенту ВЕРНУЛИ currentInfo_devicesAllowedStops для ${deviceId}`)
  } catch (e) {
    console.error(e)
    socket.emit('currentInfo_devicesAllowedStops', e)
  }
}

const currentInfoCurrentTrack = async (socket, mysqlConnection, data) => {
  try {
    let d1
    let d2
    let s
    if (typeof data.deviceid === 'number' || typeof data.deviceid === 'string') {
      if (typeof data.sap === 'number' || typeof data.sap === 'string') {
        if (data.entry !== 'нет въезда' || data.departure !== 'нет выезда') {
          if (typeof data.entry === 'string' && data.entry !== 'нет въезда') {
            d1 = M(data.entry, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
          } else {
            d1 = M().format('YYYY-MM-DD HH:mm:ss')
          }
          if (typeof data.departure === 'string' && data.departure !== 'нет выезда') {
            d2 = M(data.departure, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
          } else {
            d2 = M().format('YYYY-MM-DD HH:mm:ss')
          }
          s = 'select distinct latitude, longitude, speed*1.852 > ' + data.speedLimit + ' as criticalSpeed from tracking_transport left join traccar.tc_positions on traccar.tc_positions.deviceid = tracking_transport.deviceid and traccar.tc_positions.fixtime >= \'' + d1 + '\' and traccar.tc_positions.fixtime <= \'' + d2 + '\' where tracking_transport.active = 1 and tracking_transport.deviceid = ' + data.deviceid + ' and tracking_transport.sap = ' + data.sap + ';'
        } else {
          s = 'SELECT latitude, longitude, speed*1.852 > ' + data.speedLimit + ' as criticalSpeed FROM traccar.tc_positions where traccar.tc_positions.deviceid = ' + data.deviceid + ' order by traccar.tc_positions.id desc limit 1;'
        }
      } else {
        s = 'select \'data.sap is not valid\' as error'
        throw s
      }
    } else {
      s = 'select \'data.deviceid is not valid\' as error'
      throw s
    }
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [ rows ] = await mysqlConnection.query(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    if (rows.length === 1) {
      socket.emit('currentTrack', { currentTrack: [] })
      console.log(data) // !!! Объект прикреплен, но выехал с территории
    } else {
      const responseData = []
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].criticalSpeed) {
          responseData.push(
            {
              latlngs: [[rows[i - 1].latitude, rows[i - 1].longitude], [rows[i].latitude, rows[i].longitude]],
              color: '#FF4136' // 'red'
            }
          )
        } else {
          responseData.push(
            {
              latlngs: [[rows[i - 1].latitude, rows[i - 1].longitude], [rows[i].latitude, rows[i].longitude]],
              color: '#0074D9' // 'blue'
            }
          )
        }
      }
      socket.emit('currentTrack', { currentTrack: responseData })
    }
  } catch (e) {
    console.error(e)
    socket.emit('currentTrack', { error: e.message })
  }
}

module.exports = {
  constr: function (socket, mysqlConnection) {
    socket.on('currentInfo_devicesAllowedStops', function (deviceId) {
      currentInfoDevicesAllowedStops(socket, mysqlConnection, deviceId)
    })

    socket.on('currentTrack', async (data) => {
      currentInfoCurrentTrack(socket, mysqlConnection, data)
    })
  }
}
