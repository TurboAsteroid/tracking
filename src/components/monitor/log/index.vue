<template>
  <div>
      <div class="mainComponent">
        <h3 style="margin-left: 20px;">Основной лог</h3>
      <el-tabs type="border-card" :active-name="logActiveTab">
        <el-tab-pane name="speed24" label="СКОРОСТЬ: нарушения за последние 24 часа" :disabled="$route.name !== 'log'">
          <logDataTable style="min-height: 0px !important;" :data="logCurrentSpeed" :prefix="'_speed24'"/>
        </el-tab-pane>
        <el-tab-pane name="speedDate" label="СКОРОСТЬ: нарушения скорости за указанную дату" :disabled="$route.name !== 'log'">
          <h4 v-show="$route.name === 'log'">Лог за дату:
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="Выберите дату">
            </el-date-picker>
          </h4>
          <logDataTable style="min-height: 0px !important;" :data="logCurrentSpeedDate" :prefix="'_speedDate'" />
        </el-tab-pane>
        <el-tab-pane name="stops30" label="СТОЯНКИ: нарушения за последние 30 минут" :disabled="$route.name !== 'log'">
          <logDataTable style="min-height: 0px !important;" :data="logStops" :prefix="'_stops30'" />
        </el-tab-pane>
      </el-tabs>
      <backToIndex class="logBackToIndex" />
      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import S from '@/store'
import backToIndex from '../backToIndex'
import logDataTable from './logDataTable'
export default {
  name: 'index',
  components: { backToIndex, logDataTable },
  data () {
    return {
      selectedDate: new Date()
    }
  },
  mounted () {
    this.$socket.emit('log_get_speed_date', this.selectedDate)
  },
  watch: {
    selectedDate (val, oldVal) {
      S.commit('logStore/logCurrentSpeedDate', null)
      this.$socket.emit('log_get_speed_date', val)
    }
  },
  computed: {
    ...mapGetters({
      logCurrentSpeedDate: 'logStore/logCurrentSpeedDate',
      logCurrentSpeed: 'logStore/logCurrentSpeed',
      logStops: 'logStore/logStops',
      logActiveTab: 'logStore/logActiveTab'
    })
  }
}
</script>

<style scoped>
.mainComponent {
  position: absolute;
  z-index: 1500;
  top: 10px;
  left: 10px;
  min-width: 560px;
  background: white;
  border-radius: 4px;
}
.logBackToIndex {
  top: 9px !important;
  right: 20px !important;
  left: auto !important;
}
</style>
