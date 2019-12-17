const helpers = require('./helpers')
const M = require('moment')
const express = require('express')
const compression = require('compression')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql2/promise')
const connect = require('./connect')
const config = require('./config')
const currentInfo = require('./currentInfo')
const log = require('./log')
const cors = require('cors')

app.use(bodyParser.json())
app.use(compression())
app.use(cors())

const path = require('path')
app.use(express.static(path.join(__dirname, '../dist')))

// добавим роутер для api без сокетов
let router = express.Router()
require('./pathfinder')(app, config, router)

// роутер для vuejs
router.get('*', (req, res, next) => {
  if (req.originalUrl.indexOf('/api/')) {
    next()
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  }
})
app.use(router)

let mysqlConnection
const server = app.listen(config.port, async () => {
  mysqlConnection = await mysql.createConnection(config.mysqlConfig)
  console.log('mysql connected')
  console.log('Server started at port ' + config.port)
})

const io = require('socket.io').listen(server)

var usersConnected = 0
io.on('connection', (socket) => {
  usersConnected++
  console.log(new M().format('YYYY.MM.DD HH:mm:ss') + ' ::: user connected. ip: ' + socket.handshake.address + ' total connected user(s): ' + usersConnected)
  socket.on('disconnect', () => {
    usersConnected--
    console.log(new M().format('YYYY.MM.DD HH:mm:ss') + ' ::: user disconnected. ip: ' + socket.handshake.address + ' total connected user(s): ' + usersConnected)
  })

  // socket.on('sapDocs', async (data) => {
  //   sapDocs()
  // })
  //
  // socket.on('devices', async (data) => {
  //   devices()
  // })
  //
  // socket.on('move', async (data) => {
  //   move()
  // })

  // формируем список пропусков для отчета по имени водителя
  socket.on('reportbyname', async (name) => {
    let s = `SELECT * FROM tracking_sapDocs
    JOIN tracking_transport on tracking_transport.sap = tracking_sapDocs.DOKNR
    WHERE tracking_sapDocs.NAME_DRVR LIKE '${name}%'`
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [results, fields] = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    io.emit('reportbyname', {sapDeviceidList: results})
  })

  require('./report1')(socket, mysqlConnection)
  require('./report2')(socket, mysqlConnection)
  require('./report3')(socket, mysqlConnection)
  require('./allowedStops')(socket, mysqlConnection)
  require('./allowedRoads')(socket, mysqlConnection)
  require('./elem')(socket, mysqlConnection)
  connect.constr(socket, mysqlConnection)
  currentInfo.constr(socket, mysqlConnection)
  log.constr(socket, mysqlConnection)
})

const move = async () => {
  console.log('move started')
  if (queue.indexOf('move') < 0) {
    queue.push('move')
    try {
      const select = `
      SELECT traccar.tc_positions.deviceid, traccar.tc_positions.latitude, traccar.tc_positions.longitude, speed*1.852 as speed, traccar.tracking_sapDocs.NAME_DRVR as driver, sap, entry, departure, active, traccar.tracking_sapDocs.AUTO_NOMER as autoNumber, traccar.tracking_sapDocs.VALID_DATE_FROM as validFrom, traccar.tracking_sapDocs.VALID_DATE_TO as validTo, attach, traccar.tc_positions.id as position
      FROM traccar.tc_positions
      inner join traccar.tracking_transport on traccar.tracking_transport.deviceid = traccar.tc_positions.deviceid
      join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_transport.sap
      where traccar.tc_positions.id in (select max(id) from traccar.tc_positions group by traccar.tc_positions.deviceid)
      and traccar.tracking_transport.active = 1 and traccar.tracking_transport.departure is NULL;
    `
      const select2 = `SELECT traccar.tc_positions.deviceid, traccar.tc_positions.latitude, traccar.tc_positions.longitude, speed*1.852 as speed, traccar.tracking_sapDocs.NAME_DRVR as driver, sap, entry, departure, active, traccar.tracking_sapDocs.AUTO_NOMER as autoNumber, traccar.tracking_sapDocs.VALID_DATE_FROM as validFrom, traccar.tracking_sapDocs.VALID_DATE_TO as validTo, attach, traccar.tc_positions.id as position
    FROM traccar.tc_positions
    inner join traccar.tracking_transport on traccar.tracking_transport.deviceid = traccar.tc_positions.deviceid
    join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_transport.sap
    where traccar.tc_positions.id in (select max(id) from traccar.tc_positions group by traccar.tc_positions.deviceid)
    and traccar.tracking_transport.active = 1 and traccar.tracking_transport.departure is not NULL;`
      /* eslint-disable */
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${select}`)
      const [onElem, fields] = await mysqlConnection.execute(select)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${select}`)
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${select2}`)
      const [outElem, fields2] = await mysqlConnection.execute(select2)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${select2}`)
      /* eslint-enable */
      var devices = await helpers.deviceCreator(onElem)
      const devices2 = await helpers.deviceCreator(outElem)
      for (var g = 0; g < devices2.length; g++) {
        devices.push(devices2[g])
      }
      io.emit('move', {devices: devices})
      queue.splice('move', 1)
      log.logWriterSpeed(devices, mysqlConnection)
      console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` move data sened`)
    } catch (e) {
      console.error(e)
      console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` move error`)
      io.emit('move', {error: e.message})
      queue.splice('move', 1)
    }
  }
}

