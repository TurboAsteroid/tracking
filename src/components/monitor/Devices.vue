<template>
  <div class="DevicesTag" v-if="adding.sapDocN.length !== 0">
    <el-card class="box-card">
      <div slot="header">
        <el-row :gutter="4" style="margin: 0px !important;">
          <el-col :span="22" style="margin: 0px !important;"><h3 style="margin: 0px !important;">Прикрепить к пропуску №{{parseInt(adding.sapDocN)}} трекер</h3></el-col>
          <el-col :span="2" type='flex' justify='end' align='end' style="margin: 0px !important;"><el-button type='text' style="padding: 0px; margin: 0px !important;" icon='el-icon-arrow-down' @click="show=!show"/></el-col>
        </el-row>
      </div>
      <el-row :gutter="4">
          <el-col :span="6"><el-button @click="cancel" icon='el-icon-arrow-left'>Отмена</el-button></el-col>
          <el-col :span="4" style="padding-top: 12px;">Маршрут:</el-col>
          <el-col :span="14"><AttachRoadsListTag style="width: 100%; margin-bottom: 4px;"/></el-col>
        </el-row>
      <p v-if="adding.road === ''">Здесь будет: Список самых используемых маршрутов</p>
      <span v-if="show && adding.road !== ''">
        <el-row>
        <el-col :span="24" style="margin-bottom: 4px;">
          <el-input placeholder="введите сюда номер трекера или номер пропуска или ФИО" v-model="filter" style="" :autofocus='true'>
            <template slot="prepend"><i class="el-icon-search"/> Поиск:</template>
          </el-input>
        </el-col>
        </el-row>
        <el-col type='flex' align='center' v-if="d.length <= 0"><h3>Трекеры отсутствуют</h3></el-col>
        <el-row v-for="device in d" :key='device.deviceid' v-if="d.length > 0" :gutter="4" style="margin-top: 4px; margin-bottom: 4px;">
          <el-col :span="18"><el-button border style="width: 100%;" @click="check(device.deviceid)">{{device.deviceid}} - {{device.name}}</el-button></el-col>
          <el-col :span="6" type='flex' justify='end' align='end' v-if="adding.deviceN == device.deviceid && adding.road !== ''"><el-button @click="attach" type='primary'>Прикрепить</el-button></el-col>
        </el-row>
      </span>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
import AttachRoadsListTag from './AttachRoadsList'
export default {
  name: 'Devices',
  components: {
    AttachRoadsListTag
  },
  data () {
    return {
      filter: '',
      d: [],
      show: true
    }
  },
  mounted () {
    S.dispatch('loadAllDevices')
  },
  methods: {
    cancel () {
      S.commit('adding', { sapDocN: '', deviceN: '', road: '' })
      S.commit('setPair', { id: -1, sap: -1 })
    },
    attach () {
      this.$confirm(
        'Трекер ' +
          this.adding.deviceN +
          ' и маршрут ' + this.adding.road + ' будет прикреплены к пропуску ' +
          parseInt(this.adding.sapDocN) +
          '. Продолжить?',
        'Внимание',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Отмена',
          type: 'warning'
        }
      )
        .then(() => {
          S.dispatch('attachDeviceToSapDoc')
          S.dispatch('loadAllDevices')
          S.commit('adding', { sapDocN: '', deviceN: '', road: '' })
          this.$message({
            type: 'success',
            message: 'Трекер успешно прикреплен к пропуску'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Действие отменено'
          })
        })
    },
    check (id) {
      S.commit('addingDeviceN', id)
    }
  },
  watch: {
    filter: function () {
      this.d = []
      this.devices.devicesFree.forEach(function (i) {
        if (
          i.name
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.deviceid
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1
        ) {
          this.d.push(i)
        }
      }, this)
    },
    devices: function () {
      this.d = []
      this.devices.devicesFree.forEach(function (i) {
        if (
          i.name
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1 ||
          i.deviceid
            .toString()
            .toLowerCase()
            .indexOf(this.filter.toString().toLowerCase()) > -1
        ) {
          this.d.push(i)
        }
      }, this)
    }
  },
  computed: {
    ...mapGetters(['devices', 'adding'])
  }
}
</script>

<style scoped>
.DevicesTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
