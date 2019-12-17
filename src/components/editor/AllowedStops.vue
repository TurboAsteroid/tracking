<template>
  <div class="AllowedStopsMapTag">
    <div id="divAllowedStopsMapTag"></div>
    <StopsListTag />
    <div class='goToRoot'>
      <el-button @click="back" type="default">На главную</el-button>
    </div>
  </div>
</template>

<script>
import S from '@/store'
import R from '@/router'
import StopsListTag from './StopsList'
export default {
  name: 'AllowedStops',
  components: {
    StopsListTag
  },
  mounted () {
    S.dispatch('initAllowedStopsMap')
    S.dispatch('AllowedStopsLoad')
  },
  methods: {
    save () {
      S.dispatch('AllowedStopsSave')
    },
    back () {
      S.commit('allowedStopsNewName', '')
      S.commit('allowedStopsAllowNew', false)
      S.commit('allowedStops', [])
      S.commit('allowedStopsMap', null)
      S.commit('allowedStopsPolygons', [])
      R.push('/')
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#divAllowedStopsMapTag {
  width: 100%;
  height: 100%;
}
.AllowedStopsMapTag {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
}
.layout {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.goToRoot {
  position: absolute;
  z-index: 2000;
  top: 10px;
  right: 10px;
}
</style>