const sapDocs = async () => {
  if (queue.indexOf('sapDocs') < 0) {
    queue.push('sapDocs')
    console.log('sapDocs started')
    var res = await mysqlConnection.query('select * from traccar.tracking_sapDocs_current_state')
    io.emit('sapDocs', {sapDocs: res[0]})
    // if (usersConnected > 0) {
    connect.connectSapdocs(mysqlConnection) // тут мы отправляем актуальные данные на /cu
    // }
    console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` sap data sened`)
    queue.splice('sapDocs', 1)
  }
}

const devices = async () => {
  if (queue.indexOf('devices') < 0) {
    queue.push('devices')
    console.log('devices started')
    try {
      const s1 = `SELECT *, traccar.tc_devices.id as deviceid
    FROM traccar.tc_devices
    join traccar.tracking_transport on traccar.tracking_transport.deviceid = traccar.tc_devices.id and traccar.tracking_transport.active = 1
    join traccar.tracking_sapDocs on traccar.tracking_sapDocs.DOKNR = traccar.tracking_transport.sap
    where traccar.tc_devices.id in (select deviceid from traccar.tracking_transport where active = 1);`

      const s2 = `SELECT *, traccar.tc_devices.id as deviceid
    FROM traccar.tc_devices
    where id not in (select deviceid from traccar.tracking_transport where active = 1);`
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
      const [rows] = await mysqlConnection.execute(s1)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      const [rows2] = await mysqlConnection.execute(s2)

      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      const devices = await helpers.deviceCreator(rows)
      const devices2 = []
      for (let k = 0; k < rows2.length; k++) {
        devices2.push(rows2[k])
      }
      io.emit('devices', {devicesInUse: devices, devicesFree: devices2})
      console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` devices data sened`)
      queue.splice('devices', 1)
    } catch (e) {
      console.error(M().format('YYYY.MM.DD HH:mm:ss') + ` devices error`)
      console.error(e)
      io.emit('devices', {error: e.message})
      queue.splice('devices', 1)
    }
  }
}

const checkEntryDeparture = async () => {
  if (queue.indexOf('checkEntryDeparture') < 0) {
    queue.push('checkEntryDeparture')
    console.log('checkEntryDeparture started')
    const sElem = 'select polygon_json from tracking_elem limit 1'
    // получение координат всех прикрепленных и активных устройств
    const s1 = `SELECT
              tracking_transport.deviceid, tc_positions.latitude, tc_positions.longitude, tracking_transport.entry, tracking_transport.departure
              FROM tracking_transport
              inner join tc_devices on tc_devices.id = tracking_transport.deviceid
              inner join tc_positions on tc_positions.id = tc_devices.positionid
              WHERE active = 1;`
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
    const [devices] = await mysqlConnection.execute(s1)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${sElem}`)
    let [elem] = await mysqlConnection.execute(sElem)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${sElem}`)
    elem = JSON.parse(elem[0].polygon_json)
    let elemArr = []
    for (let f = 0; f < elem.length; f++) {
      elemArr.push([elem[f].lat, elem[f].lng])
    }
    // проверка на территории ли датчик
    for (let i = 0; i < devices.length; i++) {
      let isEntryVAR = helpers.isEntry([devices[i].latitude, devices[i].longitude], elemArr)
      // console.log('deviceid ' + devices[i].deviceid + ' isEntry: ' + isEntryVAR)
      if (isEntryVAR && devices[i].entry === null && devices[i].departure === null) {
        // на территории, то есть попал на территорию только что
        const u1 = `UPDATE traccar.tracking_transport 
                  SET entry = now() 
                  where deviceid = ` + devices[i].deviceid + ' and active = 1;'
        // не лочим ибо нет смысла
        mysqlConnection.execute(u1)
      } else if (!isEntryVAR && devices[i].entry !== null && devices[i].departure === null) {
        // не на территории, то есть покинул территорию
        const u2 = `UPDATE traccar.tracking_transport 
                  SET departure = now()
                  where deviceid = ` + devices[i].deviceid + ' and active = 1;'
        // не лочим ибо нет смысла
        mysqlConnection.execute(u2)
      }
    }
    queue.splice('checkEntryDeparture', 1)
  }
}

