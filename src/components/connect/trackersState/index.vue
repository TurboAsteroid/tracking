<template>
  <div>
    <el-container>
      <el-header>
        <h4>Состояние всех трекеров в системе
          <el-button style="float: right; padding: 3px 0" icon="el-icon-refresh" type="text" @click="refresh">Обновить</el-button></h4>
      </el-header>
      <el-row type="flex" justify="space-around">
        <el-col :span="8"><h4 style="margin: 0px !important;">Номер трекера</h4></el-col>
        <el-col :span="8"><h4 style="margin: 0px !important;">Уровень заряда батареи</h4></el-col>
        <el-col :span="8"><h4 style="margin: 0px !important;">Время обновления состояния</h4></el-col>
      </el-row>
      <el-row type="flex" justify="space-around" v-for="i in connectTrackersStateDevicesBatteryLevel" :key="i.deviceid" class="borderEl">
        <el-col :span="8">{{i.deviceid}}</el-col>
        <el-col :span="8">
          <i class="el-icon-success" v-if="i.batteryLevel >= 80" style="color: #2ECC40"></i>
          <i class="el-icon-warning" v-if="i.batteryLevel < 80 && i.batteryLevel > 40" style="color: #FF851B"></i>
          <i class="el-icon-error" v-if="i.batteryLevel <= 40" style="color: #FF4136"></i>
             {{i.batteryLevel}} %
        </el-col>
        <el-col :span="8">
        {{i.fixtime}}
        </el-col>
      </el-row>
    </el-container>
  </div>
</template>

<script>
import router from '@/router'
import { mapGetters } from 'vuex'
export default {
  name: 'trackersState',
  mounted () {
  },
  methods: {
    refresh () {
      this.$socket.emit('devices')
    }
  },
  watch: {
    // здесь важно написать function иначе this.$socket.emit андифайнед
    devices: function (val, oldVal) {
      if (router.history.current.fullPath === '/cu') {
        let devicesIds = []
        for (let i = 0; i < val.devicesFree.length; i++) {
          devicesIds.push(val.devicesFree[i].deviceid)
        }
        for (let i = 0; i < val.devicesInUse.length; i++) {
          devicesIds.push(val.devicesInUse[i].deviceid)
        }
        this.$socket.emit('connect_trackesStateBatteryLevel', devicesIds)
      }
    }
  },
  computed: {
    ...mapGetters({
      devices: 'devices',
      connectTrackersStateDevicesBatteryLevel: 'connectStore/connectTrackersStateDevicesBatteryLevel'
    })
  }
}
</script>

<style scoped>
.borderEl {
  border: gray solid 1px;
  border-radius: 3px;
  margin-top: 6px;
  margin-bottom: 6px;
  padding: 6px;
}
</style>
