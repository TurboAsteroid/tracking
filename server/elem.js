const helpers = require('./helpers')

module.exports = function (socket, mysqlConnection) {
  socket.on('ElemSave', async (data) => {
    try {
      var jsonStr = helpers.mysqlRealEscapeString(JSON.stringify(data.polygon_json))
      const instert = 'insert into tracking_elem (id, polygon_json) values (' + data.id + ',\'' + jsonStr + '\') on duplicate key update polygon_json = \'' + jsonStr + '\''
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${instert}`)
      const [rows, fields] = await mysqlConnection.execute(instert)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${instert}`)
      /* eslint-enable */
      socket.emit('ElemSaved', rows)
    } catch (err) {
      console.error(err)
      socket.emit('ElemRemove', err)
    }
  })
  socket.on('ElemRemove', async (data) => {
    try {
      const s = 'DELETE FROM tracking_elem WHERE  id = ' + data.id
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows, fields] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      /* eslint-enable */
      socket.emit('ElemRemove', rows)
    } catch (err) {
      console.error(err)
      socket.emit('ElemRemove', err)
    }
  })
  socket.on('Elem', async (data) => {
    try {
      const s = 'select * from tracking_elem'
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const rows = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      /* eslint-enable */
      socket.emit('Elem', rows[0])
    } catch (err) {
      console.error(err)
      socket.emit('Elem', err)
    }
  })
}