const isInAllowedStop = async () => {
  if (queue.indexOf('isInAllowedStop') < 0) {
    queue.push('isInAllowedStop')
    console.log('isInAllowedStop started')
    // -------------------------------------------------------------------------
    // чистим от записей вида "точка" // надо как-то делать на клиенте!!!
    // выборка всех полигонов
    const sS = 'select * from tracking_allowedStops'
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${sS}`)
    const [polygons] = await mysqlConnection.execute(sS)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${sS}`)
    for (let a = 0; a < polygons.length; a++) {
      let json = JSON.parse(polygons[a].polygon_json)
      if (json.length === 0 || json.length === 1) {
      // не лочим ибо нет смысла
        mysqlConnection.execute('DELETE FROM tracking_allowedStops WHERE id=' + polygons[a].id)
      }
    }
    // -------------------------------------------------------------------------

    // все устройства и их разрешенные места стоянки
    const s2 = `SELECT
              tracking_transport.deviceid, tc_positions.latitude, tc_positions.longitude, tracking_allowedStops.polygon_json as allowedStops, tc_positions.id as position, sap,tracking_transport.id
              FROM tracking_transport
              inner join tc_devices on tc_devices.id = tracking_transport.deviceid
              inner join tc_positions on tc_positions.id = tc_devices.positionid
              join tracking_transport_stops on tracking_transport_stops.tracking_transport_id = tracking_transport.id
              join tracking_allowedStops on tracking_allowedStops.id = tracking_transport_stops.tracking_allowedStops_id
              WHERE active = 1;`
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
    let [devsWithStops] = await mysqlConnection.execute(s2)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
    for (let g = 0; g < devsWithStops.length; g++) {
      let json = JSON.parse(devsWithStops[g].allowedStops)
      let polygonArray = []
      for (let d = 0; d < json.length; d++) {
        polygonArray.push([json[d].lat, json[d].lng])
      }
      devsWithStops[g].allowedStops = polygonArray
    }
    let preRet = {}
    for (let i = 0; i < devsWithStops.length; i++) {
      if (preRet[devsWithStops[i].deviceid] !== true) {
        preRet[devsWithStops[i].deviceid] = false
        for (let j = 0; j < devsWithStops.length; j++) {
          if (devsWithStops[i].deviceid === devsWithStops[j].deviceid) {
            let is = await helpers.точкаНаходитсяВМногоугольнике(
              [devsWithStops[j].latitude, devsWithStops[j].longitude],
              devsWithStops[j].allowedStops
            )
            if (is) {
              preRet[devsWithStops[i].deviceid] = true
              break
            }
          }
        }
      } else {
        preRet[devsWithStops[i].deviceid] = true
      }
    }
    let keys = Object.keys(preRet)
    let notificationMapJson = []
    for (let i = 0; i < keys.length; i++) {
      notificationMapJson.push({deviceid: parseInt(keys[i]), isAllowedStop: preRet[keys[i]]})
    }
    log.logWriterStops(devsWithStops, notificationMapJson, mysqlConnection)
    io.emit('isInAllowedStop', notificationMapJson)
    queue.splice('isInAllowedStop', 1)
  }
}

