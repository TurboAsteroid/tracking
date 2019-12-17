<template>
  <div class='goToRoot'>
    <el-button @click="back" type="default">На главную</el-button>
  </div>
</template>

<script>
import S from '@/store'
import R from '@/router'
export default {
  name: 'back',
  methods: {
    back () {
      S.commit('allowedRoadsPolylines', [])
      S.commit('allowedRoads', [])
      S.commit('allowedRoadsMap', null)
      R.push('/')
    }
  }
}
</script>

<style scoped>
  .goToRoot {
    position: absolute;
    z-index: 2000;
    top: 10px;
    right: 10px;
  }
</style>
