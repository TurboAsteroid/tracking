const helpers = require('./helpers')

module.exports = function (socket, mysqlConnection) {
  socket.on('allowedStopsSave', async (data) => {
    try {
      let jsonStr = helpers.mysqlRealEscapeString(JSON.stringify(data.polygon_json))
      const insert = 'insert into tracking_allowedStops (id, polygon_json, color, name) values (' + data.id + ',\'' + jsonStr + '\', \'' + data.color + '\', \'' + data.name + '\') on duplicate key update polygon_json = \'' + jsonStr + '\''
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${insert}`)
      await mysqlConnection.execute(insert)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${insert}`)
      socket.emit('allowedStopsSaved', { status: 200 })
    } catch (err) {
      console.error(err)
      socket.emit('allowedStopsSaved', { status: 500, error: err })
    }
  })
  socket.on('allowedStopsRemove', async (data) => {
    try {
      const s = 'DELETE FROM tracking_allowedStops WHERE  id = ' + data.id
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      socket.emit('allowedStopsRemove', rows)
    } catch (err) {
      console.error(err)
      socket.emit('allowedStopsRemove', err)
    }
  })
  socket.on('allowedStops', async () => {
    try {
      const s = 'select * from tracking_allowedStops'
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      socket.emit('allowedStops', rows)
    } catch (err) {
      console.error(err)
      socket.emit('allowedStops', err)
    }
  })
  socket.on('allowedStopsForEachDevice', async () => {
    try {
      const s = 'select * from tracking_allowedStops'
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      socket.emit('allowedStops', rows)
    } catch (err) {
      console.error(err)
      socket.emit('allowedStops', err)
    }
  })
}