const logGetSpeed = async () => {
  if (queue.indexOf('logGetSpeed') < 0) {
    queue.push('logGetSpeed')
    console.log('logGetSpeed started')
    try {
      let ret = []
      const s = `
      select tls.id, tls.device, tls.sapDocs, tls.dt, tls.speed, tls.position, tt.entry, tt.departure, tt.active, tt.attach, tt.unattach,
      ts.DOCTYPE, ts.NAME_DRVR, ts.AUTO_MARKA, ts.AUTO_NOMER, ts.VALID_DATE_FROM, ts.VALID_DATE_TO,
      ts.INIT_PNM, ts.INIT_SNM, ts.INIT_ONM, ts.AUTHOR_PNM, ts.AUTHOR_SNM, ts.AUTHOR_ONM, ts.CREATED_ON_CREATED_TM,
      tc_positions.latitude, tc_positions.longitude
      from tracking_log_speed as tls
      join tracking_sapDocs as ts on ts.DOKNR = tls.sapDocs
      join tracking_transport as tt on tt.sap = tls.sapDocs
      join positions on tc_positions.id = tls.position  
      where tls.speed > 20  
      and fixtime > NOW() - INTERVAL 1 DAY
      group by speed, sapDocs
      order by dt desc
      limit 100
    `
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      for (let i = 0; i < rows.length; i++) {
        rows[i].dt = M(rows[i].dt).format('YYYY.MM.DD HH:mm:ss')
        ret.push(rows[i])
      }
      io.emit('log_get_speed', ret)
      queue.splice('logGetSpeed', 1)
    } catch (e) {
      io.emit('log_get_speed', e)
      queue.splice('logGetSpeed', 1)
    }
  }
}

const logGetStops = async () => {
  if (queue.indexOf('logGetStops') < 0) {
    queue.push('logGetStops')
    console.log('logGetStops started')
    try {
      const s = `
    select tracking_log_stops.position as id,
    sapDocs, tc_positions.deviceid as device, fixtime as dt, latitude, longitude, speed, attributes,
    entry, departure, active, attach, unattach, DOCTYPE, NAME_DRVR, AUTO_MARKA, AUTO_NOMER, VALID_DATE_FROM,
    VALID_DATE_TO, INIT_PNM, INIT_SNM, INIT_ONM, AUTHOR_PNM, AUTHOR_SNM, AUTHOR_ONM, CREATED_ON_CREATED_TM
    from tracking_log_stops
    join positions on tc_positions.id = tracking_log_stops.position
    join tracking_transport on tracking_transport.sap = tracking_log_stops.sapDocs
    join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_log_stops.sapDocs
    where tc_positions.fixtime > now() - INTERVAL 30 MINUTE
    group by fixtime
    order by tracking_log_stops.position desc
    limit 500;
    `
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rows] = await mysqlConnection.execute(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      for (let i = 0; i < rows.length; i++) {
        rows[i].entry = M(rows[i].entry).format('YYYY.MM.DD HH:mm:ss')
        rows[i].departure = M(rows[i].departure).format('YYYY.MM.DD HH:mm:ss')
        rows[i].attach = M(rows[i].attach).format('YYYY.MM.DD HH:mm:ss')

        rows[i].dt = M(rows[i].dt).format('YYYY.MM.DD HH:mm:ss')

        rows[i].VALID_DATE_FROM = M(rows[i].VALID_DATE_FROM).format('YYYY.MM.DD HH:mm:ss')
        rows[i].VALID_DATE_TO = M(rows[i].VALID_DATE_TO).format('YYYY.MM.DD HH:mm:ss')
        rows[i].CREATED_ON_CREATED_TM = M(rows[i].CREATED_ON_CREATED_TM).format('YYYY.MM.DD HH:mm:ss')
      }
      io.emit('log_get_stops', rows)
      queue.splice('logGetStops', 1)
    } catch (e) {
      io.emit('log_get_stops', e)
      queue.splice('logGetStops', 1)
    }
  }
}

var queue = []
setTimeout(() => setInterval(sapDocs, 3000), 2000)
setTimeout(() => setInterval(devices, 3250), 2000)
setTimeout(() => setInterval(move, 3500), 3000)
setTimeout(() => setInterval(checkEntryDeparture, 3750), 3500)
setTimeout(() => setInterval(isInAllowedStop, 4000), 3600)
setTimeout(() => setInterval(logGetSpeed, 4250), 3700)
setTimeout(() => setInterval(logGetStops, 4500), 3800)

//
// schedule.scheduleJob('* * * * * *', move)
// schedule.scheduleJob('* * * * * *', sapDocs)
// schedule.scheduleJob('* * * * * *', devices)
// schedule.scheduleJob('* * * * * *', checkEntryDeparture)
// schedule.scheduleJob('* * * * * *', isInAllowedStop)
// schedule.scheduleJob('* * * * * *', logGetSpeed)
// schedule.scheduleJob('* * * * * *', logGetStops)
