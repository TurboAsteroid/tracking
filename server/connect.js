const M = require('moment')
const helpers = require('./helpers')
const log = require('./log')

const connectAllowstops = async (socket, mysqlConnection) => {
  try {
    const s = 'select * from tracking_allowedStops'
    // eslint-disable-next-line
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const rows = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    socket.emit('connect_allowstops', rows[0])
  } catch (err) {
    console.error(err)
    socket.emit('connect_allowstops', err)
  }
}

const connectSapdocs = async function (socket, mysqlConnection) {
  try {
    let json = (await mysqlConnection.query(`SELECT * FROM traccar.tracking_sapDocs_current_state`))[0]
    socket.emit('connect_sapdocs', json)
  } catch (e) {
    socket.emit('connect_sapdocs', e)
    console.log(e)
  }
}

const connectTrackersByTimer = async (socket, json) => {
  try {
    socket.emit('connect_trackers', json)
  } catch (e) {
    console.error(e)
    socket.emit('connect_trackers', e)
  }
}

const connectAttach = async (socket, mysqlConnection, data) => {
  try {
    // {
    //   currentStep,
    //   step1: {
    //     doknr
    //   },
    //   step2: {
    //     polygonsId
    //   },
    //   step3: {
    //     trackerId
    //   }
    // }
    // привязываем трекер к пропуску
    const s1 = `INSERT INTO traccar.tracking_transport (deviceid, sap, attach, active) 
                  VALUES (` + data.step3.trackerId + ', ' + data.step1.doknr + ', now(), 1);'
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
    await mysqlConnection.execute(s1)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s1}`)
    // присязываем разрешенное место стоянки
    for (let i = 0; i < data.step2.polygonsId.length; i++) {
      var s2 = `INSERT INTO tracking_transport_stops 
      (tracking_transport_id, tracking_allowedStops_id) 
      VALUES (
        (
        select id from tracking_transport where sap = ${parseInt(data.step1.doknr)} order by id desc limit 1
        ), ${data.step2.polygonsId[i]});`
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
      await mysqlConnection.execute(s2)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
    }
    connectTrackers(socket, mysqlConnection)
    connectActiveInfo(socket, mysqlConnection)
    socket.emit('connect_attach', { status: 200 })
  } catch (e) {
    console.error(e)
    socket.emit('connect_attach', { status: 500, error: e })
  }
}

const connectActiveInfo = async (socket, mysqlConnection) => {
  try {
    // тормозит
    // const s_OLD = `SELECT tc_positions.deviceid, tc_positions.latitude, tc_positions.longitude, tracking_sapDocs.NAME_DRVR, sap as DOKNR, tc_positions.attributes
    //   FROM tc_positions
    //   join tracking_transport on tracking_transport.deviceid = tc_positions.deviceid
    //   join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_transport.sap
    //   where tc_positions.id in (select max(id) from tc_positions group by tc_positions.deviceid)
    //   and tracking_transport.active = 1;`
    // значительно быстрее
    const s = `
         select * from
     (
     select traccar.tc_positions.deviceid, traccar.tc_positions.latitude, traccar.tc_positions.longitude, traccar.tc_positions.attributes
     from tc_positions
     join 
     (
     select * from tracking_transport
      join tracking_sapDocs on tracking_sapDocs.DOKNR = tracking_transport.sap
      where tracking_transport.active = 1
     ) as t0 on t0.deviceid = tc_positions.deviceid
     where tc_positions.id in (select max(id) from tc_positions group by tc_positions.deviceid)
     ) as t1
     group by deviceid
    `
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [ tracker ] = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    console.error('ВЕРНУТЬ НА КЛИЕНТА connect_activeInfo')
    socket.emit('connect_activeInfo', tracker)
  } catch (e) {
    console.error(e)
    socket.emit('connect_activeInfo', e)
  }
}

const connectEditAllowstops = async (socket, mysqlConnection) => {
  try {
    const s = `SELECT *
        FROM traccar.tracking_allowedStops
        LEFT JOIN
        (
          SELECT traccar.tracking_allowedStops.id as idA, traccar.tracking_transport_stops.tracking_transport_id
          FROM traccar.tracking_allowedStops
          JOIN traccar.tracking_transport_stops on traccar.tracking_transport_stops.tracking_allowedStops_id = traccar.tracking_allowedStops.id
          JOIN traccar.tracking_transport on traccar.tracking_transport.id = traccar.tracking_transport_stops.tracking_transport_id and traccar.tracking_transport.active = 1
          JOIN traccar.tracking_sapDocs ON traccar.tracking_sapDocs.DOKNR = traccar.tracking_transport.sap
        )as A on A.idA = traccar.tracking_allowedStops.id
        order by tracking_transport_id desc;`
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    let [ rows ] = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].tracking_transport_id !== null) {
        rows[i].active = 1
      } else {
        rows[i].active = 0
      }
    }
    socket.emit('connect_editAllowstops', rows)
  } catch (err) {
    console.error(err)
    socket.emit('connect_editAllowstops', err)
  }
}

