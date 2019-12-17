const M = require('moment')
module.exports = {
  mysqlRealEscapeString: function (str) {
    str = str.replace(/\0/g, '\\0')
    str = str.replace(/\n/g, '\\n')
    str = str.replace(/\r/g, '\\r')
    str = str.replace(/\032/g, '\\Z')
    // eslint-disable-next-line
    str = str.replace(/([\'\"]+)/g, '\\$1')
    return str
  },
  deviceCreator: (rows) => {
    let devices = []
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].attach !== null && rows[i].attach !== undefined) {
        rows[i].attach = M(rows[i].attach).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].attach = M().format('YYYY.MM.DD HH:mm:ss')
      }
      if (rows[i].entry !== null && rows[i].entry !== undefined) {
        rows[i].entry = M(rows[i].entry).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].entry = 'нет въезда'
      }
      if (rows[i].departure !== null && rows[i].departure !== undefined) {
        rows[i].departure = M(rows[i].departure).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].departure = 'нет выезда'
      }
      if (rows[i].VALID_DATE_FROM !== null && rows[i].VALID_DATE_FROM !== undefined) {
        rows[i].VALID_DATE_FROM = M(rows[i].VALID_DATE_FROM).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].VALID_DATE_FROM = 'не указано'
      }
      if (rows[i].VALID_DATE_TO !== null && rows[i].VALID_DATE_TO !== undefined) {
        rows[i].VALID_DATE_TO = M(rows[i].VALID_DATE_TO).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].VALID_DATE_TO = 'не указано'
      }
      if (rows[i].CREATED_ON_CREATED_TM !== null && rows[i].CREATED_ON_CREATED_TM !== undefined) {
        rows[i].CREATED_ON_CREATED_TM = M(rows[i].CREATED_ON_CREATED_TM).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].CREATED_ON_CREATED_TM = 'не указано'
      }
      if (rows[i].unattach !== null && rows[i].unattach !== undefined) {
        rows[i].unattach = M(rows[i].unattach).format('YYYY.MM.DD HH:mm:ss')
      } else {
        rows[i].unattach = 'не указано'
      }
      devices.push(rows[i])
    }
    return devices
  },
  isEntry: function (point, p) {
    return точкаНаходитсяВМногоугольнике(point, p)
  },
  // deprecated
  // TODO: попробовать тут использовать функцию leaflet
  calculateTheDistance: async function (φA, λA, φB, λB) {
    // Радиус земли
    var EARTH_RADIUS = 6372795
    var M_PI = 3.14159265359
    // перевести координаты в радианы
    var lat1 = φA * M_PI / 180
    var lat2 = φB * M_PI / 180
    var long1 = λA * M_PI / 180
    var long2 = λB * M_PI / 180

    // косинусы и синусы широт и разницы долгот
    var cl1 = Math.cos(lat1)
    var cl2 = Math.cos(lat2)
    var sl1 = Math.sin(lat1)
    var sl2 = Math.sin(lat2)
    var delta = long2 - long1
    var cdelta = Math.cos(delta)
    var sdelta = Math.sin(delta)

    // вычисления длины большого круга
    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2))
    var x = sl1 * sl2 + cl1 * cl2 * cdelta

    //
    var ad = Math.atan2(y, x)
    var dist = ad * EARTH_RADIUS

    return dist
  },
  deltaPoint: async function (p1, p2) {
    let retPoint = {
      latitude: Math.abs(p1.latitude + p2.latitude) / 2,
      longitude: Math.abs(p1.longitude + p2.longitude) / 2
    }
    retPoint.tmin = p1.tmin
    retPoint.tmax = p2.tmax
    return retPoint
  },
  colors: [
    '#001f3f',
    '#0074D9',
    '#7FDBFF',
    '#39CCCC',
    '#3D9970',
    '#2ECC40',
    '#01FF70',
    '#FFDC00',
    '#FF851B',
    '#FF4136',
    '#85144b',
    '#F012BE',
    '#B10DC9',
    '#111111',
    '#AAAAAA',
    '#DDDDDD',
    '#AC80A0',
    '#614250',
    '#642287',
    '#3E1929',
    '#6E75A8',
    '#B0DAF1',
    '#273C2C',
    '#626868',
    '#939196',
    '#D3C1D2',
    '#FFE2FE',
    '#210B2C',
    '#BC96E6',
    '#D8B4E2',
    '#BD4089',
    '#683257',
    '#42213D',
    '#CF5C36',
    '#EFC88B',
    '#A5CCD1',
    '#5C7AFF',
    '#4A8FE7',
    '#59D2FE',
    '#44E5E7',
    '#73FBD3',
    '#E71D36',
    '#FF9F1C',
    '#2EC4B6',
    '#011627'
  ],
  точкаНаходитсяВМногоугольнике: (point, p) => {
    return точкаНаходитсяВМногоугольнике(point, p)
  }
}

// проверяем расположение точки
// (слева от вектора, справа от вектора, или принадлежит вектору)
function classify (vector, x1, y1) {
  var pr = (vector.x2 - vector.x1) * (y1 - vector.y1) -
    (vector.y2 - vector.y1) * (x1 - vector.x1)
  if (pr > 0) { return 1 }
  if (pr < 0) { return -1 }
  return 0
}
// классифицируем ребро (Касается, пересекает или безразлично)
function edgeType (vector, a) {
  switch (classify(vector, a.x, a.y)) {
    case 1:
      return ((vector.y1 < a.y) && (a.y <= vector.y2)) ? 1 : 2
    case -1:
      return ((vector.y2 < a.y) && (a.y <= vector.y1)) ? 1 : 2
    case 0:
      return 0
  }
}

// основной алгоритм, который проверяет принадлежность точки к многоугольнику
function pointInPolygon (point, pol) {
  var parity = 0
  var v
  for (var i = 0; i < pol.length - 1; i++) {
    v = {
      'x1': pol[i][0],
      'y1': pol[i][1],
      'x2': pol[i + 1][0],
      'y2': pol[i + 1][1]
    }
    switch (edgeType(v, point)) {
      case 0:
        return 2
      case 1:
        parity = 1 - parity
        break
    }
  }
  v = {
    'x1': pol[pol.length - 1][0],
    'y1': pol[pol.length - 1][1],
    'x2': pol[0][0],
    'y2': pol[0][1]
  }
  switch (edgeType(v, point)) {
    case 0:
      return 2
    case 1:
      parity = 1 - parity
      break
  }
  return parity
}

const точкаНаходитсяВМногоугольнике = (point, p) => {
  point = {
    'x': point[0],
    'y': point[1]
  }
  var checkP = pointInPolygon(point, p)
  if (checkP === 0) {
    // Точка лежит вне многоугольника
    return false
  } else if (checkP === 1) {
    // Точка лежит в многоугольнике
    return true
  } else {
    // Точка лежит на грани многоугольника
    return true
  }
}
