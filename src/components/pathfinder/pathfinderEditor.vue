<template>
  <div>
    <div id="mappatheditor"/>
    <el-card class="pathfinderEditor">
      <div slot="header" class="clearfix">
        <span>Редактор дорог: {{actionText}}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click = "save">Сохранить</el-button>
      </div>
      <el-tabs type="card">
        <el-tab-pane label="Работа с узлами и связями">
          <el-button @click = "selector('addNodes', 'Добавить узел')" :disabled="action === 'addNodes'">Добавить узел</el-button>
          <el-button @click = "selector('addLinks', 'Соединить узлы')" :disabled="action === 'addLinks'">Соединить узлы</el-button>
          <el-button @click = "selector('rmNodesOrLinks', 'Удалить узлы или связи')" :disabled="action === 'rmNodesOrLinks'">Удалить узлы или связи</el-button>
        </el-tab-pane>
        <el-tab-pane label="Работа с метками">
          <div style="padding-bottom: 10px;">
            <el-button @click = "selector('addPoint', 'Установить метку конечной точки')" :disabled="action === 'addPoint'">Установить метку конечной точки</el-button>
            <el-button @click = "selector('rmPoint', 'Снять метку конечной точки')" :disabled="action === 'rmPoint'">Снять метку конечной точки</el-button>
          </div>
          <el-input placeholder="Ввидите сюда имя конечной точки" v-model="endPoint.endPointName" :disabled="action !== 'addPoint'">
            <template slot="prepend" >Имя конечной точки:</template>
          </el-input>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <back />
  </div>
</template>

