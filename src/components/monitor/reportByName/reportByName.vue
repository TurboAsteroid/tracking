<template>
    <div>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                Отчет по водителю
                <el-button @click="$router.push('/monitor')" style="position: absolute; z-index: 4100; top: 7px; right: 7px">Назад</el-button>
            </div>
            <el-row :gutter="4">
                <el-col :span="18"><el-input placeholder="введите сюда фамилию водителя" v-model="filter" @keyup.enter.native="search" :autofocus='true' /></el-col>
                <el-col :span="6">
                    <el-button @click="search" style="float: right;"><i class="el-icon-search"/> Поиск</el-button>
                </el-col>
            </el-row>
            <el-collapse accordion>
                <el-collapse-item v-for="(item, i) in sapDeviceidList" :key="i" :name="i" :title="M(item.attach || M()).format('HH:mm:ss YYYY.MM.DD') +` - `+ M(item.unattach || M()).format('HH:mm:ss YYYY.MM.DD')">
                    <div>Номер трекера: {{item.deviceid}}</div>
                    <div>Номер пропуска в SAP ERP: {{item.sap}}</div>
                    <div>ФИО водителя: {{item.NAME_DRVR}}</div>
                    <div>Время выдачи трекера: {{M(item.attach || M()).format('HH:mm:ss YYYY.MM.DD')}}</div>
                    <div>Время изъятия трекера: {{M(item.unattach || M()).format('HH:mm:ss YYYY.MM.DD')}}</div>
                    <div>Документ удост. личность: {{item.DOCTYPE}}</div>
                    <div>Марка автомобиля: {{item.AUTO_MARKA}}</div>
                    <div>Гос. номер автомобиля: {{item.AUTO_NOMER}}</div>
                    <div>Начало действия: {{M(item.VALID_DATE_FROM).format('YYYY.MM.DD')}}</div>
                    <div>Окончание действия: {{M(item.VALID_DATE_TO).format('YYYY.MM.DD')}}</div>
                    <div>Направляется к сотруднику, должность, подразделение: {{item.INIT_PNM}}, {{item.INIT_SNM.toString().toLocaleLowerCase()}}, {{item.INIT_ONM.toString().toLocaleLowerCase()}}</div>
                    <div>Пропуск введен сотрудником, должность, подразделение: {{item.AUTHOR_PNM}}, {{item.AUTHOR_SNM.toString().toLocaleLowerCase()}}, {{item.AUTHOR_ONM.toString().toLocaleLowerCase()}}</div>
                    <div>Дата и время создания пропуска: {{M(item.CREATED_ON_CREATED_TM).format('HH:mm:ss YYYY.MM.DD')}}</div>
                    <el-button @click="buildReport(item.attach || M(), item.unattach || M(), item.deviceid)" border style="width: 100%;" type="primary">Построить отчет</el-button>
                </el-collapse-item>
            </el-collapse>
        </el-card>
        <div class="index" id="map"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import moment from 'moment'