const connectEditSave = async (socket, mysqlConnection, data) => {
  try {
    // подразумевается, что у data[0].tracking_transport_id всегда есть значение
    let clear = 'DELETE FROM traccar.tracking_transport_stops WHERE tracking_transport_id=' + data[0].tracking_transport_id + '; '
    let insertUpdate = ''
    for (let i = 0; i < data.length; i++) {
      if (data[i].active === 1) {
        insertUpdate += 'INSERT INTO tracking_transport_stops (tracking_transport_id,' +
          'tracking_allowedStops_id)' +
          'VALUES (' + data[0].tracking_transport_id + ', ' + data[i].id + ') ' +
          'ON DUPLICATE KEY UPDATE tracking_transport_id = ' + data[0].tracking_transport_id +
          ', tracking_allowedStops_id = ' + data[i].id + '; '
      }
    }
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${clear + insertUpdate}`)
    await mysqlConnection.query(clear + insertUpdate)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${clear + insertUpdate}`)
    socket.emit('connect_editSave', { status: 200 })
    connectEditAllowstops(socket, mysqlConnection)
  } catch (err) {
    console.error(err)
    socket.emit('connect_editSave', { status: 500, error: err })
  }
}

const connectUnattach = async (socket, mysqlConnection, deviceid) => {
  try {
    let u
    const s = 'select departure from traccar.tracking_transport where deviceid = ' + deviceid + ' and active = 1;'
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [ rows ] = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    if (rows[0].departure === null) {
      // если не выехал и его сейчас открепят
      u = 'UPDATE traccar.tracking_transport SET unattach = now(), departure = now(), active = 0 where deviceid = ' + deviceid + ' and active = 1;'
    } else {
      // если выехал и его сейчас открепят
      u = 'UPDATE traccar.tracking_transport SET unattach = now(), active = 0 where deviceid = ' + deviceid + ' and active = 1;'
    }
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${u}`)
    await mysqlConnection.execute(u)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${u}`)
    connectTrackers(socket, mysqlConnection)
    connectActiveInfo(socket, mysqlConnection)
    socket.emit('connect_unattach', { status: 200 })
  } catch (error) {
    console.error(error)
    socket.emit('connect_unattach', { status: 500, error: error })
  }
}

const connectTrackers = async (socket, mysqlConnection) => {
  try {
    const s2 = `SELECT *, traccar.tc_devices.id as deviceid
      FROM traccar.tc_devices
      where id not in (select deviceid from traccar.tracking_transport where active = 1);`
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
    const [ rows ] = await mysqlConnection.execute(s2)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s2}`)
    socket.emit('connect_trackers', rows)
  } catch (error) {
    console.error(error)
    socket.emit('connect_trackers', { status: 500, error: error })
  }
}

const connectBatteryLevel = async (socket, mysqlConnection, deviceid) => {
  try {
    const s = `
                SELECT traccar.tc_positions.id, traccar.tc_positions.deviceid, traccar.tc_positions.\`attributes\`
                  FROM traccar.tc_positions
                  where traccar.tc_positions.deviceid = ` + deviceid + `
                  order by traccar.tc_positions.id desc
                  limit 10;
              `
    // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    const [rows] = await mysqlConnection.execute(s)
    // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
    let batteryLevel = -1
    for (let i = 0; i < rows.length; i++) {
      let current = rows[i].attributes
      current = JSON.parse(current)
      if (current.batteryLevel !== undefined) {
        batteryLevel = current.batteryLevel
        break
      }
    }
    socket.emit('connect_batteryLevel', batteryLevel)
  } catch (error) {
    console.error(error)
    socket.emit('connect_batteryLevel', { status: 500, error: error })
  }
}

