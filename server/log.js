const M = require('moment')

const logWriterSpeed = function (devices, mysqlConnection) {
  var speedLimit = 20
  let s = ''
  for (var i = 0; i < devices.length; i++) {
    if (devices[i].speed > speedLimit) {
      s += `INSERT INTO traccar.tracking_log_speed (device, sapDocs, dt, speed, position) 
      VALUES (${devices[i].deviceid}, ${devices[i].sap}, NOW(), ${devices[i].speed}, ${devices[i].position});`
    }
  }
  // здесь делаем инсерт в бд, надо учесть повторы если они будут
  if (s !== '') {
    mysqlConnection.query(s)
  }
}

const logWriterStops = function (devsWithStops, notificationMapJson, mysqlConnection) {
  let s = ''
  for (var i = 0; i < notificationMapJson.length; i++) {
    for (var j = 0; j < devsWithStops.length; j++) {
      if (notificationMapJson[i].deviceid === devsWithStops[j].deviceid && !notificationMapJson[i].isAllowedStop) {
        s += `INSERT INTO traccar.tracking_log_stops (position, sapDocs) 
          VALUES (${devsWithStops[j].position}, ${devsWithStops[j].sap})
          on duplicate key update position = ${devsWithStops[j].position};`
        break
      }
    }
  }
  // здесь делаем инсерт в бд, надо учесть повторы если они будут
  if (s !== '') {
    mysqlConnection.query(s)
  }
}

const logGetSpeedDate = async function (socket, mysqlConnection, data) {
  try {
    let ret = []
    let m0 = M(data).format('YYYY-MM-DD HH:mm:ss')
    let m1 = M(data).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
    let s = `
      select tls.id, tls.device, tls.sapDocs, tls.dt, tls.speed, tls.position, tt.entry, tt.departure, tt.active, tt.attach, tt.unattach,
      ts.DOCTYPE, ts.NAME_DRVR, ts.AUTO_MARKA, ts.AUTO_NOMER, ts.VALID_DATE_FROM, ts.VALID_DATE_TO,
      ts.INIT_PNM, ts.INIT_SNM, ts.INIT_ONM, ts.AUTHOR_PNM, ts.AUTHOR_SNM, ts.AUTHOR_ONM, ts.CREATED_ON_CREATED_TM,
      positions.latitude, positions.longitude
      from tracking_log_speed as tls
      join tracking_sapDocs as ts on ts.DOKNR = tls.sapDocs
      join tracking_transport as tt on tt.sap = tls.sapDocs
      join positions on positions.id = tls.position  
      where tls.speed > 20 and tls.dt > '${m0}' and tls.dt < '${m1}'
      group by speed, sapDocs
      order by dt desc;
    `
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [rows] = await mysqlConnection.query(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    for (let i = 0; i < rows.length; i++) {
      rows[i].dt = M(rows[i].dt).format('YYYY.MM.DD HH:mm:ss')
      ret.push(rows[i])
    }
    socket.emit('log_get_speed_date', ret)
  } catch (e) {
    console.log(e)
    socket.emit('log_get_speed_date', e)
  }
}

const logGetCardDataID = async function (socket, mysqlConnection, data) {
  try {
    let s
    if (data.prefix === 'stops30') {
      s = `
      select tracking_log_stops.position as id,
      sapDocs, positions.deviceid as device, fixtime as dt, latitude, longitude, speed, attributes,
      entry, departure, active, attach, unattach, DOCTYPE, NAME_DRVR, AUTO_MARKA, AUTO_NOMER, VALID_DATE_FROM,
      VALID_DATE_TO, INIT_PNM, INIT_SNM, INIT_ONM, AUTHOR_PNM, AUTHOR_SNM, AUTHOR_ONM, CREATED_ON_CREATED_TM
      from tracking_log_stops
      join positions on positions.id = tracking_log_stops.position
      join tracking_transport on tracking_transport.sap = tracking_log_stops.sapDocs
      join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_log_stops.sapDocs
      where tracking_log_stops.position = '${data.id}'
      group by fixtime
      order by tracking_log_stops.position desc
      limit 500;`
    } else {
      s = `
      select tls.id, tls.device, tls.sapDocs, tls.dt, tls.speed, tls.position, tt.entry, tt.departure, tt.active, tt.attach, tt.unattach,
      ts.DOCTYPE, ts.NAME_DRVR, ts.AUTO_MARKA, ts.AUTO_NOMER, ts.VALID_DATE_FROM, ts.VALID_DATE_TO,
      ts.INIT_PNM, ts.INIT_SNM, ts.INIT_ONM, ts.AUTHOR_PNM, ts.AUTHOR_SNM, ts.AUTHOR_ONM, ts.CREATED_ON_CREATED_TM,
      positions.latitude, positions.longitude
      from tracking_log_speed as tls
      join tracking_sapDocs as ts on ts.DOKNR = tls.sapDocs
      join tracking_transport as tt on tt.sap = tls.sapDocs
      join positions on positions.id = tls.position  
      where tls.id = '${data.id}'
      group by speed, sapDocs
      order by dt desc;`
    }
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [rows] = await mysqlConnection.query(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    rows[0].dt = M(rows[0].dt).format('YYYY.MM.DD HH:mm:ss')
    socket.emit('log_get_cardData_id', rows[0])
  } catch (e) {
    console.log(e)
    socket.emit('log_get_cardData_id', e)
  }
}

module.exports = {
  logWriterSpeed: logWriterSpeed,
  logWriterStops: logWriterStops,
  constr: function (socket, mysqlConnection) {
    socket.on('log_get_speed_date', async (data) => {
      logGetSpeedDate(socket, mysqlConnection, data)
    })
    socket.on('log_get_cardData_id', async (data) => {
      logGetCardDataID(socket, mysqlConnection, data)
    })
  }
}
