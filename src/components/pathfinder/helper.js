import L from 'leaflet'

const internal = {
  cleaner (self) {
    self.endPoint = {
      exists: false,
      endPointName: ''
    }
    self.graph.forEachNode((node) => {
      self.graph.removeNode(node.id)
    })
    self.fromNode = null
    self.toNode = null
    var i
    for (i = 0; i < self.polylines.length; i++) {
      self.polylines[i].remove()
    }
    self.polylines = []
    for (i = 0; i < self.markers.length; i++) {
      self.markers[i].remove()
    }
    self.markers = []
    return self
  },
  findNode (nodeName, arrayOfNodes) {
    for (var i = 0; i < arrayOfNodes.length; i++) {
      if (arrayOfNodes[i].id === nodeName) {
        return arrayOfNodes[i]
      }
    }
  }
}

const external = {
  firstLoadOrClear (self, map, path) {
    internal.cleaner(self)
    var i
    for (i = 0; i < self.start.length; i++) {
      self.graph.addNode(self.start[i].id, self.start[i].data)
      var icon = external.icon
      if (self.start[i].data.endPoint !== undefined) {
        if (self.start[i].data.endPoint.exists === true) {
          icon = external.iconRed // тут менять иконку на красную
        }
      }
      var currentMarker = L.marker([self.start[i].data.x, self.start[i].data.y],
        {
          icon: icon,
          userData: {
            type: 'marker',
            name: self.start[i].id,
            endPoint: self.start[i].data.endPoint
          }
        }
      )
      if (self.start[i].data.endPoint !== undefined) {
        if (self.start[i].data.endPoint.exists === true && self.start[i].data.endPoint.endPointName !== '') {
          currentMarker.bindTooltip(self.start[i].data.endPoint.endPointName, { offset: L.point(0, -42), direction: 'top' })
        }
      }
      currentMarker.on('click', self.onMarkerClick)
      if (path === 'pathfinder' && self.start[i].data.endPoint !== undefined) {
        currentMarker.addTo(map)
        self.markers.push(currentMarker)
      } else if (path === undefined) {
        currentMarker.addTo(map)
        self.markers.push(currentMarker)
      }
    }
    for (i = 0; i < self.start.length; i++) {
      for (var j = 0; j < self.start[i].links.length; j++) {
        // ищем дубли
        var uniq = true // переменная используется для поиска дублей. первый элемент массива всегда уникален, поэтому тру
        if (self.polylines.length > 0) {
          for (var v = 0; v < self.polylines.length; v++) {
            if (`${self.start[i].links[j].fromId} ~ ${self.start[i].links[j].toId}` === self.polylines[v].options.userData.name ||
                `${self.start[i].links[j].toId} ~ ${self.start[i].links[j].fromId}` === self.polylines[v].options.userData.name) {
              uniq = false
              break
            }
          }
        }
        if (uniq) {
          try {
            uniq = false
            self.graph.addLink(self.start[i].links[j].fromId, self.start[i].links[j].toId)
            const fromId = internal.findNode(self.start[i].links[j].fromId, self.start)
            const toId = internal.findNode(self.start[i].links[j].toId, self.start)
            var polyline = L.polyline(
              [[fromId.data.x, fromId.data.y], [toId.data.x, toId.data.y]],
              {
                userData: {
                  name: self.start[i].links[j].id,
                  type: 'polyline'
                }
              }
            ).addTo(map)
            polyline.on('click', self.onMarkerClick)
            self.polylines.push(polyline)
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
  },
  icon: L.icon({
    iconUrl: '/static/images/marker-icon.png',
    shadowUrl: '/static/images/marker-shadow.png',
    iconAnchor: [12, 41]
  }),
  iconChecked: L.icon({
    iconUrl: '/static/images/marker-icon-checked.png',
    shadowUrl: '/static/images/marker-shadow.png',
    iconAnchor: [12, 41]
  }),
  iconRed: L.icon({
    iconUrl: '/static/images/marker-icon-red.png',
    shadowUrl: '/static/images/marker-shadow.png',
    iconAnchor: [12, 42]
  })
}

export default external
