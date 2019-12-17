<template>
  <div class="Report1Index">
    <div id="reportmap"></div>
    <backToIndex />
    <CurrentInfo class="CurrentInfoOnreport" />
    <ReportDocs />
    <router-view></router-view>
  </div>
</template>

<script>
import S from '@/store'
import ReportDocs from './ReportDocs'
import CurrentInfo from '../CurrentInfo'
import backToIndex from '../backToIndex'
export default {
  name: 'Report1Index',
  components: {
    ReportDocs,
    CurrentInfo,
    backToIndex
  },
  mounted () {
    S.dispatch('initMapReport')
    S.dispatch('removeReportOnMap')
    S.commit('currentInfo', [])
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#reportmap {
  width: 100%;
  height: 100%;
  z-index: 0;
}
.Report1Index {
  position: absolute;
  z-index: 1000;
  width: 100%;
  height: 100%;
}
.CurrentInfoOnreport {
  position: absolute;
  z-index: 5000 !important;
}
</style>
