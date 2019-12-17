<template>
  <div class="Report2Index">
    <div id="report2map"></div>
    <backToIndex />
    <Driver />
    <router-view></router-view>
  </div>
</template>

<script>
import S from '@/store'
import Driver from './Driver'
import DriverDT from './DriverDT'
import { mapGetters } from 'vuex'
import backToIndex from '../backToIndex'
export default {
  name: 'Report1Index',
  components: {
    Driver,
    DriverDT,
    backToIndex
  },
  mounted () {
    S.dispatch('initMapReport2')
  },
  watch: {
    report2Data: function (val, oldVal) {
      if (val.error !== undefined) {
        console.log(val.error)
      } else if (val.track.length === 0) {
        this.$alert('За выбранный промежуток времени, данных нет', 'Информация', {
          confirmButtonText: 'OK',
          callback: action => {}
        })
      } else {
        S.dispatch('report2DrawReport', val)
      }
    }
  },
  computed: {
    ...mapGetters(['report2Data'])
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#report2map {
  width: 100%;
  height: 100%;
  z-index: 0;
}
.Report2Index {
  position: absolute;
  z-index: 1000;
  width: 100%;
  height: 100%;
}
.goToRoot {
  position: absolute;
  z-index: 2000;
  top: 10px;
  right: 10px;
}
</style>