const options = {
  auth: {
    username: 'admin',
    password: 'admin'
  }
}
function pad (num) {
  return ('0' + num).slice(-2)
}
function hhmmss (secs) {
  var minutes = Math.floor(secs / 60)
  secs = secs % 60
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  return `${pad(hours)}ч ${pad(minutes)}м ${pad(secs)}с`
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}
export default {
  name: 'reportByName',
  data () {
    return {
      M: moment,
      filter: '',
      devices: [],
      positions: [],
      map: null,
      report: [],
      stops: [],
      objects: []
      /*
        * {
        * marker
        * path
        * lastPos
        * device
        * cur_drawed_path
        * }
        * */
    }
  },
  methods: {
    search () {
      // this.$store.dispatch('report2searchDriverLike', this.filter)
      this.$socket.emit('reportbyname', this.filter)
    },
    async get () {
      this.clear()
      this.devices = (await axios.get('http://10.1.255.208:9999/api/devices', options)).data
      this.positions = (await axios.get('http://10.1.255.208:9999/api/positions', options)).data
      this.draw_objects()
    },
    draw_objects () {
      let self = this
      this.positions.forEach(function (pos) {
        self.devices.forEach(function (dev) {
          if (dev.id === pos.deviceId) {
            self.objects.push(
              {
                marker: self.$l.marker([pos.latitude, pos.longitude]).addTo(self.map)
                  .bindPopup(`${dev.name}`),
                path: [],
                lastPos: pos,
                device: dev,
                cur_drawed_path: null
              }
            )
          }
        })
      })
      this.draw_objects_path()
    },
    draw_objects_path () {
      for (let j = 0; j < this.objects.length; j++) {
        try {
          this.map.removeLayer(this.objects[j].cur_drawed_path)
        } catch (e) {
          console.log(`cur_drawed_path пока еще пуст ${e}`)
        }
        this.objects[j].cur_drawed_path = this.$l.polyline(this.objects[j].path, {color: 'red'}).addTo(this.map)
      }
    },
    clear () {
      let self = this
      this.objects.forEach(function (item) {
        try {
          self.map.removeLayer(item.marker)
          self.map.removeLayer(item.cur_drawed_path)
        } catch (e) {
          console.log(`невозможно удалить один из объектров или его путь ${e}`)
        }
      })
      try {
        self.map.removeLayer(this.report)
      } catch (e) {
        console.log(`невозможно удалить отчет ${e}`)
      }
      this.objects = []
      this.devices = []
      this.positions = []
      this.stops.forEach(function (it) {
        self.map.removeLayer(it)
      })
    },
    async push_positions () {
      this.positions = (await axios.get('http://10.1.255.208:9999/api/positions', options)).data
      for (let i = 0; i < this.positions.length; i++) {
        for (let j = 0; j < this.objects.length; j++) {
          if (this.objects[j].device.id === this.positions[i].deviceId) {
            if (this.objects[j].path.length >= 10) {
              this.objects[j].path.remove(0, 0)
            }
            this.objects[j].path.push([this.positions[i].latitude, this.positions[i].longitude])
            this.objects[j].marker.setLatLng([this.positions[i].latitude, this.positions[i].longitude])
            this.objects[j].lastPos = this.positions[i]
          }
        }
      }
      this.draw_objects_path()
    },
    async report_today () {
      this.report = []
      console.log(Date())
      let report = (await axios.get('http://10.1.255.208:9999/api/reports/route?deviceId=2&from=2019-06-27T08:45:00Z&to=2019-06-28T12:00:00Z', options)).data
      let stops = (await axios.get('http://10.1.255.208:9999/api/reports/stops?deviceId=2&from=2019-06-27T08:45:00Z&to=2019-06-28T12:00:00Z', options)).data
      let reportData = []
      report.forEach(function (dot) {
        reportData.push([dot.latitude, dot.longitude])
      })
      this.report = this.$l.polyline(reportData, {color: 'red'}).addTo(this.map)
      for (let i = 0; i < stops.length; i++) {
        this.stops.push(this.$l.marker([stops[i].latitude, stops[i].longitude]))
      }
    },
    timer_action () {
      if (this.objects.length > 0) {
        this.push_positions()
      }
    },
    async buildReport (attach, unattach, deviceId) {
      const loading = this.$loading({
        lock: true,
        text: 'Загрузка'
      })
      let t1 = this.M(attach, 'YYYY-MM-DD HH:mm:ss').toISOString()
      let t2 = this.M(unattach, 'YYYY-MM-DD HH:mm:ss').toISOString()
      this.report = []
      let report = (await axios.get(`http://10.1.255.208:9999/api/reports/route?deviceId=${deviceId}&from=${t1}&to=${t2}`, options)).data
      let stops = (await axios.get(`http://10.1.255.208:9999/api/reports/stops?deviceId=${deviceId}&from=${t1}&to=${t2}`, options)).data
      let reportData = []
      report.forEach(function (dot) {
        reportData.push([dot.latitude, dot.longitude])
      })
      this.report = this.$l.polyline(reportData, {color: 'red'}).addTo(this.map)
      for (let i = 0; i < stops.length; i++) {
        this.stops.push(this.$l.marker([stops[i].latitude, stops[i].longitude]).bindTooltip(`Время стоянки ${hhmmss(stops[i].duration)}`).addTo(this.map))
      }
      this.$alert('Отчет построен', 'Выполнено', {
        confirmButtonText: 'OK',
        callback: () => loading.close()
      })
    }
  },
  mounted () {
    this.map = this.$l.map('map', {zoomControl: false}).setView([56.96, 60.57], 15)
    this.$l.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: `Tracking3 v.${this.$app_version}`,
      id: 'mapbox.streets'
    }).addTo(this.map)
    this.$l.control.zoom({
      position: 'topright'
    }).addTo(this.map)
    try {
      // this.get()
      // setInterval(this.timer_action, 3000)
    } catch (e) {
      console.log(`произошла неведомая хуйня; ${e} `)
    }
  },
  computed: {
    ...mapGetters({sapDeviceidList: 'getSapDeviceidList'})
  }
}
</script>

<style>
    .index {
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
    }
    .box-card {
        width: 480px;
        margin: 10px;
        position: absolute;
        z-index: 999;
    }
</style>
