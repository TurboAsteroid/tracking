<template>
  <div>
    <div id="mappathfinder"/>
    <el-card class="pathfinder">
      <div slot="header" class="clearfix">
        <span>Поиск маршрута</span>
        <!--<el-button style="float: right; padding: 3px 0" type="text" @click = "save">Сохранить</el-button>-->
      </div>
      <div>
        <el-button @click = "startState">Исходное состояние</el-button>
        <el-button @click = "print">Распечатать</el-button>
      </div>
    </el-card>
    <back />
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-easyprint/dist/bundle.js'
import ngpath from 'ngraph.path'
import nggraph from '@/g.js'
import axios from 'axios'
import back from '@/components/back'
import helper from './helper.js'

var map
export default {
  name: 'pathfinder',
  components: { back },
  data () {
    return {
      action: 'calcPath',
      graph: nggraph(),
      fromNode: null,
      path: '',
      counter: 0,
      polylines: [],
      markers: [],
      start: [],
      printer: null
    }
  },
  async mounted () {
    map = L.map('mappathfinder').setView([56.96105930170542, 60.57539042144521], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    this.printer = L.easyPrint({ hidden: true }).addTo(map)
    let res = await axios.get(`${this.$config.api}/api/pathfinder/path`)
    if (res.status === 200) {
      this.start = res.data
      await helper.firstLoadOrClear(this, map, 'pathfinder')
    } else {
      // ошибка
      console.log(res)
    }
  },
  methods: {
    startState () {
      helper.firstLoadOrClear(this, map, 'pathfinder')
    },
    print () {
      if (this.printer !== null) {
        this.printer.printMap('CurrentSize', 'MyFileName')
      }
    },
    onMarkerClick (e) {
      this.calcPath(e)
    },
    // вычисление пути
    buildPath (path) {
      var i
      for (i = 0; i < this.markers.length; i++) {
        this.markers[i].remove()
      }
      for (i = 0; i < this.polylines.length; i++) {
        this.polylines[i].remove()
      }
      for (i = 0; i < path.length - 1; i++) {
        this.polylines.push(
          L.polyline([[path[i].data.x, path[i].data.y], [path[i + 1].data.x, path[i + 1].data.y]],
            {
              color: 'red'
            })
            .addTo(map)
        )
      }
    },
    find (fromNode, toNode) {
      var pathFinder = ngpath.aStar(this.graph, {
        distance (fromNode, toNode) {
          return map.distance(L.latLng(fromNode.data.x, fromNode.data.y), L.latLng(toNode.data.x, toNode.data.y))
        },
        heuristic (fromNode, toNode) {
          return map.distance(L.latLng(fromNode.data.x, fromNode.data.y), L.latLng(toNode.data.x, toNode.data.y))
        }
      })
      this.buildPath(pathFinder.find(fromNode, toNode)) // Это можно писать в бд для ведения статистики или писать после печати маршрута
    },
    calcPath (e) { // определяем как будет считаться путь
      if (e.target.options.userData.type === 'marker') {
        if (this.fromNode === null) { // ткнули в начальный маркер
          this.fromNode = e.target.options.userData.name // зафиксировали начальный маркер
          e.target.setIcon(helper.iconChecked) // поставили иконку начальному маркеру
        } else if (e.target.options.userData.name === this.fromNode) { // если ткнули в ту же точку
          this.startState() // сбрасываем в исходное состояние
        } else {
          this.find(this.fromNode, e.target.options.userData.name) // считаем путь
          this.fromNode = null // сбросили состояние начального маркера
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #mappathfinder {
    position: absolute;
    top: 0px;
    left: 0px;
    min-width: 100%;
    min-height: 100%;
  }
  .pathfinder {
    position: absolute;
    z-index: 2000;
    top: 10px;
    left: 10px;
  }
</style>
