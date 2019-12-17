const helpers = require('./helpers')
const M = require('moment')
const randomer = require('./randomer.js').create()
// eslint-disable-next-line
String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement)
}
module.exports = function (socket, mysqlConnection) {
  // searchString - строка поиска
  socket.on('report2searchDriverLike', async (searchString) => {
    report2searchDriverLike(searchString, socket)
  })
  socket.on('report2searchDriverDate', async (report2) => {
    /*
      report2 = {
        searchString: '',
        date1
        date2
      }
    */
    await report2searchDriverDate(report2, socket)
  })
  socket.on('report2DriverTime', async (searchString) => {
    report2DriverTime(searchString, socket)
  })
  const report2searchDriverLike = async (searchString, socket) => {
    try {
      const s = `
        select DISTINCT
        tracking_sapDocs.NAME_DRVR
        from tracking_sapDocs
        inner join tracking_transport on tracking_transport.sap = tracking_sapDocs.DOKNR
        where tracking_sapDocs.NAME_DRVR like '%` + searchString + `%';
        `
      // eslint-disable-next-line
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [drivers] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      if (drivers[0].NAME_DRVR !== null) {
        socket.emit('report2searchDriverLike', drivers)
      } else {
        socket.emit('report2searchDriverLike', { msg: 'Ничего не найдено' })
      }
    } catch (e) {
      console.error(e)
      socket.emit('report2searchDriverLike', { msg: 'Ничего не найдено', error: e.message })
    }
  }

  const report2DriverTime = async (searchString, socket) => {
    try {
      const s = `
        select DISTINCT
        min(tracking_transport.entry) as tmine, max(tracking_transport.departure) as tmaxd
        from tracking_sapDocs
        inner join tracking_transport on tracking_transport.sap = tracking_sapDocs.DOKNR
        where tracking_sapDocs.NAME_DRVR = '` + searchString.NAME_DRVR + `'
        order by tracking_transport.departure;
        `
      // eslint-disable-next-line
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [driverT] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      if (driverT[0].tmine !== null) {
        let driver = {}
        driver.tmine = (M(driverT[0].tmine).format('YYYY-MM-DD HH:mm:ss')).replaceAll(':', 'D').replaceAll('.', 'P')
        if (driverT[0].tmaxd !== null) {
          driver.tmaxd = (M(driverT[0].tmaxd).format('YYYY-MM-DD HH:mm:ss')).replaceAll(':', 'D').replaceAll('.', 'P')
        } else {
          driver.tmaxd = (M().format('YYYY-MM-DD HH:mm:ss')).replaceAll(':', 'D').replaceAll('.', 'P')
        }
        driver.NAME_DRVR = searchString.NAME_DRVR
        socket.emit('report2DriverTime', driver)
      } else {
        socket.emit('report2DriverTime', { msg: 'Ничего не найдено' })
      }
    } catch (e) {
      console.error(e)
      socket.emit('report2DriverTime', { msg: 'Ничего не найдено', error: e.message })
    }
  }

  const report2searchDriverDate = async (report2, socket) => {
    // старая версия
    try {
      const d1 = M(report2.date1, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
      const d2 = M(report2.date2, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')

      const s1 = `select sap, entry, departure from tracking_transport
      inner join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_transport.sap
      where tracking_sapDocs.NAME_DRVR = '` + report2.NAME_DRVR + '\';'
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
      const [times] = await mysqlConnection.execute(s1)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)

      var s2 = 'select distinct sap, latitude, longitude, speed*1.852 > ' + report2.criticalspeed + ` as criticalSpeed from tc_positions
      join tracking_transport on tracking_transport.deviceid = tc_positions.deviceid and (`
      var sapForS3 = []
      for (var t = 0; t < times.length; t++) {
        sapForS3.push(times[t].sap)
        if (t + 1 !== times.length) {
          s2 += ' sap = ' + times[t].sap + ' and (tc_positions.fixtime >= \'' +
            M(times[t].entry, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') + '\' and tc_positions.fixtime <= \'' +
            M(times[t].departure, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') + '\') or'
        } else {
          var td = M().format('YYYY-MM-DD HH:mm:ss')
          var te = M().format('YYYY-MM-DD HH:mm:ss')
          if (times[t].departure !== null) {
            td = M(times[t].departure).format('YYYY-MM-DD HH:mm:ss')
          }
          if (times[t].entry !== null) {
            te = M(times[t].entry).format('YYYY-MM-DD HH:mm:ss')
          }
          s2 += ` sap = ${times[t].sap} and (tc_positions.fixtime >= '${te}' and tc_positions.fixtime <= '${td}'))`
        }
      }
      s2 += ` where tc_positions.fixtime >= '${d1}' and tc_positions.fixtime <= '${d2}';`
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      const [rows] = await mysqlConnection.execute(s2)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      let track = {}
      for (var i = 1; i < rows.length; i++) {
        randomer.seed(rows[i].sap)
        if (track[rows[i].sap] === undefined) {
          track[rows[i].sap] = []
          i++
        }
        var colorid = randomer(45)
        if (i === rows.length) {
          i--
        }
        track[rows[i].sap].push(
          {
            latlngs: [[rows[i - 1].latitude, rows[i - 1].longitude], [rows[i].latitude, rows[i].longitude]],
            color: helpers.colors[colorid],
            sap: rows[i - 1].sap
          }
        )
      }
      var s3 = ''
      for (let i = 0; i < sapForS3.length; i++) {
        if (times[i].departure === null) {
          s3 += `select fixtime as tmin, fixtime as tmax, round(latitude, 5) as latitude, round(longitude, 5) as longitude from tracking_transport
          left join tc_positions on tc_positions.deviceid = tracking_transport.deviceid and sap = ${sapForS3[i]}
          and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= '${M().format('YYYY-MM-DD HH:mm:ss')}'
          where tc_positions.fixtime >= '${d1}' and tc_positions.fixtime <= '${d2}'
          and speed = 0
          group by round(latitude, 5)
          order by fixtime;`
        } else {
          s3 += `select fixtime as tmin, fixtime as tmax, round(latitude, 5) as latitude, round(longitude, 5) as longitude from tracking_transport
          left join tc_positions on tc_positions.deviceid = tracking_transport.deviceid and sap = ${sapForS3[i]}
          and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= tracking_transport.departure
          where tc_positions.fixtime >= '${d1}' and tc_positions.fixtime <= '${d2}'
          and speed = 0
          group by round(latitude, 5)
          order by fixtime;`
        }
      }
      // необходимо для генерации в любом случае двумерного массива в ответе
      s3 += ' select 1;'
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s3}`)
      const [rowsPoints] = await mysqlConnection.query(s3)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s3}`)
      var retPoints = []
      for (let ss = 0; ss < rowsPoints.length - 1; ss++) {
        let pointsArr = rowsPoints[ss]
        let d = 15
        if (pointsArr.length >= 2) {
          for (var g = 0; g < pointsArr.length; g++) {
            for (let i = g; i < pointsArr.length - 1; i++) {
              if (await helpers.calculateTheDistance(
                pointsArr[i].latitude, pointsArr[i].longitude,
                pointsArr[i + 1].latitude, pointsArr[i + 1].longitude) < d) {
                pointsArr[i] = await helpers.deltaPoint(pointsArr[i], pointsArr[i + 1])
                pointsArr.splice(i + 1, 1)
                g--
                break
              }
            }
          }
          for (let h = 0; h < pointsArr.length; h++) {
            pointsArr[h].stopTime = (M(pointsArr[h].tmax) - M(pointsArr[h].tmin)) / 1000
            if (pointsArr[h].stopTime === 0) {
              pointsArr.splice(h, 1)
              h--
            } else {
              if (pointsArr[h].stopTime >= 60) {
                pointsArr[h].stopTime = Math.floor(pointsArr[h].stopTime / 60) + ' мин. ' + (pointsArr[h].stopTime % 60)
              }
              pointsArr[h].tmin = M(pointsArr[h].tmin).format('YYYY-MM-DD HH:mm:ss')
              pointsArr[h].tmax = M(pointsArr[h].tmax).format('YYYY-MM-DD HH:mm:ss')
            }
          }
        }
        retPoints = pointsArr.concat(retPoints)
      }
      await socket.emit('report2searchDriverDate', { track: track, stops: retPoints })
      console.log('report2 sended')
    } catch (e) {
      console.error(e)
      socket.emit('report2searchDriverDate', { error: 'server: ' + e.message })
    }
  }
}