const connectTrackesStateBatteryLevel = async (socket, mysqlConnection, deviceIds) => {
  try {
    let s = ''
    for (let i = 0; i < deviceIds.length; i++) {
      s += `
SELECT traccar.tc_positions.id, traccar.tc_positions.deviceid, traccar.tc_positions.\`attributes\`, traccar.tc_positions.fixtime
FROM traccar.tc_positions
where traccar.tc_positions.deviceid = ` + deviceIds[i] + `
order by traccar.tc_positions.id desc
limit 10;
      `
    }
    if (s !== '') {
      // console.log(`${Date()} НАЧАЛО ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      const [rowsOfRows] = await mysqlConnection.query(s)
      // console.log(`${Date()} КОНЕЦ ВЫПОЛНЕНИЯ ЗАПРОСА: ${s}`)
      let json = []
      for (let i = 0; i < rowsOfRows.length; i++) {
        for (let j = 0; j < rowsOfRows[i].length; j++) {
          try {
            if ((JSON.parse(rowsOfRows[i][j].attributes)).batteryLevel !== undefined) {
              json.push({
                deviceid: rowsOfRows[i][j].deviceid,
                batteryLevel: (JSON.parse(rowsOfRows[i][j].attributes)).batteryLevel,
                fixtime: rowsOfRows[i][j].fixtime
              })
              break
            }
          } catch (e) {
            console.log('небольшая ошибочка в connectTrackesStateBatteryLevel')
          }
        }
      }
      socket.emit('connect_trackesStateBatteryLevel', json)
    }
  } catch (error) {
    console.error(error)
    socket.emit('connect_trackesStateBatteryLevel', { status: 500, error: error })
  }
}






const move = async (socket, mysqlConnection) => {
  console.warn('move started')
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
    socket.emit('move', {devices: devices})
    log.logWriterSpeed(devices, mysqlConnection)
    console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` move data sened`)
  } catch (e) {
    console.error(e)
    console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` move error`)
    socket.emit('move', {error: e.message})
  }
}

const sapDocs = async (socket, mysqlConnection) => {
  console.warn('sapDocs started')
  var res = await mysqlConnection.query('select * from traccar.tracking_sapDocs_current_state')
  socket.emit('sapDocs', {sapDocs: res[0]})
  console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` sap data sened`)
}

const devices = async (socket, mysqlConnection) => {
  console.warn('devices started')
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
    socket.emit('devices', {devicesInUse: devices, devicesFree: devices2})
    console.log(M().format('YYYY.MM.DD HH:mm:ss') + ` devices data sened`)
  } catch (e) {
    console.error(M().format('YYYY.MM.DD HH:mm:ss') + ` devices error`)
    console.error(e)
    socket.emit('devices', {error: e.message})
  }
}

const checkEntryDeparture = async () => {
  console.warn('checkEntryDeparture started')
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
}

const isInAllowedStop = async () => {
  console.warn('isInAllowedStop started')
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
}

const logGetSpeed = async () => {
  console.warn('logGetSpeed started')
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
  } catch (e) {
    io.emit('log_get_speed', e)
  }
}

const logGetStops = async () => {
  console.warn('logGetStops started')
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
  } catch (e) {
    io.emit('log_get_stops', e)
  }
}





var socketLocal
module.exports = {
  constr: function (socket, mysqlConnection) {
    socketLocal = socket
    socket.on('connect_sapdocs', async () => {
      connectSapdocs(socket, mysqlConnection)
    })
    socket.on('connect_trackers', async () => {
      connectTrackers(socket, mysqlConnection)
    })
    socket.on('connect_attach', async (data) => {
      connectAttach(socket, mysqlConnection, data)
    })
    socket.on('connect_activeInfo', async () => {
      connectActiveInfo(socket, mysqlConnection)
    })
    socket.on('connect_unattach', async (data) => {
      connectUnattach(socket, mysqlConnection, data)
    })
    socket.on('connect_editAllowstops', async () => {
      connectEditAllowstops(socket, mysqlConnection)
    })
    socket.on('connect_allowstops', async () => {
      connectAllowstops(socket, mysqlConnection)
    })
    socket.on('connect_editSave', async (data) => {
      connectEditSave(socket, mysqlConnection, data)
    })
    socket.on('connect_batteryLevel', async (data) => {
      connectBatteryLevel(socket, mysqlConnection, data)
    })
    socket.on('connect_trackesStateBatteryLevel', async (data) => {
      connectTrackesStateBatteryLevel(socket, mysqlConnection, data)
    })
    socket.on('sapDocs', async (data) => {
      sapDocs(socket, mysqlConnection)
    })
    socket.on('devices', async (data) => {
      devices(socket, mysqlConnection)
    })
    socket.on('move', async (data) => {
      move(socket, mysqlConnection)
    })
  },
  connectSapdocs: function (mysqlConnection) {
    connectSapdocs(socketLocal, mysqlConnection)
  },
  connectTrackers: function (json) {
    connectTrackersByTimer(socketLocal, json)
  }
}
