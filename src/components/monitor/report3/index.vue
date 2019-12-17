<template>
    <div class="Report3Index">
      <div id="report3map"></div>
      <el-card class="components">
        <div slot="header">
          <el-row type="flex" justify='center'><h4 style="margin: 0px !important;">Таблица пропусков за дату</h4></el-row>
        </div>
        <SelectDate />
        <Table style="margin-top: 10px;" />
        <backToIndex class="backToIndex"/>
      </el-card>
    </div>
</template>

<script>
import S from '@/store'
import SelectDate from './SelectDate'
import Table from './Table'
import backToIndex from '../backToIndex'
export default {
  name: 'report3Index',
  components: { SelectDate, Table, backToIndex },
  beforeRouteEnter (to, from, next) {
    try {
      if (from.matched[0].name !== 'Report1' && from.matched[0].name !== 'Report2') {
        S.commit('report3Clear')
      }
    } catch (e) {
      S.commit('report3Clear')
    }
    next()
  },
  mounted () {
    S.dispatch('initMapReport3')
  }
}
</script>

<style scoped>
  #report3map {
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .Report3Index {
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 100%;
  }
  .components {
    position: absolute;
    z-index: 1000;
    top: 10px;
    left: 10px;
    width: 800px;
  }
  .backToIndex {
    top: 7px !important;
    right: 10px !important;
    left: auto !important;
  }
</style>
