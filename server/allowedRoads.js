const helpers = require('./helpers')

module.exports = function (socket, mysqlConnection) {
  socket.on('allowedRoadsSave', async (data) => {
    try {
      var jsonStr = helpers.mysqlRealEscapeString(JSON.stringify(data.polyline_json))
      const instert = 'insert into tracking_allowedRoads (id, polyline_json, color) values (' + data.id + ',\'' + jsonStr + '\', \'' + data.color + '\') on duplicate key update polyline_json = \'' + jsonStr + '\''
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${instert}`)
      const [rows, fields] = await mysqlConnection.execute(instert)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${instert}`)
      /* eslint-enable */
      socket.emit('allowedRoadsSaved', rows)
    } catch (err) {
      console.error(err)
      socket.emit('allowedRoadsRemove', err)
    }
  })
  socket.on('allowedRoadsRemove', async (data) => {
    try {
      const s = 'DELETE FROM tracking_allowedRoads WHERE  id = ' + data.id
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows, fields] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      /* eslint-enable */
      socket.emit('allowedRoadsRemove', rows)
    } catch (err) {
      console.error(err)
      socket.emit('allowedRoadsRemove', err)
    }
  })
  socket.on('allowedRoads', async (data) => {
    try {
      const s = 'select * from tracking_allowedRoads'
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows, fi] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      /* eslint-enable */
      if (data.list === 'list') {
        socket.emit('allowedRoadsList', rows)
      } else {
        socket.emit('allowedRoads', rows)
      }
    } catch (err) {
      console.error(err)
      socket.emit('allowedRoads', err)
    }
  })
}
