<template>
  <div class="DriverDT" v-if="$route.params.NAME_DRVR.length > -1">
    <el-card class="box-card">
      <div slot="header">
        <h4 style="margin: 0px !important;">Шаг 2/2. Выбор даты и времени для водителя<br/>{{ $route.params.NAME_DRVR }}</h4>
      </div>
      <el-row>
        <el-col :span="6"><el-button @click="cancel" icon='el-icon-arrow-left'>Отмена</el-button></el-col>
        <el-col :span="18">
          <el-date-picker
            v-model="d"
            type="datetimerange"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 100%;" />
        </el-col>
        <el-col :span="24"><el-button style="margin-top: 8px; width: 100%;" @click="doit">Построить отчет</el-button></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import M from 'moment'
import R from '@/router'
export default {
  name: 'DateTime',
  data () {
    return {
      d: [],
      criticalspeed: 20
    }
  },
  mounted () {
    this.d = [
      M(
        this.$route.params.date1.replaceAll('D', ':').replaceAll('P', '.'),
        'YYYY.MM.DD HH:mm:ss'
      ),
      M(
        this.$route.params.date2.replaceAll('D', ':').replaceAll('P', '.'),
        'YYYY.MM.DD HH:mm:ss'
      )
    ]
  },
  methods: {
    cancel () {
      S.dispatch('removeReport2OnMap')
      R.go(-1)
    },
    doit () {
      S.dispatch('report2searchDriverDate', {
        sap: this.$route.params.DOKNR,
        date1: M(this.d[0]).format('YYYY.MM.DD HH:mm:ss'),
        date2: M(this.d[1]).format('YYYY.MM.DD HH:mm:ss'),
        NAME_DRVR: this.$route.params.NAME_DRVR,
        track: [],
        stops: [],
        info: [],
        criticalspeed: this.criticalspeed
      })
    }
  }
}
</script>

<style scoped>
.DriverDT {
  position: absolute;
  z-index: 4000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
