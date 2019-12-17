<template>
  <div class="ClearTrack">
    <el-button @click="clear" v-if="s.getters.currentTrackOnMap.length > 0"><i class="el-icon-view"/> Скрыть трек</el-button>
  </div>
</template>

<script>
import S from '@/store'
export default {
  name: 'ClearTrack',
  data () {
    return {
      s: S
    }
  },
  methods: {
    clear () {
      this.$confirm(
        'Трек будет удален с карты. Продолжить?',
        'Внимание',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Отмена',
          type: 'warning'
        }
      )
        .then(() => {
          this.s.dispatch('clearCurrentTrack')
          this.$message({
            type: 'success',
            message: 'Трек успешно удален с карты'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Действие отменено'
          })
        })
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
.ClearTrack1 {
  position: absolute;
  z-index: 1000;
  top: 58px;
  right: 10px;
}
</style>
