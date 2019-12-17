const M = require('moment')

module.exports = function (socket, mysqlConnection) {
  socket.on('report3_getTable', async (date) => {
    report3GetTable(date, socket)
  })

  const report3GetTable = async (date, socket) => {
    try {
      const d1 = M(date).format('YYYY-MM-DD')
      const d2 = M(date).add(1, 'day').format('YYYY-MM-DD')
      const s = `
        SELECT * FROM traccar.tracking_transport
        JOIN traccar.tracking_sapDocs ON traccar.tracking_sapDocs.DOKNR = traccar.tracking_transport.sap
        WHERE traccar.tracking_transport.entry >= '` + d1 + ' 00:00:00\' and traccar.tracking_transport.entry < \'' + d2 + ` 00:00:00'
      `
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      if (rows !== null) {
        socket.emit('report3_getTable', rows)
      } else {
        socket.emit('report3_getTable', { msg: 'Ничего не найдено' })
      }
    } catch (e) {
      console.error(e)
      socket.emit('report3_getTable', { msg: 'Ничего не найдено', error: e.message })
    }
  }
}