<script>
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import uniqid from 'uniqid'
import nggraph from '@/g.js'
import helper from './helper.js'
import back from '@/components/back'
var map
export default {
  name: 'pathfinderEditor',
  components: { back },
  data () {
    return {
      action: '',
      actionText: 'Выберите действие',
      graph: nggraph(),
      polylines: [],
      markers: [],
      saveArray: [],
      start: [], // исходные данные, пришедшие с сервера
      tmpId: null,
      endPoint: {
        exists: false,
        endPointName: ''
      }
    }
  },
  async mounted () {
    map = L.map('mappatheditor').setView([56.96105930170542, 60.57539042144521], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    map.on('click', this.onMapClick)
    let res = await axios.get(`${this.$config.api}/api/pathfinder/path`)
    if (res.status === 200) {
      this.start = res.data
      await helper.firstLoadOrClear(this, map)
    } else {
      // ошибка
      console.log(res)
    }
  },
  methods: {
    selector (act, actionText) {
      this.actionText = actionText
      this.action = act
      this.fromNode = null
      this.toNode = null
    },
    onMapClick (e) {
      if (this.action === 'addNodes') {
        var id = uniqid() + uniqid() + uniqid() + uniqid() + uniqid()
        this.tmpId = id
        var currentObject = L.marker(e.latlng,
          {
            icon: helper.icon,
            userData: {
              type: 'marker',
              name: id
            }
          }
        )
        currentObject.addTo(map)
        currentObject.on('click', this.onMarkerClick)
        this.markers.push(currentObject)
        this.graph.addNode(id, {x: e.latlng.lat, y: e.latlng.lng, endPoint: this.endPoint})
        this.start.push(JSON.parse(JSON.stringify(this.graph.getNode(id))))
      }
    },
    onMarkerClick (e) {
      this.endPoint.exists = false // необходимо для того, чтобы при создании нод они не были всегда с меткой
      if (this.action === 'addLinks') {
        this.addLinks(e)
      } else if (this.action === 'rmNodesOrLinks') {
        this.rmNodesOrLinks(e)
      } else if (this.action === 'addPoint') {
        this.addPoint(e)
      } else if (this.action === 'rmPoint') {
        this.rmPoint(e)
      }
    },
    addPoint (e) {
      this.endPoint.exists = true
      var id = e.target.options.userData.name
      var self = this
      this.graph.forEachNode(node => {
        if (id === node.id) {
          node.data.endPoint = self.endPoint
        }
      })
      for (let i = 0; i < this.start.length; i++) {
        if (this.start[i].id === id) {
          this.start[i] = JSON.parse(JSON.stringify(this.graph.getNode(id)))
        }
      }
      helper.firstLoadOrClear(this, map)
    },
    rmPoint (e) {
      var id = e.target.options.userData.name
      this.graph.forEachNode(node => {
        if (id === node.id) {
          delete node.data.endPoint
        }
      })
      helper.firstLoadOrClear(this, map)
    },
    rmNodesOrLinks (e) {
      if (e.target.options.userData.type === 'marker') {
        this.rmTargetMarker(e.target)
      } else if (e.target.options.userData.type === 'polyline') {
        this.rmTargetPolyline(e.target)
      }
    },
    rmTargetMarker (target) { // удаляем целевой маркер с карты и линии, которые с ним связаны
      var newPolylines = []
      const tarName = target.options.userData.name.toString()
      for (var i = 0; i < this.markers.length; i++) {
        if (tarName === this.markers[i].options.userData.name) {
          var node = Object.assign({}, this.graph.getNode(tarName))
          this.graph.removeNode(tarName)
          for (var v = 0; v < this.start.length; v++) {
            if (this.start[v].id === tarName) {
              this.start.remove(v)
              break
            }
          }
          target.remove()
          this.markers.remove(i)
          for (var k = 0; k < this.polylines.length; k++) {
            for (var h = 0; h < node.links.length; h++) {
              if (this.polylines[k].options.userData.name === node.links[h].id) {
                this.polylines[k].remove()
                // this.polylines.remove(k)
                // break
              } else {
                newPolylines.push(this.polylines[k])
              }
            }
          }
          break
        }
      }
      this.polylines = newPolylines
    },
    rmTargetPolyline (target) { // удаляем целевую линию с карты
      var newPolylines = [] // массив будущих линий
      var tarPolylineName = target.options.userData.name.toString() // алиас имени цели
      for (var i = 0; i < this.polylines.length; i++) { // через сквозное обращение к переменной содержащей текущие линии строим цикл
        var thiPolylineName = this.polylines[i].options.userData.name.toString() // псевдоним для каждой текущей линии цикла
        if (tarPolylineName === thiPolylineName) { // при совпадении будем...
          try {
            var linksForRm = [] // массив линков для удаления
            this.graph.forEachLink((link) => { // ... бежать по всем линкам в графе, которые на карте отображены как линии
              if (link.id.toString() === thiPolylineName) { // при совпадении ид...
                linksForRm.push(link) // ... закидывем линк в массив для дальнейшего удаления
              }
            })
            linksForRm.forEach(it => { // бежим по всем линкам массива...
              this.graph.removeLink(it) // и удаляем линки
            })
          } catch (e) {
            console.log(e) // выведем пользователю ошибку в консоль если вдруг что
          }
          target.remove() // удаляем целевую линию с карты
        } else {
          newPolylines.push(this.polylines[i]) // добавляем линию в новый массив если ее не требуется удалять
        }
      }
      this.polylines = newPolylines // заменили старый масси новым
    },
    addLinks (e) {
      if (this.fromNode === null) {
        this.fromNode = e.target
        this.fromNode.setIcon(helper.iconChecked)
      } else if (e.target.options.userData.name === this.fromNode.options.userData.name) {
        this.fromNode.setIcon(helper.icon)
        this.fromNode = null
      } else {
        this.toNode = e.target // дублируем, но пусть будет
        this.graph.addLink(this.fromNode.options.userData.name, this.toNode.options.userData.name)
        for (let i = 0; i < this.start.length; i++) {
          if (this.fromNode.options.userData.name === this.start[i].id) {
            this.start[i] = JSON.parse(JSON.stringify(this.graph.getNode(this.fromNode.options.userData.name)))
          } else if (this.toNode.options.userData.name === this.start[i].id) {
            this.start[i] = JSON.parse(JSON.stringify(this.graph.getNode(this.toNode.options.userData.name)))
          }
        }
        var polyline = L.polyline(
          [this.fromNode.getLatLng(), this.toNode.getLatLng()],
          {
            userData: {
              name: `${this.fromNode.options.userData.name} ~ ${this.toNode.options.userData.name}`,
              type: 'polyline'
            }
          }
        ).addTo(map)
        polyline.on('click', this.onMarkerClick)
        this.polylines.push(polyline)
        this.fromNode.setIcon(helper.icon)
        this.fromNode = null
        this.toNode = null
        helper.firstLoadOrClear(this, map)
      }
    },
    async save () {
      var saveArray = []
      async function saveFormatter (self) {
        self.graph.forEachNode(node => {
          if (node.data.endPoint !== undefined) {
            console.log(node.data.endPoint)
          }
          saveArray.push(node)
        })
      }
      await saveFormatter(this)
      const res = await axios.post(`${this.$config.api}/api/pathfinder/path`, saveArray)
      if (res.status === 200) {
        let res = await axios.get(`${this.$config.api}/api/pathfinder/path`)
        if (res.status === 200) {
          this.start = res.data
          await helper.firstLoadOrClear(this, map)
          this.$message({
            message: 'Сохранение выполнено успешно',
            type: 'success'
          })
        } else {
          // ошибка
          console.log(res)
        }
      } else {
        this.$message.error('Ошибка сохранения')
        console.log(res)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#mappatheditor {
  position: absolute;
  top: 0px;
  left: 0px;
  min-width: 100%;
  min-height: 100%;
}
.pathfinderEditor {
  position: absolute;
  z-index: 2000;
  top: 10px;
  left: 10px;
  width: 560px;
}
</style>
