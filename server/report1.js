const helpers = require('./helpers')
const reportTrackerIdTraccarApi = require('./report_trackerId_traccar_api')
const M = require('moment')
module.exports = function (socket, mysqlConnection) {
  socket.on('loadReport1', async (report) => {
    /*
    report: {
      sap: заполнено,
      date1: заполнено,
      date2: заполнено,
      track: [надо заполнить трек по заданной дате],
      stops: [надо заполнить места стоянки по заданной дате],
      info: [надо заполнить вся информация о пропуске]
    }
    */
    loadReport1(report, socket)
  })

  socket.on('searchReportDocs', async (data) => {
    reportDocs(data, socket)
  })

  const loadReport1 = async (report, socket) => {
    try {
      // const d1 = M(report.date1, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
      // const d2 = M(report.date2, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
      // const s0 = `SELECT departure
      // FROM traccar.tracking_transport
      // WHERE sap = ` + report.sap + ' and active = 1;'
      // let [departure] = await mysqlConnection.execute(s0)
      // let s1
      // if (departure[0] !== undefined) {
      //   if (departure[0].departure === null) {
      //     departure = M().format('YYYY-MM-DD HH:mm:ss')
      //     s1 = 'select distinct sap, latitude, longitude, speed*1.852 > ' + report.criticalspeed + ` as criticalSpeed from tc_positions
      //         join tracking_transport on tracking_transport.deviceid = tc_positions.deviceid and tracking_transport.sap = ` + report.sap + `
      //         and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= '` + departure +
      //       '\' where tc_positions.fixtime >= \'' + d1 + '\' and tc_positions.fixtime <= \'' + d2 + '\';'
      //   } else {
      //     s1 = 'select distinct sap, latitude, longitude, speed*1.852 > ' + report.criticalspeed + ` as criticalSpeed from tc_positions
      //         join tracking_transport on tracking_transport.deviceid = tc_positions.deviceid and tracking_transport.sap = ` + report.sap + `
      //         and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= tracking_transport.departure
      //         where tc_positions.fixtime >= '` + d1 + '\' and tc_positions.fixtime <= \'' + d2 + '\';'
      //   }
      // } else {
      //   s1 = 'select distinct sap, latitude, longitude, speed*1.852 > ' + report.criticalspeed + ` as criticalSpeed from tc_positions
      //         join tracking_transport on tracking_transport.deviceid = tc_positions.deviceid and tracking_transport.sap = ` + report.sap + `
      //         and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= tracking_transport.departure
      //         where tc_positions.fixtime >= '` + d1 + '\' and tc_positions.fixtime <= \'' + d2 + '\';'
      //   departure = true
      // }
      // // трек
      // const [rows] = await mysqlConnection.execute(s1)
      // let track = []
      // for (let i = 1; i < rows.length; i++) {
      //   if (rows[i].criticalSpeed) {
      //     track.push(
      //       {
      //         latlngs: [[rows[i - 1].latitude, rows[i - 1].longitude], [rows[i].latitude, rows[i].longitude]],
      //         color: '#FF4136' // 'red'
      //       }
      //     )
      //   } else {
      //     track.push(
      //       {
      //         latlngs: [[rows[i - 1].latitude, rows[i - 1].longitude], [rows[i].latitude, rows[i].longitude]],
      //         color: '#0074D9' // 'blue'
      //       }
      //     )
      //   }
      // }
      // инфа по пропуску
      const s2 = `select *
        from tracking_sapDocs
        inner join tracking_transport on tracking_transport.sap = tracking_sapDocs.DOKNR
        where tracking_sapDocs.DOKNR  = ` + report.sap
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      const [info] = await mysqlConnection.execute(s2)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      let info1 = await helpers.deviceCreator(info)
      // -----------------------------------
      const deviceidSelect =
        `
          SELECT traccar.tracking_transport.deviceid FROM traccar.tracking_sapDocs
          JOIN traccar.tracking_transport on traccar.tracking_transport.sap = traccar.tracking_sapDocs.doknr
          WHERE traccar.tracking_sapDocs.doknr = ${report.sap}
        `
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${deviceidSelect}`)
      let deviceid = ((await mysqlConnection.execute(deviceidSelect))[0])[0].deviceid
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${deviceidSelect}`)
      const d1 = M(report.date1, 'YYYY.MM.DD HH:mm:ss').toISOString()
      const d2 = M(report.date2, 'YYYY.MM.DD HH:mm:ss').toISOString()
      let stops = await reportTrackerIdTraccarApi.stopPointsTraccarApi(deviceid, d1, d2)
      let track = await reportTrackerIdTraccarApi.trackPointsTraccarApi(deviceid, d1, d2, parseInt(report.criticalspeed))
      // ------------------------------------
      // загрузка точек стоянки
      // let stops = await stopPoints({
      //   sap: report.sap,
      //   date1: report.date1,
      //   date2: report.date2,
      //   departure: departure
      // })
      await socket.emit('loadReport1',
        {
          sap: report.sap,
          date1: report.date1,
          date2: report.date2,
          track: track,
          stops: stops,
          info: info1[0],
          criticalspeed: report.criticalspeed
        }
      )
      console.log('report1 sended')
    } catch (e) {
      console.error(e)
      socket.emit('loadReport1', {error: e.message})
    }
  }

  /*
    data: {
      sap: номер пропуска сап,
      date1: дата и время в начала формат строка "2017-12-15T11:38:53.000Z",
      date2: дата и время окончания формат строка "2017-12-15T11:38:53.000Z"
    }
  */
  // const stopPoints = async (data) => {
  //   data.date1 = M(data.date1, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
  //   data.date2 = M(data.date2, 'YYYY.MM.DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
  //   let s
  //   if (data.departure === true) {
  //     s = `
  //       select fixtime as tmin, fixtime as tmax, round(latitude, 5) as latitude, round(longitude, 5) as longitude from tracking_transport
  //       left join traccar.tc_positions on tc_positions.deviceid = tracking_transport.deviceid and tracking_transport.sap = ${data.sap}
  //       and tc_positions.fixtime >= tracking_transport.entry and tc_positions.fixtime <= tracking_transport.departure
  //       where tc_positions.fixtime >= '${data.date1}' and tc_positions.fixtime <= '${data.date2}' and speed = 0
  //       group by round(latitude, 5)
  //       order by fixtime
  //     `
  //   } else {
  //     s = `
  //       select fixtime as tmin, fixtime as tmax, round(latitude, 5) as latitude, round(longitude, 5) as longitude from tracking_transport
  //       left join tc_positions on tc_positions.deviceid = tracking_transport.deviceid
  //       and tracking_transport.sap = ${data.sap}
  //       and tc_positions.fixtime >= tracking_transport.entry
  //       and tc_positions.fixtime <= '${M(data.departure[0].departure).format('YYYY-MM-DD HH:mm:ss')}'
  //       where tc_positions.fixtime >= '${data.date1}' and tc_positions.fixtime <= '${data.date2}' and speed = 0
  //       group by round(latitude, 5)
  //       order by fixtime
  //       `
  //   }
  //   const [rows] = await mysqlConnection.execute(s)
  //   let pointsArr = rows
  //   let d = 15
  //   if (pointsArr.length >= 2) {
  //     for (var g = 0; g < pointsArr.length; g++) {
  //       for (let i = g; i < pointsArr.length - 1; i++) {
  //         if (await helpers.calculateTheDistance(
  //           pointsArr[i].latitude, pointsArr[i].longitude,
  //           pointsArr[i + 1].latitude, pointsArr[i + 1].longitude) < d) {
  //           pointsArr[i] = await helpers.deltaPoint(pointsArr[i], pointsArr[i + 1])
  //           pointsArr.splice(i + 1, 1)
  //           g--
  //           break
  //         }
  //       }
  //     }
  //     for (let h = 0; h < pointsArr.length; h++) {
  //       pointsArr[h].stopTime = (M(pointsArr[h].tmax) - M(pointsArr[h].tmin)) / 1000
  //       if (pointsArr[h].stopTime === 0) {
  //         pointsArr.splice(h, 1)
  //         h--
  //       } else {
  //         if (pointsArr[h].stopTime >= 60) {
  //           pointsArr[h].stopTime = Math.floor(pointsArr[h].stopTime / 60) + ' мин. ' + (pointsArr[h].stopTime % 60)
  //         }
  //         pointsArr[h].tmin = M(pointsArr[h].tmin).format('YYYY-MM-DD HH:mm:ss')
  //         pointsArr[h].tmax = M(pointsArr[h].tmax).format('YYYY-MM-DD HH:mm:ss')
  //       }
  //     }
  //   }
  //   return pointsArr
  // }
  const reportDocs = async (searchString, socket) => {
    try {
      const s = `select DOKNR, NAME_DRVR, AUTO_MARKA, AUTO_NOMER, VALID_DATE_FROM, VALID_DATE_TO, entry, departure, attach, unattach
    from tracking_sapDocs
    inner join tracking_transport on tracking_transport.sap = tracking_sapDocs.DOKNR
    where tracking_transport.sap like '%` + searchString + '%\' or NAME_DRVR like \'%' + searchString + '%\''
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      for (let h = 0; h < rows.length; h++) {
        if (rows[h].entry === null) {
          rows[h].entry = 'нет въезда'
        } else {
          rows[h].entry = M(rows[h].entry).format('YYYY.MM.DD HH:mm:ss')
        }
        if (rows[h].departure === null) {
          rows[h].departure = 'нет выезда'
        } else {
          rows[h].departure = M(rows[h].departure).format('YYYY.MM.DD HH:mm:ss')
        }
        rows[h].attach = M(rows[h].attach).format('YYYY.MM.DD HH:mm:ss')
        // rows[h].departure = M(rows[h].departure).format('YYYY.MM.DD HH:mm:ss')
        // rows[h].entry = M(rows[h].entry).format('YYYY.MM.DD HH:mm:ss')
        rows[h].unattach = M(rows[h].unattach).format('YYYY.MM.DD HH:mm:ss')
        rows[h].VALID_DATE_FROM = M(rows[h].VALID_DATE_FROM).format('YYYY.MM.DD HH:mm:ss')
        rows[h].VALID_DATE_TO = M(rows[h].VALID_DATE_TO).format('YYYY.MM.DD HH:mm:ss')
      }
      socket.emit('searchReportDocs', {reportDocs: rows})
    } catch (e) {
      console.error(e)
      socket.emit('searchReportDocs', {error: e.message})
    }
  }
}
