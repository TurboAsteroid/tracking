<template>
  <div class="CurrentInfo" v-if="currentInfo.length > 0">
    <el-card class="box-card">
      <div slot="header">
        <el-row :gutter="4" style="margin: 0px !important;">
          <el-col :span="22" style="margin: 0px !important;"><h3 style="margin: 0px !important;">Информация о выбранном пропуске и трекере</h3></el-col>
        </el-row>
      </div>
      <span v-if="show">
        <el-button @click="clear" style="width: 100%; margin-bottom: 10px;"><i class="el-icon-view"/> Скрыть</el-button>
        <el-table :data='currentInfo' height="550">
          <el-table-column prop='key' label='Наименование' width="230" />
          <el-table-column prop='val' label='Значение' width="280" />
        </el-table>
      </span>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'CurrentInfo',
  data () {
    return {
      show: true
    }
  },
  methods: {
    clear () {
      for (var i = 0; i < S.getters.devicesOnMap.length; i++) {
        S.getters.devicesOnMap[i].setIcon(S.getters.iconUnchecked)
      }
      S.commit('addingSapDocN', '')
      S.commit('addingDeviceN', '')
      S.commit('currentInfo', [])
      S.dispatch('clearCurrentTrack')
      S.commit('setPair', { id: -1, sap: -1 })
    }
  },
  computed: {
    ...mapGetters(['currentInfo'])
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.CurrentInfo {
  position: absolute;
  z-index: 1800;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
