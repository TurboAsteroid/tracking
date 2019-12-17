<template>
  <div>
    <div id="connectMap"></div>
    <el-tabs type="border-card" class="mainComponent" @tab-click="clearState">
      <el-tab-pane label="Выдача трекера"><attach :isActiveTab='currentTab'/></el-tab-pane>
      <el-tab-pane label="Изъятие трекера"><attached :isActiveTab='currentTab'/></el-tab-pane>
      <el-tab-pane label="Состояние трекеров"><trackersState :isActiveTab='currentTab'/></el-tab-pane>
    </el-tabs>
    <div class="msg">
      <div v-for="message in connectTrackersStateDevicesBatteryLevel" style="margin-top: 10px" :key="message.deviceid">
        <msgHelper :title='"Внимание! Трекер №" + message.deviceid + " разряжен"' :message='"Заряд трекера составляет " + message.batteryLevel + "%"' :icon="'el-icon-error'" v-if='message.batteryLevel <= 40'/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import S from '@/store'
import attach from './attach'
import attached from './attached'
import trackersState from './trackersState'
import msgHelper from './msgHelper'

export default {
  name: 'connect_index',
  components: { attach, attached, trackersState, msgHelper },
  data () {
    return {
      currentTab: 'Выдача трекера'
    }
  },
  mounted () {
    S.dispatch('connectStore/initMapConnect')
  },
  methods: {
    clearState (ev) {
      if (ev.label !== this.currentTab) {
        S.dispatch('connectStore/clearConnectMap')
        S.commit('connectStore/connectChangeTab')
      }
      this.currentTab = ev.label
    }
  },
  watch: {
  },
  computed: {
    ...mapGetters({
      connectSelectedItem: 'connectStore/connectSelectedItem',
      connectTrackersStateDevicesBatteryLevel: 'connectStore/connectTrackersStateDevicesBatteryLevel'
    })
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#connectMap {
  position: absolute;
  top: 0px;
  left: 0px;
  min-width: 100%;
  min-height: 100%;
}
.mainComponent {
  position: absolute;
  z-index: 2000;
  top: 10px;
  left: 10px;
  width: 560px;
}
.msg {
  position: absolute;
  z-index: 1000;
  bottom: 10px;
  right: 10px;
  max-height: 400px;
}
</style>
