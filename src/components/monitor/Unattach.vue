<template>
  <div class="UnattachTag">
    <el-card class="box-card">
      <div slot="header">
        <el-row :gutter="4" style="margin: 0px !important;">
          <el-col :span="22" style="margin: 0px !important;"><h3 style="margin: 0px !important;">Все прикрепленные трекеры</h3></el-col>
        </el-row>
      </div>
      <span v-if="show">
        <el-input placeholder="введите сюда номер трекера" v-model="filter" class="pl-black"/>
        <el-row type="flex" justify='center'><h3 style="margin-bottom: 0px !important;" v-if="devicesLocal.length <= 0">Трекеры отсутствуют</h3></el-row>
        <el-row v-for="device in devicesLocal" :key='device.deviceid' v-if="devicesLocal.length > 0" :gutter="4">
          <el-button border style="width: 100%; margin-top: 8px;" v-bind:class="{'el-button--primary': device.deviceid === pair.id}" @click="check(device.deviceid, device.DOKNR)">{{device.deviceid}} - {{device.name}} - {{parseInt(device.DOKNR)}} - {{device.NAME_DRVR}}</el-button>
        </el-row>
      </span>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
import ClearTrack from './ClearTrack'

export default {
  name: 'Unattach',
  data () {
    return {
      filter: '',
      devicesLocal: [],
      show: true
    }
  },
  components: {
    ClearTrack
  },
  mounted () {
    this.$socket.emitPreloader('sapDocs')
    this.$socket.emitPreloader('devices')
    this.$socket.emitPreloader('move')
  },
  methods: {
    cutter (fio) {
      fio = fio.split(' ')
      if (fio.length === 3) {
        fio = fio[0] + ' ' + fio[1][0] + '.' + fio[2][0] + '.'
      } else if (fio.length === 2 && fio[1].indexOf('.') < -1) {
        fio = fio[0] + ' ' + fio[1][0] + '.'
      } else {
        fio = fio[0]
      }
      return fio
    },
    unattach () {
      this.$confirm(
        'Трекер ' +
          this.pair.id +
          ' будет откреплен от пропуска ' +
          this.pair.sap +
          '. Продолжить?',
        'Внимание',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Отмена',
          type: 'error'
        }
      )
        .then(() => {
          S.dispatch('unattachDeviceFromSapDoc', this.pair.id)
          S.commit('addingSapDocN', '')
          S.commit('addingDeviceN', '')
          S.commit('currentInfo', [])
          S.dispatch('clearCurrentTrack')
          S.commit('setPair', { id: -1, sap: -1 })
          this.$message({
            type: 'success',
            message: 'Трекер успешно откреплен от пропуска'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Действие отменено'
          })
        })
    },
    check (id, DOKNR) {
      if (this.pair.sap !== DOKNR && this.pair.id !== id) {
        S.commit('setPair', { id: id, sap: DOKNR })
      } else {
        for (var i = 0; i < S.getters.devicesOnMap.length; i++) {
          S.getters.devicesOnMap[i].setIcon(S.getters.iconUnchecked)
          S.commit('setPair', { id: -1, sap: -1 })
        }
      }
    }
  },
  watch: {
    filter: function () {
      this.devicesLocal = []
      S.getters.devices.devicesInUse.forEach(function (i) {
        if (
          i.NAME_DRVR.toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.DOKNR.toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.deviceid
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.name
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1
        ) {
          i.NAME_DRVR = this.cutter(i.NAME_DRVR)
          this.devicesLocal.push(i)
        }
      }, this)
    },
    devices: function () {
      this.devicesLocal = []
      S.getters.devices.devicesInUse.forEach(function (i) {
        if (
          i.NAME_DRVR.toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.DOKNR.toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.deviceid
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.name
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1
        ) {
          i.NAME_DRVR = this.cutter(i.NAME_DRVR)
          this.devicesLocal.push(i)
        }
      }, this)
    }
  },
  computed: {
    ...mapGetters(['devices', 'adding', 'pair'])
  }
}
</script>

<style scoped>
.box-card {
  width: 560px;
}
.UnattachTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
</style>
<style>

</style>
